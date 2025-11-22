#include "state_machine.h"
#include "config.h"
#include "led_controller.h"
#include "sensor_manager.h"

extern LEDController ledController;
extern SensorManager sensorManager;

StateMachine::StateMachine() {
    currentState = STATE_IDLE;
    previousState = STATE_IDLE;
    stateStartTime = 0;
    lastMeasurementTime = 0;
    nextScheduledMeasurement = 0;
    retryCount = 0;
}

void StateMachine::begin() {
    currentState = STATE_IDLE;
    scheduleNextMeasurement();
    
    if (DEBUG_MODE) {
        Serial.println("State Machine Initialized");
        Serial.printlnf("Next measurement in %d seconds", 
                        getSecondsUntilNextMeasurement());
    }
}

void StateMachine::update() {
    unsigned long currentTime = millis();
    
    if (currentState == STATE_IDLE) {
        static unsigned long lastCountdownUpdate = 0;
        if (currentTime - lastCountdownUpdate >= 10000) {
            int secondsRemaining = getSecondsUntilNextMeasurement();
            if (DEBUG_MODE) {
                Serial.printlnf("Next measurement in %d seconds (%d:%02d)", 
                              secondsRemaining,
                              secondsRemaining / 60,
                              secondsRemaining % 60);
            }
            lastCountdownUpdate = currentTime;
        }
        
        if (currentTime >= nextScheduledMeasurement) {
            resetRetryCount();
            setState(STATE_WAITING_FOR_USER);
        }
    }
    
    else if (currentState == STATE_WAITING_FOR_USER) {
        if (checkTimeout()) {
            if (DEBUG_MODE) Serial.println("User timeout - skipping measurement");
            scheduleNextMeasurement();
            setState(STATE_IDLE);
        }
        else if (sensorManager.isFingerDetected()) {
            setState(STATE_MEASURING);
        }
    }
}

void StateMachine::setState(DeviceState newState) {
    if (newState != currentState) {
        exitState(currentState);
        previousState = currentState;
        currentState = newState;
        stateStartTime = millis();
        enterState(newState);
        
        if (DEBUG_MODE) {
            Serial.printlnf("State: %s -> %s", 
                          getStateName(previousState), 
                          getStateName(currentState));
        }
    }
}

void StateMachine::enterState(DeviceState state) {
    switch (state) {
        case STATE_IDLE:
            ledController.setPattern(DEVICE_LED_OFF);
            if (DEBUG_MODE) {
                Serial.printlnf("Next measurement in %d seconds", 
                              getSecondsUntilNextMeasurement());
            }
            break;
            
        case STATE_WAITING_FOR_USER:
            ledController.setPattern(DEVICE_LED_BLINK_BLUE);
            if (DEBUG_MODE) {
                Serial.println(">>> Place finger on sensor <<<");
                if (retryCount > 0) {
                    Serial.printlnf("Retry attempt %d/%d", 
                                  retryCount + 1, MAX_RETRY_ATTEMPTS);
                }
            }
            break;
            
        case STATE_MEASURING:
            ledController.setPattern(DEVICE_LED_SOLID_BLUE);
            sensorManager.startMeasurement();
            break;
            
        case STATE_STABILIZING:
            ledController.setPattern(DEVICE_LED_PULSE_BLUE);
            break;
            
        case STATE_TRANSMITTING:
            ledController.setPattern(DEVICE_LED_SOLID_CYAN);
            break;
    }
}

void StateMachine::exitState(DeviceState state) {
    // Cleanup
}

bool StateMachine::checkTimeout() {
    return (millis() - stateStartTime) > MEASUREMENT_TIMEOUT_MS;
}

void StateMachine::scheduleNextMeasurement() {
    nextScheduledMeasurement = millis() + MEASUREMENT_INTERVAL_MS;
    lastMeasurementTime = millis();
}

void StateMachine::startMeasurementCycle() {
    setState(STATE_WAITING_FOR_USER);
}

void StateMachine::measurementComplete() {
    resetRetryCount();
    setState(STATE_TRANSMITTING);
}

void StateMachine::measurementFailed() {
    if (canRetry()) {
        incrementRetryCount();
        if (DEBUG_MODE) {
            Serial.printlnf("Measurement failed - retry %d/%d", 
                          retryCount, MAX_RETRY_ATTEMPTS);
        }
        setState(STATE_WAITING_FOR_USER);
    } else {
        if (DEBUG_MODE) {
            Serial.println("Max retries reached - skipping");
        }
        resetRetryCount();
        scheduleNextMeasurement();
        setState(STATE_IDLE);
    }
}

int StateMachine::getSecondsUntilNextMeasurement() {
    if (millis() >= nextScheduledMeasurement) {
        return 0;
    }
    return (nextScheduledMeasurement - millis()) / 1000;
}

void StateMachine::incrementRetryCount() {
    retryCount++;
}

void StateMachine::resetRetryCount() {
    retryCount = 0;
}

int StateMachine::getRetryCount() {
    return retryCount;
}

bool StateMachine::canRetry() {
    return retryCount < MAX_RETRY_ATTEMPTS;
}

DeviceState StateMachine::getCurrentState() {
    return currentState;
}

bool StateMachine::isWaitingForMeasurement() {
    return currentState == STATE_WAITING_FOR_USER;
}

const char* StateMachine::getStateName(DeviceState state) {
    switch (state) {
        case STATE_IDLE: return "IDLE";
        case STATE_WAITING_FOR_USER: return "WAITING_FOR_USER";
        case STATE_MEASURING: return "MEASURING";
        case STATE_STABILIZING: return "STABILIZING";
        case STATE_TRANSMITTING: return "TRANSMITTING";
        default: return "UNKNOWN";
    }
}
