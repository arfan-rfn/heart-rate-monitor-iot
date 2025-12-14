/*
 * sensor_manager.cpp - MAX30102/MAX30105 Sensor Implementation
 * 
 * Implements pulse oximetry using the SparkFun MAX3010x library.
 * Collects samples from the sensor and calculates heart rate and SpO2.
 * 
 * ALGORITHM:
 *   Uses maxim_heart_rate_and_oxygen_saturation() from spo2_algorithm.h
 *   Requires 100 samples to calculate initial reading
 *   Continuously updates with 25-sample sliding window
 * 
 * TIMING:
 *   - Initial buffer fill: ~4 seconds (100 samples at 25 Hz)
 *   - Measurement timeout: 60 seconds max
 */

#include "sensor_manager.h"
#include "config.h"
#include "state_machine.h"

extern StateMachine stateMachine;

SensorManager::SensorManager() {
    bufferLength = 100;
    spo2 = 0;
    validSPO2 = 0;
    heartRate = 0;
    validHeartRate = 0;
    bufferIndex = 0;
    bufferFilled = false;
    measuring = false;
    measurementStartTime = 0;
    
    // Initialize buffers to zero
    for (int i = 0; i < 100; i++) {
        irBuffer[i] = 0;
        redBuffer[i] = 0;
    }
}

/*
 * Initialize the MAX30102/MAX30105 sensor.
 * Configures I2C, LED brightness, sample rate, and pulse width.
 */
bool SensorManager::begin() {
    if (DEBUG_MODE) Serial.println("Initializing MAX30102...");
    
    // Initialize sensor on I2C bus
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        if (DEBUG_MODE) Serial.println("ERROR: MAX30102 not found!");
        return false;
    }
    
    if (DEBUG_MODE) Serial.println("MAX30102 found!");
    
    // Sensor configuration
    byte ledBrightness = 60;    // LED current (0-255)
    byte sampleAverage = 4;     // Samples to average (1, 2, 4, 8, 16, 32)
    byte ledMode = 2;           // 2 = Red + IR for SpO2
    byte sampleRate = 100;      // Samples per second (50, 100, 200, 400, 800, 1000, 1600, 3200)
    int pulseWidth = 411;       // LED pulse width in µs (69, 118, 215, 411)
    int adcRange = 4096;        // ADC range (2048, 4096, 8192, 16384)
    
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, 
                        sampleRate, pulseWidth, adcRange);
    
    // Configure LED amplitudes
    particleSensor.setPulseAmplitudeRed(0x0A);  // Low red LED
    particleSensor.setPulseAmplitudeGreen(0);   // Green LED off
    
    if (DEBUG_MODE) Serial.println("MAX30102 initialized successfully");
    return true;
}

/*
 * Main update loop - handles measurement state machine.
 * Called from main loop() when in MEASURING or STABILIZING state.
 */
void SensorManager::update() {
    if (!measuring) return;
    
    // Check if finger is still present
    long irValue = particleSensor.getIR();
    
    if (irValue < FINGER_THRESHOLD) {
        if (DEBUG_MODE) Serial.println("Finger removed!");
        resetMeasurement();
        stateMachine.measurementFailed();
        return;
    }
    
    // Phase 1: Fill initial buffer (100 samples)
    if (!bufferFilled) {
        collectInitialBuffer();
        return;
    }
    
    // Phase 2: Continuous measurement with sliding window
    updateBuffer();
    calculateMetrics();
    
    // Check if we have a valid reading
    if (validHeartRate && validSPO2) {
        currentMeasurement.heartRate = heartRate;
        currentMeasurement.spO2 = spo2;
        currentMeasurement.timestamp = Time.now();
        currentMeasurement.valid = validateMeasurement();
        currentMeasurement.confidence = 0.95;
        
        if (currentMeasurement.valid) {
            if (DEBUG_MODE) {
                Serial.printlnf("Valid: HR=%ld bpm, SpO2=%ld%%", 
                              (long)heartRate, (long)spo2);
            }
            measuring = false;
            stateMachine.measurementComplete();
            return;
        }
    }
    
    // Check for measurement timeout (60 seconds)
    if (millis() - measurementStartTime > 60000) {
        if (DEBUG_MODE) Serial.println("Measurement timeout");
        resetMeasurement();
        stateMachine.measurementFailed();
    }
}

