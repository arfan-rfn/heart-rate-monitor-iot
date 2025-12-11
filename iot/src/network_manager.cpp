// network_manager.cpp - Direct HTTP to API Server
// 
// Posts measurements directly to the API server using the connection string
// defined in config.h (API_SERVER_HOST:API_SERVER_PORT)
//
// Endpoints used:
//   POST /api/measurements - Submit measurement data
//   GET  /api/devices/{deviceId}/config - Fetch device configuration
//

#include "network_manager.h"
#include "config.h"
#include "led_controller.h"
#include "state_machine.h"

extern LEDController ledController;
extern StateMachine stateMachine;

// TCP client for HTTP connections
TCPClient httpClient;

NetworkManager::NetworkManager() {
    wifiConnected = false;
    retryCount = 0;
    lastConnectionCheck = 0;
    lastConfigFetch = 0;
    configFetchPending = false;
    storageIndex = 0;
    storedCount = 0;
}

void NetworkManager::begin() {
    loadFromEEPROM();
    
    if (DEBUG_MODE) {
        Serial.println("Network Manager initialized");
        Serial.println("API Server Connection String:");
        Serial.printlnf("  http://%s:%d", API_SERVER_HOST, API_SERVER_PORT);
        Serial.println("Endpoints:");
        Serial.printlnf("  POST http://%s:%d/api/measurements", API_SERVER_HOST, API_SERVER_PORT);
        Serial.printlnf("  GET  http://%s:%d/api/devices/{id}/config", API_SERVER_HOST, API_SERVER_PORT);
        
        // Report any stored measurements from EEPROM
        int untransmitted = getUntransmittedCount();
        if (untransmitted > 0) {
            Serial.printlnf("  %d stored measurements pending sync", untransmitted);
        }
    }
    
    // Initialize lastConfigFetch to current time
    // Config is fetched explicitly in setup() on boot
    lastConfigFetch = millis();
}

void NetworkManager::update() {
    unsigned long now = millis();
    bool wasConnected = wifiConnected;
    
    if (now - lastConnectionCheck > 5000) {
        wifiConnected = WiFi.ready();
        lastConnectionCheck = now;
        
        // Detect WiFi reconnection
        if (wifiConnected && !wasConnected) {
            if (DEBUG_MODE) Serial.println("WiFi reconnected - will sync stored measurements");
        }
        
        // Sync stored measurements when connected (one at a time to avoid blocking)
        int untransmitted = getUntransmittedCount();
        if (wifiConnected && untransmitted > 0) {
            syncStoredMeasurements();
        }
    }
    
    // Periodically fetch device configuration from server
    if (wifiConnected && (now - lastConfigFetch >= CONFIG_FETCH_INTERVAL_MS)) {
        fetchDeviceConfig();
        lastConfigFetch = now;
    }
}

bool NetworkManager::isConnected() {
    return WiFi.ready();
}

bool NetworkManager::transmitMeasurement(MeasurementData data) {
    if (!isConnected()) {
        if (DEBUG_MODE) Serial.println("No WiFi - storing measurement locally");
        storeMeasurement(data);
        ledController.flashWarning();  // Yellow flash
        stateMachine.setState(STATE_IDLE);
        stateMachine.scheduleNextMeasurement();
        return false;
    }
    
    String payload = createJSON(data);
    
    if (DEBUG_MODE) {
        Serial.println("Posting measurement to API server:");
        Serial.println(payload);
    }
    
    // Iterative retry loop (avoids stack overflow from recursion)
    bool success = false;
    int attempts = 0;
    
    while (attempts <= MAX_NETWORK_RETRY && !success) {
        if (attempts > 0) {
            if (DEBUG_MODE) Serial.printlnf("Retry attempt %d/%d...", attempts, MAX_NETWORK_RETRY);
            delay(1000 * attempts);  // Exponential backoff: 1s, 2s, 3s
        }
        
        success = postMeasurement(payload);
        attempts++;
    }
    
    if (success) {
        ledController.flashSuccess();  // Green flash
        if (DEBUG_MODE) Serial.println("Measurement posted successfully");
    } else {
        ledController.flashError();  // Red flash
        if (DEBUG_MODE) Serial.println("Failed after all retries - storing locally");
        storeMeasurement(data);
    }
    
    retryCount = 0;  // Reset for next transmission
    stateMachine.setState(STATE_IDLE);
    stateMachine.scheduleNextMeasurement();
    return success;
}

