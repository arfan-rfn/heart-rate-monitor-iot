/*
 * network_manager.cpp - Network Communication Manager Implementation
 * 
 * Implements dual-mode API communication:
 * 
 * DIRECT HTTP MODE (USE_WEBHOOK false):
 *   - Used for local development with api-server running on your computer
 *   - Device connects directly via TCP to API_SERVER_HOST:API_SERVER_PORT
 *   - Makes standard HTTP requests with X-API-Key header
 *   - Endpoints: POST /api/measurements, GET /api/devices/{id}/config
 * 
 * WEBHOOK MODE (USE_WEBHOOK true):
 *   - Used for production with Vercel-hosted HTTPS API
 *   - Device publishes events to Particle Cloud
 *   - Webhooks configured in Particle Console forward to Vercel
 *   - Events: heartrate-measurement, heartrate-timeout, heartrate-getconfig
 * 
 * See WEBHOOK_SETUP.md for webhook configuration instructions.
 */

#include "network_manager.h"
#include "config.h"
#include "led_controller.h"
#include "state_machine.h"

extern LEDController ledController;
extern StateMachine stateMachine;

// TCP client for direct HTTP connections (used when USE_WEBHOOK is false)
TCPClient httpClient;

// Global pointer for static webhook callback
NetworkManager* networkManagerInstance = nullptr;

/*
 * Static callback wrapper for Particle.subscribe
 * Particle.subscribe requires a static or free function, so we use this
 * wrapper to forward the call to the NetworkManager instance.
 */
void configWebhookHandler(const char *event, const char *data) {
    if (networkManagerInstance != nullptr) {
        networkManagerInstance->handleConfigResponse(event, data);
    }
}

NetworkManager::NetworkManager() {
    wifiConnected = false;
    wasWifiConnected = false;
    retryCount = 0;
    lastConnectionCheck = 0;
    lastConfigFetch = 0;
    configFetchPending = false;
    configFetchedSuccessfully = false;
    configFetchAttempts = 0;
    configRequestTime = 0;
    storageIndex = 0;
    storedCount = 0;
}

/*
 * Initialize the network manager.
 * - Loads any stored measurements from EEPROM
 * - Sets up webhook subscriptions (if USE_WEBHOOK is true)
 * - Prints connection mode information to serial
 */
void NetworkManager::begin() {
    loadFromEEPROM();
    
    // Set global instance pointer for static callback
    networkManagerInstance = this;
    
    // Initialize WiFi state tracking
    wifiConnected = WiFi.ready();
    wasWifiConnected = wifiConnected;
    
    // Print connection mode information
    if (DEBUG_MODE) {
        Serial.println("Network Manager initialized");
        #if USE_WEBHOOK
        // === WEBHOOK MODE: Particle Cloud -> Vercel HTTPS ===
        Serial.println("Mode: Particle Webhooks (HTTPS via Particle Cloud)");
        Serial.printlnf("Target: https://%s", API_SERVER_HOST);
        Serial.println("Webhook events:");
        Serial.println("  'heartrate-measurement' -> POST /api/measurements");
        Serial.println("  'heartrate-timeout' -> POST /api/notifications");
        Serial.println("  'heartrate-getconfig' -> GET /api/devices/{id}/config");
        Serial.println("\n*** IMPORTANT: Configure webhooks in Particle Console! ***");
        Serial.println("See WEBHOOK_SETUP.md for instructions.\n");
        #else
        // === HTTP MODE: Direct connection to local server ===
        Serial.println("Mode: Direct HTTP");
        Serial.printlnf("API Server: http://%s:%d", API_SERVER_HOST, API_SERVER_PORT);
        Serial.println("Endpoints:");
        Serial.printlnf("  POST http://%s:%d/api/measurements", API_SERVER_HOST, API_SERVER_PORT);
        Serial.printlnf("  GET  http://%s:%d/api/devices/{id}/config", API_SERVER_HOST, API_SERVER_PORT);
        #endif
    }
    
    #if USE_WEBHOOK
    // Subscribe to webhook response for config fetching.
    // Particle can send responses in two formats depending on webhook config:
    // 1. "{device_id}/hook-response/heartrate-getconfig" (device-specific)
    // 2. "hook-response/heartrate-getconfig" (all devices)
    // We subscribe to both to handle either configuration.
    
    String deviceSpecificTopic = System.deviceID() + "/hook-response/heartrate-getconfig";
    Particle.subscribe(deviceSpecificTopic, configWebhookHandler, MY_DEVICES);
    Particle.subscribe("hook-response/heartrate-getconfig", configWebhookHandler, MY_DEVICES);
    
    if (DEBUG_MODE) {
        Serial.println("Subscribed to config webhook responses:");
        Serial.printlnf("  - %s", deviceSpecificTopic.c_str());
        Serial.println("  - hook-response/heartrate-getconfig");
    }
    #endif
    
    // Trigger config fetch shortly after boot
    lastConfigFetch = 0;  // Will trigger fetch on first update() call
    configFetchAttempts = 0;
    configFetchedSuccessfully = false;
    
    if (DEBUG_MODE) {
        Serial.println("Config will be fetched from server (max 3 attempts)");
        Serial.println("If fetch fails, default configuration will be used");
    }
}

