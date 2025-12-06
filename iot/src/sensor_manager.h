#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include "Particle.h"
#include "config.h"              // ← MUST BE BEFORE using constants
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

struct MeasurementData {
    float heartRate;
    float spO2;
    uint32_t timestamp;
    bool valid;
    float confidence;
};

class SensorManager {
public:
    SensorManager();
    
    bool begin();
    void update();
    
    bool isFingerDetected();
    void startMeasurement();
    bool isMeasurementComplete();
    MeasurementData getMeasurement();
    
private:
    MAX30105 particleSensor;
    MeasurementData currentMeasurement;
    
    // SpO2 algorithm buffers
    #if defined(__AVR_ATmega328P__) || defined(__AVR_ATmega168__)
    uint16_t irBuffer[100];
    uint16_t redBuffer[100];
    #else
    uint32_t irBuffer[100];
    uint32_t redBuffer[100];
    #endif
    
    int32_t bufferLength;
    int32_t spo2;
    int8_t validSPO2;
    int32_t heartRate;
    int8_t validHeartRate;
    
    int bufferIndex;
    bool bufferFilled;
    bool measuring;
    unsigned long measurementStartTime;
    
    void collectInitialBuffer();
    void updateBuffer();
    void calculateMetrics();
    bool validateMeasurement();
    void resetMeasurement();
};

#endif