// ==================== HTTP POST to API Server ====================

bool NetworkManager::postMeasurement(String jsonPayload) {
    if (!WiFi.ready()) return false;
    
    if (DEBUG_MODE) {
        Serial.printlnf("Connecting to %s:%d...", API_SERVER_HOST, API_SERVER_PORT);
    }
    
    // Connect to API server
    if (!httpClient.connect(API_SERVER_HOST, API_SERVER_PORT)) {
        if (DEBUG_MODE) Serial.println("Connection failed!");
        return false;
    }
    
    // Build HTTP POST request to /api/measurements
    String httpRequest = "";
    httpRequest += "POST /api/measurements HTTP/1.1\r\n";
    httpRequest += "Host: " + String(API_SERVER_HOST) + ":" + String(API_SERVER_PORT) + "\r\n";
    httpRequest += "Content-Type: application/json\r\n";
    httpRequest += "X-API-Key: " + String(API_KEY) + "\r\n";
    httpRequest += "Content-Length: " + String(jsonPayload.length()) + "\r\n";
    httpRequest += "Connection: close\r\n";
    httpRequest += "\r\n";
    httpRequest += jsonPayload;
    
    // Send request
    httpClient.print(httpRequest);
    
    if (DEBUG_MODE) {
        Serial.println("Request sent, waiting for response...");
    }
    
    // Wait for response (timeout 5 seconds)
    unsigned long timeout = millis() + 5000;
    while (!httpClient.available() && millis() < timeout) {
        delay(10);
    }
    
    if (!httpClient.available()) {
        if (DEBUG_MODE) Serial.println("Response timeout!");
        httpClient.stop();
        return false;
    }
    
    // Read and parse response
    bool success = false;
    String statusLine = httpClient.readStringUntil('\n');
    
    if (DEBUG_MODE) {
        Serial.printlnf("Response: %s", statusLine.c_str());
    }
    
    // Check for success status codes (200, 201)
    if (statusLine.indexOf("200") > 0 || statusLine.indexOf("201") > 0) {
        success = true;
    }
    
    // Drain remaining response
    while (httpClient.available()) {
        httpClient.read();
    }
    
    httpClient.stop();
    return success;
}

// Legacy method - now routes to postMeasurement
bool NetworkManager::sendDirectHTTP(String jsonPayload, const char* host, int port, bool useHttps) {
    return postMeasurement(jsonPayload);
}

bool NetworkManager::sendToProxy(String jsonPayload) {
    return postMeasurement(jsonPayload);
}

bool NetworkManager::sendToServer(String jsonPayload) {
    return postMeasurement(jsonPayload);
}

void NetworkManager::webhookResponseHandler(const char *event, const char *data) {
    // Not used - direct HTTP mode
}

// ==================== Configuration Fetching ====================