/*
 * Periodic update - called from main loop.
 * Handles:
 *   - WiFi connection monitoring and reconnection detection
 *   - Syncing stored measurements when reconnected
 *   - Webhook response timeout detection
 *   - Periodic and initial config fetching
 */
void NetworkManager::update() {
    unsigned long now = millis();
    
    // Check WiFi connection state every 5 seconds
    if (now - lastConnectionCheck > 5000) {
        bool currentWifiState = WiFi.ready();
        
        // Detect WiFi reconnection (was disconnected, now connected)
        if (currentWifiState && !wasWifiConnected) {
            if (DEBUG_MODE) {
                Serial.println("WiFi reconnected - will retry config fetch");
            }
            // Reset config fetch attempts on WiFi reconnection
            configFetchAttempts = 0;
            configFetchedSuccessfully = false;
            lastConfigFetch = 0;
        }
        
        wasWifiConnected = wifiConnected;
        wifiConnected = currentWifiState;
        lastConnectionCheck = now;
        
        // Sync stored measurements when connected
        if (wifiConnected && storedCount > 0) {
            syncStoredMeasurements();
        }
    }
    
    // Check for config fetch timeout (webhook mode only)
    #if USE_WEBHOOK
    if (configFetchPending && (now - configRequestTime > 10000)) {
        // 10 second timeout for webhook response
        if (DEBUG_MODE) {
            Serial.println("Config webhook response timeout");
        }
        configFetchPending = false;
        if (configFetchAttempts >= MAX_CONFIG_FETCH_ATTEMPTS) {
            if (DEBUG_MODE) {
                Serial.println("Max attempts reached - using default configuration");
            }
        }
    }
    #endif
    
    // Determine if we should fetch device configuration
    // Conditions:
    //   - Connected (WiFi for HTTP, Particle Cloud for webhook)
    //   - Not already waiting for a response
    //   - Either: initial fetch failed and retries remain, OR periodic refresh
    bool shouldFetchConfig = false;
    
    if (isConnected() && !configFetchPending) {
        if (!configFetchedSuccessfully && configFetchAttempts < MAX_CONFIG_FETCH_ATTEMPTS) {
            // Initial fetch or retry after failure (with limited attempts)
            if (now - lastConfigFetch >= 5000) {  // 5 second delay between retries
                shouldFetchConfig = true;
            }
        } else if (configFetchedSuccessfully && (now - lastConfigFetch >= CONFIG_FETCH_INTERVAL_MS)) {
            // Periodic refresh (hourly) after successful initial fetch
            shouldFetchConfig = true;
        }
    }
    
    if (shouldFetchConfig) {
        fetchDeviceConfig();
        lastConfigFetch = now;
    }
}

/*
 * Check if device is connected to the appropriate network.
 * - Webhook mode requires Particle Cloud connection
 * - HTTP mode requires WiFi connection
 */
bool NetworkManager::isConnected() {
    #if USE_WEBHOOK
    return Particle.connected();  // Need Particle Cloud for webhooks
    #else
    return WiFi.ready();          // Only need WiFi for direct HTTP
    #endif
}

