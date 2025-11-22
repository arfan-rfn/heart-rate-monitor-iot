#include "network_manager.h"
#include "config.h"
#include "led_controller.h"
#include "state_machine.h"

extern LEDController ledController;
extern StateMachine stateMachine;

NetworkManager::NetworkManager() {
    wifiConnected = false;
    retryCount = 0;
    lastConnectionCheck = 0;
    storageIndex = 0;
    storedCount = 0;
}

void NetworkManager::begin() {
    loadFromEEPROM();
    if (DEBUG_MODE) Serial.println("Network Manager initialized");
}

void NetworkManager::update() {
    unsigned long now = millis();
    
    if (now - lastConnectionCheck > 5000) {
        wifiConnected = WiFi.ready();
        lastConnectionCheck = now;
        
        if (wifiConnected && storedCount > 0) {
            syncStoredMeasurements();
        }
    }
}

bool NetworkManager::isConnected() {
    return WiFi.ready();
}

bool NetworkManager::transmitMeasurement(MeasurementData data) {
    if (!isConnected()) {
        if (DEBUG_MODE) Serial.println("No WiFi - storing");
        storeMeasurement(data);
        ledController.flashWarning();
        stateMachine.setState(STATE_IDLE);
        stateMachine.scheduleNextMeasurement();
        return false;
    }
    
    String payload = createJSON(data);
    
    if (DEBUG_MODE) {
        Serial.println("Transmitting:");
        Serial.println(payload);
    }
    
    bool success = sendToProxy(payload);
    
    if (success) {
        ledController.flashSuccess();
        if (DEBUG_MODE) Serial.println("✓ Success");
    } else {
        ledController.flashError();
        if (DEBUG_MODE) Serial.println("✗ Failed");
        
        if (retryCount >= MAX_NETWORK_RETRY) {
            storeMeasurement(data);
            retryCount = 0;
        } else {
            retryCount++;
            delay(1000);
            return transmitMeasurement(data);
        }
    }
    
    stateMachine.setState(STATE_IDLE);
    stateMachine.scheduleNextMeasurement();
    return success;
}

bool NetworkManager::sendToProxy(String jsonPayload) {
    if (!isConnected()) return false;
    
    bool success = Particle.publish("mongodb_measurement", jsonPayload, PRIVATE);
    
    if (DEBUG_MODE) {
        if (success) Serial.println("✓ Published");
        else Serial.println("✗ Publish failed");
    }
    
    return success;
}

String NetworkManager::createJSON(MeasurementData data) {
    String deviceID = System.deviceID();
    
    char json[512];
    snprintf(json, sizeof(json),
            "{"
            "\"deviceId\":\"%s\","
            "\"heartRate\":%.1f,"
            "\"spO2\":%.1f,"
            "\"timestamp\":%lu,"
            "\"timestampISO\":\"%s\","
            "\"quality\":\"%s\","
            "\"confidence\":%.2f,"
            "\"retryCount\":%d,"
            "\"wifiRSSI\":%d"
            "}",
            deviceID.c_str(),
            data.heartRate,
            data.spO2,
            data.timestamp,
            Time.format(data.timestamp, TIME_FORMAT_ISO8601_FULL).c_str(),
            data.valid ? "good" : "poor",
            data.confidence,
            stateMachine.getRetryCount(),
            WiFi.RSSI());
    
    return String(json);
}

void NetworkManager::storeMeasurement(MeasurementData data) {
    if (storedCount >= MAX_STORED_MEASUREMENTS) {
        if (DEBUG_MODE) Serial.println("Storage full");
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
        Serial.printlnf("Stored (%d/%d)", storedCount, MAX_STORED_MEASUREMENTS);
    }
}

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
    
    if (sendToProxy(payload)) {
        storage[index].transmitted = true;
        storedCount--;
        saveToEEPROM();
        
        if (DEBUG_MODE) {
            Serial.printlnf("Synced (%d remaining)", storedCount);
        }
    }
}

void NetworkManager::saveToEEPROM() {
    EEPROM.put(0, storageIndex);
    EEPROM.put(sizeof(int), storedCount);
    
    int addr = 2 * sizeof(int);
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        EEPROM.put(addr, storage[i]);
        addr += sizeof(StoredMeasurement);
    }
}

void NetworkManager::loadFromEEPROM() {
    EEPROM.get(0, storageIndex);
    EEPROM.get(sizeof(int), storedCount);
    
    if (storageIndex < 0 || storageIndex >= MAX_STORED_MEASUREMENTS) {
        storageIndex = 0;
    }
    if (storedCount < 0 || storedCount > MAX_STORED_MEASUREMENTS) {
        storedCount = 0;
    }
    
    int addr = 2 * sizeof(int);
    for (int i = 0; i < MAX_STORED_MEASUREMENTS; i++) {
        EEPROM.get(addr, storage[i]);
        addr += sizeof(StoredMeasurement);
    }
    
    if (DEBUG_MODE && storedCount > 0) {
        Serial.printlnf("Loaded %d from EEPROM", storedCount);
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
