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
    
    for (int i = 0; i < 100; i++) {
        irBuffer[i] = 0;
        redBuffer[i] = 0;
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
    
    if (millis() - measurementStartTime > 60000) {
        if (DEBUG_MODE) Serial.println("Measurement timeout");
        resetMeasurement();
        stateMachine.measurementFailed();
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
}