/*
 * Transmit a measurement to the API server.
 * If offline, stores measurement locally for later sync.
 * Updates state machine and LED feedback on completion.
 */
bool NetworkManager::transmitMeasurement(MeasurementData data) {
    if (!isConnected()) {
        if (DEBUG_MODE) Serial.println("No connection - storing measurement locally");
        storeMeasurement(data);
        ledController.flashWarning();  // Yellow flash = stored offline
        stateMachine.setState(STATE_IDLE);
        stateMachine.scheduleNextMeasurement();
        return false;
    }
    
    String payload = createJSON(data);
    
    if (DEBUG_MODE) {
        Serial.println("Posting measurement:");
        Serial.println(payload);
    }
    
    bool success = postMeasurement(payload);
    
    if (success) {
        ledController.flashSuccess();  // Green flash = sent successfully
        if (DEBUG_MODE) Serial.println("Measurement posted successfully");
    } else {
        ledController.flashError();    // Red flash = error
        if (DEBUG_MODE) Serial.println("Failed to post measurement");
        
        // Retry logic with local storage fallback
        if (retryCount >= MAX_NETWORK_RETRY) {
            storeMeasurement(data);
            retryCount = 0;
        } else {
            retryCount++;
            delay(1000);
            return transmitMeasurement(data);  // Recursive retry
        }
    }
    
    stateMachine.setState(STATE_IDLE);
    stateMachine.scheduleNextMeasurement();
    return success;
}

// ============================================================================
// POST Measurement - Dual Mode Implementation
// ============================================================================

/*
 * Post measurement JSON to API server.
 * 
 * WEBHOOK MODE: Publishes to 'heartrate-measurement' event.
 *   Particle Cloud forwards to configured webhook URL.
 * 
 * HTTP MODE: Makes direct TCP connection and sends HTTP POST.
 *   Connects to API_SERVER_HOST:API_SERVER_PORT.
 */
bool NetworkManager::postMeasurement(String jsonPayload) {
    #if USE_WEBHOOK
    // ===== WEBHOOK MODE: Publish to Particle Cloud =====
    // The Particle Cloud will forward this event to the webhook URL
    // configured in Particle Console (heartrate-measurement -> POST /api/measurements)
    
    if (!Particle.connected()) {
        if (DEBUG_MODE) Serial.println("Not connected to Particle Cloud");
        return false;
    }
    
    if (DEBUG_MODE) {
        Serial.println("Publishing to webhook 'heartrate-measurement'...");
    }
    
    // Particle.publish has a 1024 byte limit for data
    bool success = Particle.publish("heartrate-measurement", jsonPayload, PRIVATE);
    
    if (DEBUG_MODE) {
        Serial.printlnf("Webhook publish: %s", success ? "success" : "failed");
    }
    
    // Delay to prevent rate limiting (max 1 publish/sec per device)
    delay(1100);
    
    return success;
    
    #else
    // ===== HTTP MODE: Direct TCP connection =====
    // Connect directly to the API server and send HTTP POST request
    
    if (!WiFi.ready()) return false;
    
    if (DEBUG_MODE) {
        Serial.printlnf("Connecting to %s:%d (HTTP)...", API_SERVER_HOST, API_SERVER_PORT);
    }
    
    // Connect to API server
    if (!httpClient.connect(API_SERVER_HOST, API_SERVER_PORT)) {
        if (DEBUG_MODE) Serial.println("Connection failed!");
        return false;
    }
    
    // Build HTTP POST request
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
    
    // Wait for response (5 second timeout)
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
    #endif
}

// ============================================================================
// User Timeout Notification
// ============================================================================

/*
 * Send notification when user doesn't respond to measurement prompt.
 * Posts to /api/notifications endpoint.
 */
