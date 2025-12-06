#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include "Particle.h"

enum DeviceState {
    STATE_IDLE,
    STATE_WAITING_FOR_USER,
    STATE_MEASURING,
    STATE_STABILIZING,
    STATE_TRANSMITTING
};

// Device configuration structure (fetched from server or defaults)
struct DeviceConfig {
    unsigned long measurementIntervalMs;  // Interval between measurements in ms
    int activeStartHour;                   // Start hour for active window (0-23)
    int activeStartMinute;                 // Start minute for active window (0-59)
    int activeEndHour;                     // End hour for active window (0-23)
    int activeEndMinute;                   // End minute for active window (0-59)
    bool configValid;                      // True if config has been fetched from server
};

class StateMachine {
public:
    StateMachine();
    
    void begin();
    void update();
    
    DeviceState getCurrentState();
    void setState(DeviceState newState);
    
    bool isWaitingForMeasurement();
    void startMeasurementCycle();
    void measurementComplete();
    void measurementFailed();
    void scheduleNextMeasurement();
    
    int getSecondsUntilNextMeasurement();
    
    void incrementRetryCount();
    void resetRetryCount();
    int getRetryCount();
    bool canRetry();
    
    // Time-of-day window management
    bool isWithinActiveWindow();
    
    // Configuration management
    DeviceConfig getConfig();
    void applyConfiguration(int frequencySeconds, String startTime, String endTime);
    void setDefaultConfig();
    unsigned long getMeasurementInterval();
    
private:
    DeviceState currentState;
    DeviceState previousState;
    unsigned long stateStartTime;
    unsigned long lastMeasurementTime;
    unsigned long nextScheduledMeasurement;
    int retryCount;
    
    // Device configuration
    DeviceConfig config;
    
    void enterState(DeviceState state);
    void exitState(DeviceState state);
    bool checkTimeout();
    
    // Helper to parse time string "HH:MM" into hour and minute
    void parseTimeString(String timeStr, int &hour, int &minute);
    
    const char* getStateName(DeviceState state);
};

#endif