void NetworkManager::fetchDeviceConfig() {
    if (!isConnected()) {
        if (DEBUG_MODE) Serial.println("Cannot fetch config - not connected");
        return;
    }
    
    String deviceID = System.deviceID();
    
    if (DEBUG_MODE) {
        Serial.println("Fetching device configuration...");
        Serial.printlnf("Device ID: %s", deviceID.c_str());
        Serial.printlnf("GET http://%s:%d/api/devices/%s/config", 
                        API_SERVER_HOST, API_SERVER_PORT, deviceID.c_str());
    }
    
    configFetchPending = true;
    
    // Connect to API server
    if (!httpClient.connect(API_SERVER_HOST, API_SERVER_PORT)) {
        if (DEBUG_MODE) Serial.println("Config fetch: connection failed");
        configFetchPending = false;
        return;
    }
    
    // Build GET request for device config
    String httpRequest = "";
    httpRequest += "GET /api/devices/" + deviceID + "/config HTTP/1.1\r\n";
    httpRequest += "Host: " + String(API_SERVER_HOST) + ":" + String(API_SERVER_PORT) + "\r\n";
    httpRequest += "X-API-Key: " + String(API_KEY) + "\r\n";
    httpRequest += "Connection: close\r\n";
    httpRequest += "\r\n";
    
    httpClient.print(httpRequest);
    
    // Wait for response
    unsigned long timeout = millis() + 5000;
    while (!httpClient.available() && millis() < timeout) {
        delay(10);
    }
    
    if (!httpClient.available()) {
        if (DEBUG_MODE) Serial.println("Config fetch: timeout");
        httpClient.stop();
        configFetchPending = false;
        return;
    }
    
    // Read status line first to check for success
    String statusLine = httpClient.readStringUntil('\n');
    bool responseOk = (statusLine.indexOf("200") > 0);
    
    if (DEBUG_MODE) {
        Serial.printlnf("Config response status: %s", statusLine.c_str());
    }
    
    // Skip remaining HTTP headers (find empty line)
    bool headersEnded = false;
    while (httpClient.available() && !headersEnded) {
        String line = httpClient.readStringUntil('\n');
        if (line == "\r" || line.length() == 0) {
            headersEnded = true;
        }
    }
    
    // Read JSON body
    String jsonBody = "";
    while (httpClient.available()) {
        jsonBody += (char)httpClient.read();
    }
    
    httpClient.stop();
    configFetchPending = false;
    
    if (DEBUG_MODE) {
        Serial.println("Config response body:");
        Serial.println(jsonBody);
    }
    
    // Only process if response was OK
    if (!responseOk) {
        if (DEBUG_MODE) Serial.println("Config fetch failed - non-200 response");
        return;
    }
    
    // Parse and apply configuration from nested JSON structure
    // API returns: {"success":true,"data":{"config":{...}}}
    if (jsonBody.length() > 0) {
        // Extract the config object from the nested response
        int configStart = jsonBody.indexOf("\"config\":");
        if (configStart > 0) {
            // Parse values from within the config object
            int frequency = extractJsonInt(jsonBody, "measurementFrequency");
            String startTime = extractJsonValue(jsonBody, "activeStartTime");
            String endTime = extractJsonValue(jsonBody, "activeEndTime");
            String timezone = extractJsonValue(jsonBody, "timezone");
            float timezoneOffset = extractJsonFloat(jsonBody, "timezoneOffset");
            
            if (DEBUG_MODE) {
                Serial.println("Parsed config values:");
                Serial.printlnf("  measurementFrequency: %d seconds", frequency);
                Serial.printlnf("  activeStartTime: %s", startTime.c_str());
                Serial.printlnf("  activeEndTime: %s", endTime.c_str());
                Serial.printlnf("  timezone: %s", timezone.c_str());
                Serial.printlnf("  timezoneOffset: %.1f hours (UTC%+.1f)", timezoneOffset, timezoneOffset);
            }
            
            if (frequency > 0 || startTime.length() > 0 || endTime.length() > 0 || 
                (timezoneOffset >= -12.0f && timezoneOffset <= 14.0f)) {
                stateMachine.applyConfiguration(frequency, startTime, endTime, timezoneOffset);
                if (DEBUG_MODE) Serial.println("Configuration applied successfully");
            }
        } else {
            if (DEBUG_MODE) Serial.println("Config object not found in response");
        }
    }
}