bool NetworkManager::sendTimeoutNotification() {
    if (!isConnected()) {
        if (DEBUG_MODE) Serial.println("Cannot send timeout notification - not connected");
        return false;
    }
    
    String deviceID = System.deviceID();
    String timestampISO = Time.format(Time.now(), TIME_FORMAT_ISO8601_FULL);
    
    // Create JSON payload for timeout notification
    String jsonPayload = "{";
    jsonPayload += "\"deviceId\":\"" + deviceID + "\",";
    jsonPayload += "\"type\":\"user_timeout\",";
    jsonPayload += "\"message\":\"User did not place finger on sensor within timeout period\",";
    jsonPayload += "\"timestamp\":\"" + timestampISO + "\"";
    #if USE_WEBHOOK
    // Include API key in payload for webhook mode (webhook extracts for header)
    jsonPayload += ",\"apiKey\":\"" + String(API_KEY) + "\"";
    #endif
    jsonPayload += "}";
    
    if (DEBUG_MODE) {
        Serial.println("Sending user timeout notification:");
        Serial.println(jsonPayload);
    }
    
    #if USE_WEBHOOK
    // ===== WEBHOOK MODE =====
    if (!Particle.connected()) {
        if (DEBUG_MODE) Serial.println("Not connected to Particle Cloud");
        return false;
    }
    
    bool success = Particle.publish("heartrate-timeout", jsonPayload, PRIVATE);
    
    if (DEBUG_MODE) {
        Serial.printlnf("Timeout webhook: %s", success ? "success" : "failed");
    }
    
    delay(1100);  // Rate limiting
    return success;
    
    #else
    // ===== HTTP MODE =====
    if (!httpClient.connect(API_SERVER_HOST, API_SERVER_PORT)) {
        if (DEBUG_MODE) Serial.println("Timeout notification: connection failed");
        return false;
    }
    
    // Build HTTP POST request
    String httpRequest = "";
    httpRequest += "POST /api/notifications HTTP/1.1\r\n";
    httpRequest += "Host: " + String(API_SERVER_HOST) + ":" + String(API_SERVER_PORT) + "\r\n";
    httpRequest += "Content-Type: application/json\r\n";
    httpRequest += "X-API-Key: " + String(API_KEY) + "\r\n";
    httpRequest += "Content-Length: " + String(jsonPayload.length()) + "\r\n";
    httpRequest += "Connection: close\r\n";
    httpRequest += "\r\n";
    httpRequest += jsonPayload;
    
    httpClient.print(httpRequest);
    
    // Wait for response
    unsigned long timeout = millis() + 5000;
    while (!httpClient.available() && millis() < timeout) {
        delay(10);
    }
    
    bool success = false;
    if (httpClient.available()) {
        String statusLine = httpClient.readStringUntil('\n');
        if (DEBUG_MODE) {
            Serial.printlnf("Timeout notification response: %s", statusLine.c_str());
        }
        success = (statusLine.indexOf("200") > 0 || statusLine.indexOf("201") > 0);
        
        // Drain remaining response
        while (httpClient.available()) {
            httpClient.read();
        }
    } else {
        if (DEBUG_MODE) Serial.println("Timeout notification: response timeout");
    }
    
    httpClient.stop();
    
    if (DEBUG_MODE) {
        Serial.printlnf("Timeout notification %s", success ? "sent successfully" : "failed");
    }
    
    return success;
    #endif
}

// Legacy methods - route to unified implementation
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
    if (DEBUG_MODE) {
        Serial.printlnf("Webhook response: %s", data);
    }
}

// ============================================================================
// Configuration Fetching - Dual Mode Implementation
// ============================================================================

/*
 * Fetch device configuration from server.
 * Gets measurement frequency, active time window, etc.
 * 
 * WEBHOOK MODE: Publishes 'heartrate-getconfig' event, waits for response.
 * HTTP MODE: Makes GET request to /api/devices/{deviceId}/config
 */
