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
    validSampleCount = 0;
    
    for (int i = 0; i < 100; i++) {
        irBuffer[i] = 0;
        redBuffer[i] = 0;
    }
    
    for (int i = 0; i < MAX_VALID_SAMPLES; i++) {
        hrSamples[i] = 0;
        spo2Samples[i] = 0;
    }
}

bool SensorManager::begin() {
    if (DEBUG_MODE) Serial.println("Initializing MAX30102...");
    
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        if (DEBUG_MODE) Serial.println("ERROR: MAX30102 not found!");
        return false;
    }
    
    if (DEBUG_MODE) Serial.println("MAX30102 found!");
    
    byte ledBrightness = 60;
    byte sampleAverage = 4;
    byte ledMode = 2;
    byte sampleRate = 100;
    int pulseWidth = 411;
    int adcRange = 4096;
    
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, 
                        sampleRate, pulseWidth, adcRange);
    
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    
    if (DEBUG_MODE) Serial.println("MAX30102 initialized successfully");
    return true;
}

void SensorManager::update() {
    if (!measuring) return;
    
    long irValue = particleSensor.getIR();
    
    if (irValue < FINGER_THRESHOLD) {
        if (DEBUG_MODE) Serial.println("Finger removed!");
        resetMeasurement();
        stateMachine.measurementFailed();
        return;
    }
    
    if (!bufferFilled) {
        collectInitialBuffer();
        return;
    }
    
    updateBuffer();
    calculateMetrics();
    
    // Check if this reading is valid
    if (validHeartRate && validSPO2) {
        bool hrValid = (heartRate >= MIN_HEART_RATE && heartRate <= MAX_HEART_RATE);
        bool spo2Valid = (spo2 >= MIN_SPO2 && spo2 <= MAX_SPO2);
        
        if (hrValid && spo2Valid) {
            // Store this valid sample
            hrSamples[validSampleCount] = heartRate;
            spo2Samples[validSampleCount] = spo2;
            validSampleCount++;
            
            if (DEBUG_MODE) {
                Serial.printlnf("Valid sample %d/%d: HR=%ld, SpO2=%ld%%", 
                              validSampleCount, MIN_VALID_SAMPLES,
                              (long)heartRate, (long)spo2);
            }
            
            // Check if we have enough samples
            if (validSampleCount >= MIN_VALID_SAMPLES) {
                // Calculate variance to check stability
                float hrVariance = calculateVariance(hrSamples, validSampleCount);
                float spo2Variance = calculateVariance(spo2Samples, validSampleCount);
                
                // Accept if variance is acceptable OR we have max samples
                if ((hrVariance <= MAX_HR_VARIANCE && spo2Variance <= MAX_SPO2_VARIANCE) ||
                    validSampleCount >= MAX_VALID_SAMPLES) {
                    
                    // Calculate averages
                    float avgHR = 0, avgSpO2 = 0;
                    for (int i = 0; i < validSampleCount; i++) {
                        avgHR += hrSamples[i];
                        avgSpO2 += spo2Samples[i];
                    }
                    avgHR /= validSampleCount;
                    avgSpO2 /= validSampleCount;
                    
                    currentMeasurement.heartRate = avgHR;
                    currentMeasurement.spO2 = avgSpO2;
                    currentMeasurement.timestamp = Time.now();
                    currentMeasurement.valid = true;
                    currentMeasurement.confidence = calculateConfidence();
                    
                    if (DEBUG_MODE) {
                        Serial.printlnf("Final (avg of %d): HR=%.1f bpm, SpO2=%.1f%%, confidence=%.2f", 
                                      validSampleCount, avgHR, avgSpO2, 
                                      currentMeasurement.confidence);
                    }
                    
                    measuring = false;
                    stateMachine.measurementComplete();
                    return;
                }
            }
        }
    }
    
    if (millis() - measurementStartTime > 60000) {
        // Timeout - but if we have any valid samples, use them
        if (validSampleCount > 0) {
            float avgHR = 0, avgSpO2 = 0;
            for (int i = 0; i < validSampleCount; i++) {
                avgHR += hrSamples[i];
                avgSpO2 += spo2Samples[i];
            }
            avgHR /= validSampleCount;
            avgSpO2 /= validSampleCount;
            
            currentMeasurement.heartRate = avgHR;
            currentMeasurement.spO2 = avgSpO2;
            currentMeasurement.timestamp = Time.now();
            currentMeasurement.valid = true;
            currentMeasurement.confidence = calculateConfidence() * 0.8f; // Lower confidence
            
            if (DEBUG_MODE) {
                Serial.printlnf("Timeout - using %d samples: HR=%.1f, SpO2=%.1f%%", 
                              validSampleCount, avgHR, avgSpO2);
            }
            measuring = false;
            stateMachine.measurementComplete();
        } else {
            if (DEBUG_MODE) Serial.println("Measurement timeout - no valid samples");
            resetMeasurement();
            stateMachine.measurementFailed();
        }
    }
}

