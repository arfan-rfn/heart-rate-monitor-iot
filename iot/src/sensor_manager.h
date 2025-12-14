/*
 * sensor_manager.h - MAX30102/MAX30105 Sensor Interface
 * 
 * Manages the pulse oximeter sensor for heart rate and SpO2 measurements.
 * Uses the SparkFun MAX3010x library for sensor communication.
 * 
 * MEASUREMENT PROCESS:
 *   1. startMeasurement() - Begin data collection
 *   2. update() - Collect samples until buffer is filled
 *   3. calculateMetrics() - Run SpO2 algorithm
 *   4. isMeasurementComplete() returns true when valid reading obtained
 *   5. getMeasurement() - Retrieve the measurement data
 * 
 * FINGER DETECTION:
 *   Uses IR value threshold to detect finger presence.
 *   Measurement fails if finger is removed during collection.
 * 
 * VALIDATION:
 *   Readings are validated against physiological ranges:
 *   - Heart rate: 40-200 BPM
 *   - SpO2: 70-100%
 */

#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include "Particle.h"
#include "config.h"
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

/*
 * MeasurementData - Container for sensor readings
 */
struct MeasurementData {
    float heartRate;      // Heart rate in BPM
    float spO2;           // Blood oxygen saturation (%)
    uint32_t timestamp;   // Unix timestamp of measurement
    bool valid;           // True if reading passed validation
    float confidence;     // Confidence level (0.0 - 1.0)
};

/*
 * SensorManager - Handles MAX30102/MAX30105 sensor operations
 * 
 * Responsibilities:
 *   - Initialize and configure sensor
 *   - Collect samples into buffer
 *   - Calculate heart rate and SpO2 using SparkFun algorithm
 *   - Validate readings against physiological limits
 *   - Detect finger presence/removal
 */
class SensorManager {
public:
    SensorManager();
    
    /*
     * Initialize the MAX30102 sensor.
     * Returns false if sensor not detected.
     */
    bool begin();
    
    /*
     * Periodic update - call from main loop.
     * Handles sample collection and state transitions.
     */
    void update();
    
    /*
     * Check if finger is currently detected on sensor.
     */
    bool isFingerDetected();
    
    /*
     * Start a new measurement cycle.
     * Resets buffers and begins data collection.
     */
    void startMeasurement();
    
    /*
     * Check if current measurement is complete and valid.
     */
    bool isMeasurementComplete();
    
    /*
     * Get the completed measurement data.
     */
    MeasurementData getMeasurement();
    
private:
    MAX30105 particleSensor;        // Sensor driver instance
    MeasurementData currentMeasurement;
    
    // SpO2 algorithm buffers
    // AVR uses 16-bit, other platforms use 32-bit
    #if defined(__AVR_ATmega328P__) || defined(__AVR_ATmega168__)
    uint16_t irBuffer[100];
    uint16_t redBuffer[100];
    #else
    uint32_t irBuffer[100];
    uint32_t redBuffer[100];
    #endif
    
    // Algorithm variables
    int32_t bufferLength;
    int32_t spo2;
    int8_t validSPO2;
    int32_t heartRate;
    int8_t validHeartRate;
    
    // State tracking
    int bufferIndex;
    bool bufferFilled;
    bool measuring;
    unsigned long measurementStartTime;
    
    /*
     * Collect initial 100 samples to fill buffer.
     */
    void collectInitialBuffer();
    
    /*
     * Shift buffer and collect 25 new samples.
     */
    void updateBuffer();
    
    /*
     * Run SpO2 algorithm to calculate metrics.
     */
    void calculateMetrics();
    
    /*
     * Validate reading against physiological limits.
     */
    bool validateMeasurement();
    
    /*
     * Reset measurement state.
     */
    void resetMeasurement();
};

#endif // SENSOR_MANAGER_H
