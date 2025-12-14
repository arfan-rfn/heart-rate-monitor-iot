/*
 * state_machine.h - Device State Machine & Scheduling
 * 
 * Implements a synchronous state machine that manages the measurement lifecycle.
 * Handles scheduling, state transitions, and server-configurable settings.
 * 
 * STATE FLOW:
 *   IDLE -> WAITING_FOR_USER -> MEASURING -> STABILIZING -> TRANSMITTING -> IDLE
 * 
 * States:
 *   - IDLE: Waiting for next scheduled measurement
 *   - WAITING_FOR_USER: Prompting user to place finger (blue LED blinking)
 *   - MEASURING: Collecting sensor samples (solid blue LED)
 *   - STABILIZING: Averaging readings for accuracy (pulsing blue LED)
 *   - TRANSMITTING: Sending data to server (cyan LED)
 * 
 * Configuration:
 *   Device configuration (measurement frequency, active hours) can be set by:
 *   1. Default values in config.h
 *   2. Server configuration fetched from GET /api/devices/{id}/config
 *   
 *   Server configuration takes precedence when successfully fetched.
 */

#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include "Particle.h"

/*
 * DeviceState - Possible states in the measurement lifecycle
 */
enum DeviceState {
    STATE_IDLE,              // Waiting for scheduled measurement time
    STATE_WAITING_FOR_USER,  // Prompting user to place finger on sensor
    STATE_MEASURING,         // Actively collecting sensor samples
    STATE_STABILIZING,       // Processing and averaging readings
    STATE_TRANSMITTING       // Sending measurement to API server
};

/*
 * DeviceConfig - Server-configurable device settings
 * 
 * These values are fetched from the server via GET /api/devices/{id}/config
 * and can be updated dynamically without reflashing the device.
 */
struct DeviceConfig {
    unsigned long measurementIntervalMs;  // Interval between measurements (ms)
    int activeStartHour;                  // Active window start hour (0-23)
    int activeStartMinute;                // Active window start minute (0-59)
    int activeEndHour;                    // Active window end hour (0-23)
    int activeEndMinute;                  // Active window end minute (0-59)
    bool configValid;                     // True if config fetched from server
};

/*
 * StateMachine - Manages device state and measurement scheduling
 * 
 * Primary responsibilities:
 *   1. Manage state transitions in the measurement lifecycle
 *   2. Schedule measurements based on configured interval
 *   3. Enforce active time window for measurements
 *   4. Apply server configuration when fetched
 *   5. Handle measurement retries and timeouts
 */
class StateMachine {
public:
    StateMachine();
    
    /*
     * Initialize the state machine with default configuration.
     * Schedules the first measurement.
     */
    void begin();
    
    /*
     * Periodic update - call from main loop.
     * Handles state transitions and scheduled measurement triggers.
     */
    void update();
    
    /*
     * Get the current state.
     */
    DeviceState getCurrentState();
    
    /*
     * Transition to a new state.
     * Handles exit actions for old state and enter actions for new state.
     */
    void setState(DeviceState newState);
    
    /*
     * Check if device is waiting for user to start measurement.
     */
    bool isWaitingForMeasurement();
    
    /*
     * Force start a measurement cycle (for testing/manual trigger).
     */
    void startMeasurementCycle();
    
    /*
     * Called by SensorManager when measurement is complete.
     * Transitions to TRANSMITTING state.
     */
    void measurementComplete();
    
    /*
     * Called by SensorManager when measurement fails.
     * Handles retry logic or returns to IDLE.
     */
    void measurementFailed();
    
    /*
     * Schedule the next measurement based on configured interval.
     */
    void scheduleNextMeasurement();
    
    /*
     * Get seconds until next scheduled measurement.
     */
    int getSecondsUntilNextMeasurement();
    
    // Retry management
    void incrementRetryCount();
    void resetRetryCount();
    int getRetryCount();
    bool canRetry();
    
    /*
     * Check if current time is within the active measurement window.
     * Returns true if measurements should be requested now.
     * If time hasn't synced yet, returns true (fail-open).
     */
    bool isWithinActiveWindow();
    
    /*
     * Get current device configuration.
     */
    DeviceConfig getConfig();
    
    /*
     * Apply new configuration from server.
     * Called by NetworkManager when config is fetched.
     * 
     * @param frequencySeconds Measurement interval in seconds (15-14400)
     * @param startTime Active window start time "HH:MM"
     * @param endTime Active window end time "HH:MM"
     */
    void applyConfiguration(int frequencySeconds, String startTime, String endTime);
    
    /*
     * Reset to default configuration from config.h.
     */
    void setDefaultConfig();
    
    /*
     * Get current measurement interval in milliseconds.
     */
    unsigned long getMeasurementInterval();
    
private:
    DeviceState currentState;
    DeviceState previousState;
    unsigned long stateStartTime;
    unsigned long lastMeasurementTime;
    unsigned long nextScheduledMeasurement;
    int retryCount;
    
    // Device configuration (server-controlled)
    DeviceConfig config;
    
    // State transition handlers
    void enterState(DeviceState state);
    void exitState(DeviceState state);
    
    /*
     * Check if current state has timed out.
     */
    bool checkTimeout();
    
    /*
     * Parse time string "HH:MM" into hour and minute.
     */
    void parseTimeString(String timeStr, int &hour, int &minute);
    
    /*
     * Get human-readable state name for debugging.
     */
    const char* getStateName(DeviceState state);
};

#endif // STATE_MACHINE_H