void SensorManager::collectInitialBuffer() {
    if (DEBUG_MODE && bufferIndex % 25 == 0) {
        Serial.printlnf("Collecting: %d/100", bufferIndex);
    }
    
    while (particleSensor.available() == false) {
        particleSensor.check();
    }
    
    redBuffer[bufferIndex] = particleSensor.getRed();
    irBuffer[bufferIndex] = particleSensor.getIR();
    particleSensor.nextSample();
    
    bufferIndex++;
    
    if (bufferIndex >= 100) {
        bufferFilled = true;
        bufferIndex = 0;
        if (DEBUG_MODE) Serial.println("Buffer filled, calculating...");
        stateMachine.setState(STATE_STABILIZING);
        calculateMetrics();
    }
}

void SensorManager::updateBuffer() {
    for (byte i = 25; i < 100; i++) {
        redBuffer[i - 25] = redBuffer[i];
        irBuffer[i - 25] = irBuffer[i];
    }
    
    for (byte i = 75; i < 100; i++) {
        while (particleSensor.available() == false) {
            particleSensor.check();
        }
        
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample();
    }
}

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

bool SensorManager::isFingerDetected() {
    long irValue = particleSensor.getIR();
    return (irValue >= FINGER_THRESHOLD);
}

void SensorManager::startMeasurement() {
    resetMeasurement();
    measuring = true;
    measurementStartTime = millis();
    
    if (DEBUG_MODE) Serial.println("Starting measurement...");
}

bool SensorManager::isMeasurementComplete() {
    return !measuring && currentMeasurement.valid;
}

MeasurementData SensorManager::getMeasurement() {
    return currentMeasurement;
}

bool SensorManager::validateMeasurement() {
    bool hrValid = (heartRate >= MIN_HEART_RATE && 
                    heartRate <= MAX_HEART_RATE);
    bool spo2Valid = (spo2 >= MIN_SPO2 && 
                      spo2 <= MAX_SPO2);
    
    return (hrValid && spo2Valid && validHeartRate && validSPO2);
}

void SensorManager::resetMeasurement() {
    measuring = false;
    bufferFilled = false;
    bufferIndex = 0;
    currentMeasurement.valid = false;
    validHeartRate = 0;
    validSPO2 = 0;
    validSampleCount = 0;
    
    for (int i = 0; i < MAX_VALID_SAMPLES; i++) {
        hrSamples[i] = 0;
        spo2Samples[i] = 0;
    }
}

float SensorManager::calculateVariance(float* samples, int count) {
    if (count < 2) return 0;
    
    float mean = 0;
    for (int i = 0; i < count; i++) {
        mean += samples[i];
    }
    mean /= count;
    
    float variance = 0;
    for (int i = 0; i < count; i++) {
        float diff = samples[i] - mean;
        variance += diff * diff;
    }
    variance /= count;
    
    return sqrt(variance);  // Return standard deviation
}

float SensorManager::calculateConfidence() {
    if (validSampleCount == 0) return 0.0f;
    
    float hrStdDev = calculateVariance(hrSamples, validSampleCount);
    float spo2StdDev = calculateVariance(spo2Samples, validSampleCount);
    
    // Base confidence on number of samples and variance
    float sampleBonus = (float)validSampleCount / MAX_VALID_SAMPLES;  // 0.6 to 1.0
    
    // Penalize for high variance (lower is better)
    float hrPenalty = min(hrStdDev / MAX_HR_VARIANCE, 1.0f);
    float spo2Penalty = min(spo2StdDev / MAX_SPO2_VARIANCE, 1.0f);
    float variancePenalty = (hrPenalty + spo2Penalty) / 2.0f;
    
    // Confidence = base (0.7) + sample bonus (up to 0.2) - variance penalty (up to 0.2)
    float confidence = 0.7f + (sampleBonus * 0.2f) - (variancePenalty * 0.2f);
    
    return max(0.5f, min(0.99f, confidence));  // Clamp between 0.5 and 0.99
}
