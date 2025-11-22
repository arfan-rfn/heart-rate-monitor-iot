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
    
private:
    bool wifiConnected;
    int retryCount;
    unsigned long lastConnectionCheck;
    
    StoredMeasurement storage[MAX_STORED_MEASUREMENTS];
    int storageIndex;
    int storedCount;
    
    bool sendToProxy(String jsonPayload);
    String createJSON(MeasurementData data);
    void saveToEEPROM();
    void loadFromEEPROM();
    int findNextStoredMeasurement();
};

#endif