void NetworkManager::fetchDeviceConfig() {
    if (!isConnected()) {
        if (DEBUG_MODE) Serial.println("Cannot fetch config - not connected");
        configFetchAttempts++;
        if (configFetchAttempts >= MAX_CONFIG_FETCH_ATTEMPTS) {
            if (DEBUG_MODE) Serial.println("Max config fetch attempts reached - using defaults");
        }
        return;
    }
    
    String deviceID = System.deviceID();
    
    if (DEBUG_MODE) {
        Serial.printlnf("Fetching device configuration (attempt %d/%d)...", 
                        configFetchAttempts + 1, MAX_CONFIG_FETCH_ATTEMPTS);
        Serial.printlnf("Device ID: %s", deviceID.c_str());
    }
    
    configFetchAttempts++;
    
    #if USE_WEBHOOK
    // ===== WEBHOOK MODE: Publish config request =====
    // The webhook makes a GET request to /api/devices/{deviceId}/config
    // and returns the response via hook-response event
    
    if (!Particle.connected()) {
        if (DEBUG_MODE) Serial.println("Not connected to Particle Cloud");
        return;
    }
    
    // Create JSON with device ID and API key for the webhook
    String jsonPayload = "{";
    jsonPayload += "\"deviceId\":\"" + deviceID + "\",";
    jsonPayload += "\"apiKey\":\"" + String(API_KEY) + "\"";
    jsonPayload += "}";
    
    if (DEBUG_MODE) {
        Serial.println("Publishing to webhook 'heartrate-getconfig'...");
        Serial.println(jsonPayload);
    }
    
    configFetchPending = true;
    configRequestTime = millis();
    
    bool published = Particle.publish("heartrate-getconfig", jsonPayload, PRIVATE);
    
    if (DEBUG_MODE) {
        Serial.printlnf("Config request published: %s", published ? "success" : "failed");
        if (published) {
            Serial.println("Waiting for webhook response...");
        }
    }
    
    if (!published) {
        configFetchPending = false;
    }
    
    delay(1100);  // Rate limiting
    
    #else
    // ===== HTTP MODE: Direct GET request =====
    
    if (DEBUG_MODE) {
        Serial.printlnf("GET http://%s:%d/api/devices/%s/config", 
                        API_SERVER_HOST, API_SERVER_PORT, deviceID.c_str());
    }
    
    configFetchPending = true;
    
    // Connect to API server
    if (!httpClient.connect(API_SERVER_HOST, API_SERVER_PORT)) {
        if (DEBUG_MODE) {
            Serial.println("Config fetch: connection failed");
            if (configFetchAttempts >= MAX_CONFIG_FETCH_ATTEMPTS) {
                Serial.println("Max attempts reached - using default configuration");
            }
        }
        configFetchPending = false;
        return;
    }
    
    // Build GET request
    String httpRequest = "";
    httpRequest += "GET /api/devices/" + deviceID + "/config HTTP/1.1\r\n";
    httpRequest += "Host: " + String(API_SERVER_HOST) + ":" + String(API_SERVER_PORT) + "\r\n";
    httpRequest += "X-API-Key: " + String(API_KEY) + "\r\n";
    httpRequest += "Connection: close\r\n";
    httpRequest += "\r\n";
    
    if (DEBUG_MODE) {
        Serial.println("--- HTTP Request ---");
        Serial.print(httpRequest);
        Serial.println("--- End Request ---");
    }
    
    httpClient.print(httpRequest);
    
    // Wait for response
    unsigned long timeout = millis() + 5000;
    while (!httpClient.available() && millis() < timeout) {
        delay(10);
    }
    
    if (!httpClient.available()) {
        if (DEBUG_MODE) {
            Serial.println("Config fetch: timeout");
            if (configFetchAttempts >= MAX_CONFIG_FETCH_ATTEMPTS) {
                Serial.println("Max attempts reached - using default configuration");
            }
        }
        httpClient.stop();
        configFetchPending = false;
        return;
    }
    
    // Read status line
    String statusLine = httpClient.readStringUntil('\n');
    bool httpSuccess = (statusLine.indexOf("200") > 0);
    
    if (!httpSuccess) {
        if (DEBUG_MODE) {
            Serial.printlnf("Config fetch: HTTP error - %s", statusLine.c_str());
            if (configFetchAttempts >= MAX_CONFIG_FETCH_ATTEMPTS) {
                Serial.println("Max attempts reached - using default configuration");
            }
        }
        while (httpClient.available()) httpClient.read();
        httpClient.stop();
        configFetchPending = false;
        return;
    }
    
    // Skip HTTP headers (find empty line)
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
        Serial.println("Config response:");
        Serial.println(jsonBody);
    }
    
    // Parse and apply configuration
    parseAndApplyConfig(jsonBody);
    #endif
}

