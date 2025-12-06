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
    
    // Initialize with default configuration
    setDefaultConfig();
}

void StateMachine::setDefaultConfig() {
    config.measurementIntervalMs = MEASUREMENT_INTERVAL_MS;
    config.activeStartHour = DEFAULT_START_HOUR;
    config.activeStartMinute = DEFAULT_START_MINUTE;
    config.activeEndHour = DEFAULT_END_HOUR;
    config.activeEndMinute = DEFAULT_END_MINUTE;
    config.configValid = false;  // Will be set to true when fetched from server
    
    if (DEBUG_MODE) {
        Serial.println("Default config loaded:");
        Serial.printlnf("  Interval: %lu ms (%lu min)", 
                        config.measurementIntervalMs,
                        config.measurementIntervalMs / 60000);
        Serial.printlnf("  Active window: %02d:%02d - %02d:%02d",
                        config.activeStartHour, config.activeStartMinute,
                        config.activeEndHour, config.activeEndMinute);
    }
}

void StateMachine::begin() {
    currentState = STATE_IDLE;
    scheduleNextMeasurement();
    
    if (DEBUG_MODE) {
        Serial.println("State Machine Initialized");
        Serial.printlnf("Active window: %02d:%02d - %02d:%02d",
                        config.activeStartHour, config.activeStartMinute,
                        config.activeEndHour, config.activeEndMinute);
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
                
                // Also show time window status periodically
                if (Time.isValid()) {
                    Serial.printlnf("Current time: %02d:%02d, Active: %s",
                                  Time.hour(), Time.minute(),
                                  isWithinActiveWindow() ? "YES" : "NO");
                }
            }
            lastCountdownUpdate = currentTime;
        }
        
        if (currentTime >= nextScheduledMeasurement) {
            // Check if we're within the active time window before requesting measurement
            if (!isWithinActiveWindow()) {
                if (DEBUG_MODE) {
                    Serial.println("Outside active window - skipping measurement");
                    Serial.printlnf("Active window: %02d:%02d - %02d:%02d",
                                  config.activeStartHour, config.activeStartMinute,
                                  config.activeEndHour, config.activeEndMinute);
                    if (Time.isValid()) {
                        Serial.printlnf("Current time: %02d:%02d", Time.hour(), Time.minute());
                    }
                }
                // Schedule next check and stay in IDLE
                scheduleNextMeasurement();
                return;
            }
            
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
    nextScheduledMeasurement = millis() + config.measurementIntervalMs;
    lastMeasurementTime = millis();
}

unsigned long StateMachine::getMeasurementInterval() {
    return config.measurementIntervalMs;
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

// ==================== Time Window Management ====================

bool StateMachine::isWithinActiveWindow() {
    // If time hasn't been synced yet, allow measurements (fail-open)
    if (!Time.isValid()) {
        if (DEBUG_MODE) {
            Serial.println("Time not synced - allowing measurement");
        }
        return true;
    }
    
    int currentHour = Time.hour();
    int currentMinute = Time.minute();
    
    // Convert times to minutes since midnight for easy comparison
    int currentTimeMinutes = currentHour * 60 + currentMinute;
    int startTimeMinutes = config.activeStartHour * 60 + config.activeStartMinute;
    int endTimeMinutes = config.activeEndHour * 60 + config.activeEndMinute;
    
    // Handle normal case (start < end, e.g., 6:00 - 22:00)
    if (startTimeMinutes < endTimeMinutes) {
        return (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes);
    }
    // Handle overnight case (start > end, e.g., 22:00 - 6:00) - rare but supported
    else if (startTimeMinutes > endTimeMinutes) {
        return (currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes);
    }
    // Start == End means always active (24 hours)
    else {
        return true;
    }
}

// ==================== Configuration Management ====================

DeviceConfig StateMachine::getConfig() {
    return config;
}

void StateMachine::parseTimeString(String timeStr, int &hour, int &minute) {
    // Parse "HH:MM" format
    int colonIndex = timeStr.indexOf(':');
    if (colonIndex > 0) {
        hour = timeStr.substring(0, colonIndex).toInt();
        minute = timeStr.substring(colonIndex + 1).toInt();
        
        // Validate ranges
        if (hour < 0 || hour > 23) hour = 0;
        if (minute < 0 || minute > 59) minute = 0;
    } else {
        // Invalid format, use defaults
        hour = 0;
        minute = 0;
    }
}

void StateMachine::applyConfiguration(int frequencySeconds, String startTime, String endTime) {
    // Update measurement interval (convert seconds to milliseconds)
    if (frequencySeconds > 0) {
        // Validate: minimum 15 minutes (900s), maximum 4 hours (14400s)
        if (frequencySeconds >= 900 && frequencySeconds <= 14400) {
            config.measurementIntervalMs = (unsigned long)frequencySeconds * 1000UL;
        } else if (DEBUG_MODE) {
            Serial.printlnf("Invalid frequency %d seconds - ignoring", frequencySeconds);
        }
    }
    
    // Update active start time
    if (startTime.length() > 0) {
        parseTimeString(startTime, config.activeStartHour, config.activeStartMinute);
    }
    
    // Update active end time
    if (endTime.length() > 0) {
        parseTimeString(endTime, config.activeEndHour, config.activeEndMinute);
    }
    
    // Mark config as valid (received from server)
    config.configValid = true;
    
    if (DEBUG_MODE) {
        Serial.println("Configuration updated from server:");
        Serial.printlnf("  Interval: %lu ms (%lu min)", 
                        config.measurementIntervalMs,
                        config.measurementIntervalMs / 60000);
        Serial.printlnf("  Active window: %02d:%02d - %02d:%02d",
                        config.activeStartHour, config.activeStartMinute,
                        config.activeEndHour, config.activeEndMinute);
    }
    
    // Reschedule next measurement with new interval
    scheduleNextMeasurement();
}