void NetworkManager::fetchConfigDirectHTTP(const char* host, int port, bool useHttps) {
    // Calls the main fetchDeviceConfig which uses API_SERVER_HOST/PORT
    fetchDeviceConfig();
}

bool NetworkManager::isConfigFetchPending() {
    return configFetchPending;
}

void NetworkManager::configResponseHandler(const char *event, const char *data) {
    // Not used - direct HTTP mode
}

// ==================== JSON Creation ====================

String NetworkManager::createJSON(MeasurementData data) {
    String deviceID = System.deviceID();
    
    // Format timestamp as ISO 8601
    String timestampISO = Time.format(data.timestamp, TIME_FORMAT_ISO8601_FULL);
    
    String quality = data.valid ? "good" : "poor";
    
    // Create JSON payload for POST /api/measurements
    String json = "{";
    json += "\"deviceId\":\"" + deviceID + "\",";
    json += "\"heartRate\":" + String((int)round(data.heartRate)) + ",";
    json += "\"spO2\":" + String((int)round(data.spO2)) + ",";
    json += "\"timestamp\":\"" + timestampISO + "\"";
    
    if (quality.length() > 0) {
        json += ",\"quality\":\"" + quality + "\"";
    }
    
    if (data.confidence > 0) {
        json += ",\"confidence\":" + String(data.confidence, 2);
    }
    
    json += "}";
    
    return json;
}

// ==================== Local Storage (EEPROM) ====================

void NetworkManager::storeMeasurement(MeasurementData data) {
    // First, clean up any measurements older than 24 hours
    cleanupOldMeasurements();
    
    // Find oldest slot or use next available slot
    int slotToUse = storageIndex;
    
    if (storedCount >= MAX_STORED_MEASUREMENTS) {
        // Find the oldest untransmitted measurement to overwrite
        uint32_t oldestTime = UINT32_MAX;
        for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
            if (!storage[i].transmitted && storage[i].timestamp < oldestTime) {
                oldestTime = storage[i].timestamp;
                slotToUse = i;
            }
        }
        if (DEBUG_MODE) Serial.println("Storage full - overwriting oldest measurement");
    }
    
    storage[slotToUse].heartRate = data.heartRate;
    storage[slotToUse].spO2 = data.spO2;
    storage[slotToUse].timestamp = data.timestamp;
    storage[slotToUse].transmitted = false;
    
    if (storedCount < MAX_STORED_MEASUREMENTS) {
        storedCount++;
        storageIndex = (storageIndex + 1) % MAX_STORED_MEASUREMENTS;
    }
    
    saveToEEPROM();
    
    if (DEBUG_MODE) {
        Serial.printlnf("Stored locally (%d/%d)", getUntransmittedCount(), MAX_STORED_MEASUREMENTS);
    }
}

void NetworkManager::cleanupOldMeasurements() {
    if (!Time.isValid()) return;
    
    uint32_t now = Time.now();
    uint32_t twentyFourHoursAgo = now - (24 * 60 * 60);  // 24 hours in seconds
    int cleaned = 0;
    
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        // Mark old measurements as transmitted (effectively removing them)
        if (!storage[i].transmitted && storage[i].timestamp > 0 && 
            storage[i].timestamp < twentyFourHoursAgo) {
            storage[i].transmitted = true;
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        storedCount -= cleaned;
        if (storedCount < 0) storedCount = 0;
        
        if (DEBUG_MODE) {
            Serial.printlnf("Cleaned %d measurements older than 24 hours", cleaned);
        }
    }
}

int NetworkManager::getUntransmittedCount() {
    int count = 0;
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        if (!storage[i].transmitted && storage[i].timestamp > 0) {
            count++;
        }
    }
    return count;
}