/*
 * Handle webhook response for config fetch.
 * Called when Particle receives hook-response/heartrate-getconfig event.
 * Parses the response and applies configuration to state machine.
 */
void NetworkManager::handleConfigResponse(const char *event, const char *data) {
    if (DEBUG_MODE) {
        Serial.println("=== Config Webhook Response Received ===");
        Serial.printlnf("Event: %s", event);
        Serial.printlnf("Data: %s", data);
    }
    
    configFetchPending = false;
    
    if (data == nullptr || strlen(data) == 0) {
        if (DEBUG_MODE) {
            Serial.println("Empty config response");
        }
        return;
    }
    
    String jsonBody = String(data);
    
    // Parse configuration from response.
    // Supports two formats:
    // 1. Compact (from webhook response template): {"f":1800,"s":"06:00","e":"22:00"}
    // 2. Full API response: {"success":true,"data":{"config":{...}}}
    
    // Try compact format first
    int frequency = extractJsonInt(jsonBody, "f");
    String startTime = extractJsonValue(jsonBody, "s");
    String endTime = extractJsonValue(jsonBody, "e");
    
    // If compact format not found, try full format
    if (frequency == 0 && startTime.length() == 0) {
        frequency = extractJsonInt(jsonBody, "measurementFrequency");
        startTime = extractJsonValue(jsonBody, "activeStartTime");
        endTime = extractJsonValue(jsonBody, "activeEndTime");
    }
    
    if (frequency > 0 || startTime.length() > 0 || endTime.length() > 0) {
        stateMachine.applyConfiguration(frequency, startTime, endTime);
        configFetchedSuccessfully = true;
        if (DEBUG_MODE) {
            Serial.println("✓ Configuration applied successfully from server");
            Serial.printlnf("  Frequency: %d seconds", frequency);
            Serial.printlnf("  Active: %s - %s", startTime.c_str(), endTime.c_str());
        }
    } else {
        // Response received but couldn't parse
        if (DEBUG_MODE) {
            Serial.println("Could not parse config values from response");
            if (jsonBody.indexOf("error") >= 0 || jsonBody.indexOf("401") >= 0) {
                Serial.println("Server returned an error - check API key and device registration");
            }
        }
    }
}

bool NetworkManager::isConfigFetched() {
    return configFetchedSuccessfully;
}

void NetworkManager::fetchConfigDirectHTTP(const char* host, int port, bool useHttps) {
    fetchDeviceConfig();
}

bool NetworkManager::isConfigFetchPending() {
    return configFetchPending;
}

void NetworkManager::configResponseHandler(const char *event, const char *data) {
    handleConfigResponse(event, data);
}

/*
 * Parse and apply configuration from JSON response (HTTP mode).
 */
void parseAndApplyConfig(String jsonBody) {
    extern StateMachine stateMachine;
    
    if (jsonBody.length() == 0) return;
    
    // Check if response indicates success
    bool jsonSuccess = (jsonBody.indexOf("\"success\":true") >= 0);
    
    if (jsonSuccess || jsonBody.indexOf("measurementFrequency") >= 0) {
        int frequency = 0;
        String startTime = "";
        String endTime = "";
        
        // Parse measurementFrequency
        int freqIdx = jsonBody.indexOf("\"measurementFrequency\":");
        if (freqIdx >= 0) {
            int startIdx = freqIdx + 23;
            int endIdx = startIdx;
            while (endIdx < (int)jsonBody.length()) {
                char c = jsonBody.charAt(endIdx);
                if (c == ',' || c == '}') break;
                endIdx++;
            }
            frequency = jsonBody.substring(startIdx, endIdx).toInt();
        }
        
        // Parse activeStartTime
        int startIdx = jsonBody.indexOf("\"activeStartTime\":\"");
        if (startIdx >= 0) {
            startIdx += 19;
            int endIdx = jsonBody.indexOf("\"", startIdx);
            if (endIdx > startIdx) {
                startTime = jsonBody.substring(startIdx, endIdx);
            }
        }
        
        // Parse activeEndTime
        int endTimeIdx = jsonBody.indexOf("\"activeEndTime\":\"");
        if (endTimeIdx >= 0) {
            endTimeIdx += 17;
            int endIdx = jsonBody.indexOf("\"", endTimeIdx);
            if (endIdx > endTimeIdx) {
                endTime = jsonBody.substring(endTimeIdx, endIdx);
            }
        }
        
        if (frequency > 0 || startTime.length() > 0 || endTime.length() > 0) {
            stateMachine.applyConfiguration(frequency, startTime, endTime);
            if (DEBUG_MODE) {
                Serial.println("✓ Configuration applied successfully from server");
            }
        }
    }
}

