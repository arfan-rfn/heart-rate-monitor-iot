/*
 * state_machine.cpp - Device State Machine Implementation
 * 
 * Implements the measurement lifecycle state machine:
 *   IDLE -> WAITING_FOR_USER -> MEASURING -> STABILIZING -> TRANSMITTING -> IDLE
 * 
 * Key behaviors:
 *   - Measurements are scheduled based on configurable interval (default 30 min)
 *   - Active time window restricts when measurements are requested (default 6AM-10PM)
 *   - Server configuration overrides defaults when fetched successfully
 *   - Visual feedback via LED patterns for each state
 *   - Timeout notifications sent when user doesn't respond
 */

#include "state_machine.h"
#include "config.h"
#include "led_controller.h"
#include "sensor_manager.h"
#include "network_manager.h"

extern LEDController ledController;
extern SensorManager sensorManager;
extern NetworkManager networkManager;

StateMachine::StateMachine() {
    currentState = STATE_IDLE;
    previousState = STATE_IDLE;
    stateStartTime = 0;
    lastMeasurementTime = 0;
    nextScheduledMeasurement = 0;
    retryCount = 0;
    
    // Initialize with default configuration from config.h
    setDefaultConfig();
}

/*
 * Set default configuration values from config.h.
 * Called on boot and can be called to reset to defaults.
 */
void StateMachine::setDefaultConfig() {
    config.measurementIntervalMs = MEASUREMENT_INTERVAL_MS;
    config.activeStartHour = DEFAULT_START_HOUR;
    config.activeStartMinute = DEFAULT_START_MINUTE;
    config.activeEndHour = DEFAULT_END_HOUR;
    config.activeEndMinute = DEFAULT_END_MINUTE;
    config.configValid = false;  // Will be set true when server config is applied
    
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

/*
 * Initialize the state machine.
 * Starts in IDLE state and schedules the first measurement.
 */
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

/*
 * Main update loop - called every iteration of loop().
 * Handles state-specific logic and transitions.
 */
void StateMachine::update() {
    unsigned long currentTime = millis();
    
    // === IDLE STATE ===
    // Wait for scheduled measurement time, then check if within active window
    if (currentState == STATE_IDLE) {
        // Periodic countdown display (every 10 seconds)
        static unsigned long lastCountdownUpdate = 0;
        if (currentTime - lastCountdownUpdate >= 10000) {
            int secondsRemaining = getSecondsUntilNextMeasurement();
            if (DEBUG_MODE) {
                Serial.printlnf("Next measurement in %d seconds (%d:%02d)", 
                              secondsRemaining,
                              secondsRemaining / 60,
                              secondsRemaining % 60);
                
                // Show time window status
                if (Time.isValid()) {
                    Serial.printlnf("Current time: %02d:%02d, Active: %s",
                                  Time.hour(), Time.minute(),
                                  isWithinActiveWindow() ? "YES" : "NO");
                }
            }
            lastCountdownUpdate = currentTime;
        }
        
        // Check if it's time for next measurement
        if (currentTime >= nextScheduledMeasurement) {
            // Verify we're within the active time window
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
                // Reschedule and stay in IDLE
                scheduleNextMeasurement();
                return;
            }
            
            // Start measurement cycle
            resetRetryCount();
            setState(STATE_WAITING_FOR_USER);
        }
    }
    
    // === WAITING_FOR_USER STATE ===
    // Wait for user to place finger on sensor, with timeout
    else if (currentState == STATE_WAITING_FOR_USER) {
        if (checkTimeout()) {
            // User didn't respond within timeout period
            if (DEBUG_MODE) Serial.println("User timeout - skipping measurement");
            
            ledController.flashWarning();  // Yellow flash
            
            // Notify server about timeout
            networkManager.sendTimeoutNotification();
            
            // Return to IDLE and schedule next measurement
            scheduleNextMeasurement();
            setState(STATE_IDLE);
        }
        else if (sensorManager.isFingerDetected()) {
            // User placed finger - start measurement
            setState(STATE_MEASURING);
        }
    }
    
    // Note: MEASURING, STABILIZING, TRANSMITTING states are handled by
    // SensorManager and NetworkManager, which call measurementComplete()
    // or measurementFailed() to transition back.
}

/*
 * Transition to a new state.
 * Handles cleanup of old state and initialization of new state.
 */
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

/*
 * Handle entering a new state.
 * Sets appropriate LED pattern and starts any state-specific actions.
 */
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
            ledController.setPattern(DEVICE_LED_BLINK_BLUE);  // Slow blue blink
            if (DEBUG_MODE) {
                Serial.println(">>> Place finger on sensor <<<");
                if (retryCount > 0) {
                    Serial.printlnf("Retry attempt %d/%d", 
                                  retryCount + 1, MAX_RETRY_ATTEMPTS);
                }
            }
            break;
            
        case STATE_MEASURING:
            ledController.setPattern(DEVICE_LED_SOLID_BLUE);  // Solid blue
            sensorManager.startMeasurement();
            break;
            
        case STATE_STABILIZING:
            ledController.setPattern(DEVICE_LED_PULSE_BLUE);  // Pulsing blue
            break;
            
        case STATE_TRANSMITTING:
            ledController.setPattern(DEVICE_LED_SOLID_CYAN);  // Solid cyan
            break;
    }
}