/*
 * Collect initial 100 samples to fill the buffer.
 * Shows progress every 25 samples.
 */
void SensorManager::collectInitialBuffer() {
    // Progress indicator
    if (DEBUG_MODE && bufferIndex % 25 == 0) {
        Serial.printlnf("Collecting: %d/100", bufferIndex);
    }
    
    // Wait for sample to be available
    while (particleSensor.available() == false) {
        particleSensor.check();
    }
    
    // Store sample
    redBuffer[bufferIndex] = particleSensor.getRed();
    irBuffer[bufferIndex] = particleSensor.getIR();
    particleSensor.nextSample();
    
    bufferIndex++;
    
    // Buffer full - calculate first reading
    if (bufferIndex >= 100) {
        bufferFilled = true;
        bufferIndex = 0;
        if (DEBUG_MODE) Serial.println("Buffer filled, calculating...");
        stateMachine.setState(STATE_STABILIZING);
        calculateMetrics();
    }
}

/*
 * Update buffer with 25 new samples using sliding window.
 * Shifts old samples and adds new ones.
 */
void SensorManager::updateBuffer() {
    // Shift old samples (drop oldest 25, keep newest 75)
    for (byte i = 25; i < 100; i++) {
        redBuffer[i - 25] = redBuffer[i];
        irBuffer[i - 25] = irBuffer[i];
    }
    
    // Collect 25 new samples
    for (byte i = 75; i < 100; i++) {
        while (particleSensor.available() == false) {
            particleSensor.check();
        }
        
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample();
    }
}

/*
 * Calculate heart rate and SpO2 using SparkFun algorithm.
 * Results are stored in class variables.
 */
void SensorManager::calculateMetrics() {
    maxim_heart_rate_and_oxygen_saturation(
        irBuffer, 
        bufferLength, 
        redBuffer, 
        &spo2, 
        &validSPO2, 
        &heartRate, 
        &validHeartRate
    );
    
    if (DEBUG_MODE) {
        Serial.printlnf("HR=%ld (valid=%d), SpO2=%ld%% (valid=%d)", 
                      (long)heartRate, validHeartRate, 
                      (long)spo2, validSPO2);
    }
}

/*
 * Check if finger is currently detected on sensor.
 * Uses IR value threshold from config.h.
 */
bool SensorManager::isFingerDetected() {
    long irValue = particleSensor.getIR();
    return (irValue >= FINGER_THRESHOLD);
}

/*
 * Start a new measurement cycle.
 * Resets state and begins data collection.
 */
void SensorManager::startMeasurement() {
    resetMeasurement();
    measuring = true;
    measurementStartTime = millis();
    
    if (DEBUG_MODE) Serial.println("Starting measurement...");
}

/*
 * Check if current measurement is complete and valid.
 */
bool SensorManager::isMeasurementComplete() {
    return !measuring && currentMeasurement.valid;
}

/*
 * Get the completed measurement data.
 */
MeasurementData SensorManager::getMeasurement() {
    return currentMeasurement;
}

/*
 * Validate reading against physiological limits.
 * Heart rate: 40-200 BPM
 * SpO2: 70-100%
 */
bool SensorManager::validateMeasurement() {
    bool hrValid = (heartRate >= MIN_HEART_RATE && 
                    heartRate <= MAX_HEART_RATE);
    bool spo2Valid = (spo2 >= MIN_SPO2 && 
                      spo2 <= MAX_SPO2);
    
    return (hrValid && spo2Valid && validHeartRate && validSPO2);
}

/*
 * Reset measurement state.
 * Called when starting new measurement or on failure.
 */
void SensorManager::resetMeasurement() {
    measuring = false;
    bufferFilled = false;
    bufferIndex = 0;
    currentMeasurement.valid = false;
    validHeartRate = 0;
    validSPO2 = 0;
}