// ============================================================================
// JSON Creation
// ============================================================================

/*
 * Create JSON payload for measurement submission.
 * Includes all required fields for POST /api/measurements.
 * In webhook mode, also includes apiKey (webhook extracts for header).
 */
String NetworkManager::createJSON(MeasurementData data) {
    String deviceID = System.deviceID();
    String timestampISO = Time.format(data.timestamp, TIME_FORMAT_ISO8601_FULL);
    String quality = data.valid ? "good" : "poor";
    
    String json = "{";
    json += "\"deviceId\":\"" + deviceID + "\",";
    json += "\"heartRate\":" + String((int)round(data.heartRate)) + ",";
    json += "\"spO2\":" + String((int)round(data.spO2)) + ",";
    json += "\"timestamp\":\"" + timestampISO + "\"";
    
    #if USE_WEBHOOK
    // Include API key in payload for webhook mode
    // The webhook template extracts this and puts it in the X-API-Key header
    json += ",\"apiKey\":\"" + String(API_KEY) + "\"";
    #endif
    
    if (quality.length() > 0) {
        json += ",\"quality\":\"" + quality + "\"";
    }
    
    if (data.confidence > 0) {
        json += ",\"confidence\":" + String(data.confidence, 2);
    }
    
    json += "}";
    
    return json;
}

// ============================================================================
// Offline Storage (EEPROM)
// ============================================================================

/*
 * Store measurement in EEPROM for later transmission.
 * Uses circular buffer - oldest measurements are overwritten when full.
 */
void NetworkManager::storeMeasurement(MeasurementData data) {
    if (storedCount >= MAX_STORED_MEASUREMENTS) {
        if (DEBUG_MODE) Serial.println("Storage full - overwriting oldest");
        storageIndex = 0;
    }
    
    storage[storageIndex].heartRate = data.heartRate;
    storage[storageIndex].spO2 = data.spO2;
    storage[storageIndex].timestamp = data.timestamp;
    storage[storageIndex].transmitted = false;
    
    storageIndex = (storageIndex + 1) % MAX_STORED_MEASUREMENTS;
    if (storedCount < MAX_STORED_MEASUREMENTS) storedCount++;
    
    saveToEEPROM();
    
    if (DEBUG_MODE) {
        Serial.printlnf("Stored locally (%d/%d)", storedCount, MAX_STORED_MEASUREMENTS);
    }
}

/*
 * Sync one stored measurement to server.
 * Called periodically when connected and stored measurements exist.
 */
void NetworkManager::syncStoredMeasurements() {
    if (storedCount == 0) return;
    
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
        saveToEEPROM();
        
        if (DEBUG_MODE) {
            Serial.printlnf("Synced stored measurement (%d remaining)", storedCount);
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

// ============================================================================
// JSON Parsing Helpers
// ============================================================================

/*
 * Extract string value from JSON for a given key.
 * Example: extractJsonValue('{"key":"value"}', "key") returns "value"
 */
String NetworkManager::extractJsonValue(String json, String key) {
    String searchKey = "\"" + key + "\":\"";
    int startIndex = json.indexOf(searchKey);
    
    if (startIndex < 0) return "";
    
    startIndex += searchKey.length();
    int endIndex = json.indexOf("\"", startIndex);
    
    if (endIndex < 0) return "";
    
    return json.substring(startIndex, endIndex);
}

/*
 * Extract integer value from JSON for a given key.
 * Example: extractJsonInt('{"key":123}', "key") returns 123
 */
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