void NetworkManager::syncStoredMeasurements() {
    // Clean up old measurements first
    cleanupOldMeasurements();
    
    int untransmitted = getUntransmittedCount();
    if (untransmitted == 0) return;
    
    int index = findNextStoredMeasurement();
    if (index < 0) return;
    
    MeasurementData data;
    data.heartRate = storage[index].heartRate;
    data.spO2 = storage[index].spO2;
    data.timestamp = storage[index].timestamp;
    data.valid = true;
    data.confidence = 0.95;
    
    String payload = createJSON(data);
    
    if (postMeasurement(payload)) {
        storage[index].transmitted = true;
        storedCount--;
        if (storedCount < 0) storedCount = 0;
        saveToEEPROM();
        
        if (DEBUG_MODE) {
            Serial.printlnf("Synced stored measurement (%d remaining)", getUntransmittedCount());
        }
    }
}

void NetworkManager::saveToEEPROM() {
    int addr = EEPROM_MEASUREMENTS_ADDR;
    EEPROM.put(addr, storageIndex);
    addr += sizeof(int);
    EEPROM.put(addr, storedCount);
    addr += sizeof(int);
    
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        EEPROM.put(addr, storage[i]);
        addr += sizeof(StoredMeasurement);
    }
}

void NetworkManager::loadFromEEPROM() {
    int addr = EEPROM_MEASUREMENTS_ADDR;
    EEPROM.get(addr, storageIndex);
    addr += sizeof(int);
    EEPROM.get(addr, storedCount);
    addr += sizeof(int);
    
    // Validate loaded values
    if (storageIndex < 0 || storageIndex >= MAX_STORED_MEASUREMENTS) {
        storageIndex = 0;
    }
    if (storedCount < 0 || storedCount > MAX_STORED_MEASUREMENTS) {
        storedCount = 0;
    }
    
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        EEPROM.get(addr, storage[i]);
        addr += sizeof(StoredMeasurement);
    }
    
    if (DEBUG_MODE && storedCount > 0) {
        Serial.printlnf("Loaded %d measurements from EEPROM", storedCount);
    }
}

int NetworkManager::findNextStoredMeasurement() {
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        if (!storage[i].transmitted && storage[i].timestamp > 0) {
            return i;
        }
    }
    return -1;
}

// ==================== JSON Parsing Helpers ====================

String NetworkManager::extractJsonValue(String json, String key) {
    String searchKey = "\"" + key + "\":\"";
    int startIndex = json.indexOf(searchKey);
    
    if (startIndex < 0) return "";
    
    startIndex += searchKey.length();
    int endIndex = json.indexOf("\"", startIndex);
    
    if (endIndex < 0) return "";
    
    return json.substring(startIndex, endIndex);
}

int NetworkManager::extractJsonInt(String json, String key) {
    String searchKey = "\"" + key + "\":";
    int startIndex = json.indexOf(searchKey);
    
    if (startIndex < 0) return 0;
    
    startIndex += searchKey.length();
    
    int endIndex = startIndex;
    while (endIndex < (int)json.length()) {
        char c = json.charAt(endIndex);
        if (c == ',' || c == '}' || c == ' ' || c == '\n') break;
        endIndex++;
    }
    
    String valueStr = json.substring(startIndex, endIndex);
    return valueStr.toInt();
}

float NetworkManager::extractJsonFloat(String json, String key) {
    String searchKey = "\"" + key + "\":";
    int startIndex = json.indexOf(searchKey);
    
    if (startIndex < 0) return 0.0f;
    
    startIndex += searchKey.length();
    
    // Skip any whitespace
    while (startIndex < (int)json.length() && json.charAt(startIndex) == ' ') {
        startIndex++;
    }
    
    int endIndex = startIndex;
    while (endIndex < (int)json.length()) {
        char c = json.charAt(endIndex);
        // Allow digits, minus sign, and decimal point
        if (c == ',' || c == '}' || c == ' ' || c == '\n' || c == '\r') break;
        endIndex++;
    }
    
    String valueStr = json.substring(startIndex, endIndex);
    return valueStr.toFloat();
}
