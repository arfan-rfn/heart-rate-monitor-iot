#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include "Particle.h"
#include "config.h"
#include "sensor_manager.h"

struct StoredMeasurement {
    float heartRate;
    float spO2;
    uint32_t timestamp;
    bool transmitted;
};

class NetworkManager {
public:
    NetworkManager();
    
    void begin();
    void update();
    
    bool isConnected();
    bool transmitMeasurement(MeasurementData data);
    void storeMeasurement(MeasurementData data);
    void syncStoredMeasurements();
    
    // Configuration fetching from server
    void fetchDeviceConfig();
    bool isConfigFetchPending();
    
private:
    bool wifiConnected;
    int retryCount;
    unsigned long lastConnectionCheck;
    unsigned long lastConfigFetch;
    bool configFetchPending;
    
    StoredMeasurement storage[MAX_STORED_MEASUREMENTS];
    int storageIndex;
    int storedCount;
    
    // HTTP POST to API server
    bool postMeasurement(String jsonPayload);
    
    // Legacy methods (kept for compatibility, route to postMeasurement)
    bool sendDirectHTTP(String jsonPayload, const char* host, int port, bool useHttps);
    bool sendToProxy(String jsonPayload);
    bool sendToServer(String jsonPayload);
    void webhookResponseHandler(const char *event, const char *data);
    void configResponseHandler(const char *event, const char *data);
    void fetchConfigDirectHTTP(const char* host, int port, bool useHttps);
    
    // JSON and storage helpers
    String createJSON(MeasurementData data);
    void saveToEEPROM();
    void loadFromEEPROM();
    int findNextStoredMeasurement();
    void cleanupOldMeasurements();
    int getUntransmittedCount();
    
    // JSON parsing helpers
    String extractJsonValue(String json, String key);
    int extractJsonInt(String json, String key);
    float extractJsonFloat(String json, String key);
};

#endif