/*
 * Handle exiting a state.
 * Currently no cleanup needed, but available for future use.
 */
void StateMachine::exitState(DeviceState state) {
    // Cleanup if needed
}

/*
 * Check if current state has exceeded timeout.
 * Used for WAITING_FOR_USER state timeout (5 minutes default).
 */
bool StateMachine::checkTimeout() {
    return (millis() - stateStartTime) > MEASUREMENT_TIMEOUT_MS;
}

/*
 * Schedule the next measurement based on configured interval.
 */
void StateMachine::scheduleNextMeasurement() {
    nextScheduledMeasurement = millis() + config.measurementIntervalMs;
    lastMeasurementTime = millis();
}

/*
 * Get the configured measurement interval in milliseconds.
 */
unsigned long StateMachine::getMeasurementInterval() {
    return config.measurementIntervalMs;
}

/*
 * Force start a measurement cycle.
 * Useful for testing or manual triggers.
 */
void StateMachine::startMeasurementCycle() {
    setState(STATE_WAITING_FOR_USER);
}

/*
 * Called when measurement is complete and valid.
 * Transitions to TRANSMITTING state.
 */
void StateMachine::measurementComplete() {
    resetRetryCount();
    setState(STATE_TRANSMITTING);
}

/*
 * Called when measurement fails (finger removed, invalid reading, etc.).
 * Handles retry logic or returns to IDLE if max retries exceeded.
 */
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

/*
 * Get seconds until next scheduled measurement.
 */
int StateMachine::getSecondsUntilNextMeasurement() {
    if (millis() >= nextScheduledMeasurement) {
        return 0;
    }
    return (nextScheduledMeasurement - millis()) / 1000;
}

// Retry count management
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

/*
 * Get the current state.
 */
DeviceState StateMachine::getCurrentState() {
    return currentState;
}

/*
 * Check if device is waiting for user measurement input.
 */
bool StateMachine::isWaitingForMeasurement() {
    return currentState == STATE_WAITING_FOR_USER;
}

/*
 * Get human-readable state name for debugging.
 */
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

// ============================================================================
// Active Time Window Management
// ============================================================================

/*
 * Check if current time is within the active measurement window.
 * 
 * Returns true if:
 *   - Time hasn't synced yet (fail-open for reliability)
 *   - Current time is within configured start-end window
 *   
 * Handles both normal (6:00-22:00) and overnight (22:00-6:00) windows.
 */
bool StateMachine::isWithinActiveWindow() {
    // If time hasn't synced, allow measurements (fail-open)
    if (!Time.isValid()) {
        if (DEBUG_MODE) {
            Serial.println("Time not synced - allowing measurement");
        }
        return true;
    }
    
    int currentHour = Time.hour();
    int currentMinute = Time.minute();
    
    // Convert times to minutes since midnight for comparison
    int currentTimeMinutes = currentHour * 60 + currentMinute;
    int startTimeMinutes = config.activeStartHour * 60 + config.activeStartMinute;
    int endTimeMinutes = config.activeEndHour * 60 + config.activeEndMinute;
    
    // Normal case: start < end (e.g., 6:00 - 22:00)
    if (startTimeMinutes < endTimeMinutes) {
        return (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes);
    }
    // Overnight case: start > end (e.g., 22:00 - 6:00)
    else if (startTimeMinutes > endTimeMinutes) {
        return (currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes);
    }
    // Edge case: start == end means always active (24 hours)
    else {
        return true;
    }
}

// ============================================================================
// Configuration Management
// ============================================================================

/*
 * Get current device configuration.
 */
DeviceConfig StateMachine::getConfig() {
    return config;
}

/*
 * Parse time string "HH:MM" into hour and minute integers.
 */
void StateMachine::parseTimeString(String timeStr, int &hour, int &minute) {
    int colonIndex = timeStr.indexOf(':');
    if (colonIndex > 0) {
        hour = timeStr.substring(0, colonIndex).toInt();
        minute = timeStr.substring(colonIndex + 1).toInt();
        
        // Validate ranges
        if (hour < 0 || hour > 23) hour = 0;
        if (minute < 0 || minute > 59) minute = 0;
    } else {
        // Invalid format - use zeros
        hour = 0;
        minute = 0;
    }
}

/*
 * Apply new configuration from server.
 * Called by NetworkManager when config is successfully fetched.
 * 
 * @param frequencySeconds Measurement interval (15-14400 seconds)
 * @param startTime Active window start "HH:MM" (empty string = no change)
 * @param endTime Active window end "HH:MM" (empty string = no change)
 */
void StateMachine::applyConfiguration(int frequencySeconds, String startTime, String endTime) {
    // Update measurement interval (convert seconds to milliseconds)
    if (frequencySeconds > 0) {
        // Validate: minimum 15 seconds, maximum 4 hours (14400s)
        // Short intervals (30s, 60s) allowed for testing/demo
        if (frequencySeconds >= 15 && frequencySeconds <= 14400) {
            config.measurementIntervalMs = (unsigned long)frequencySeconds * 1000UL;
        } else if (DEBUG_MODE) {
            Serial.printlnf("Invalid frequency %d seconds (must be 15-14400s) - ignoring", frequencySeconds);
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
