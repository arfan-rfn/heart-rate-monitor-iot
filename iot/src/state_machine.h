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
    
private:
    DeviceState currentState;
    DeviceState previousState;
    unsigned long stateStartTime;
    unsigned long lastMeasurementTime;
    unsigned long nextScheduledMeasurement;
    int retryCount;
    
    void enterState(DeviceState state);
    void exitState(DeviceState state);
    bool checkTimeout();
    
    const char* getStateName(DeviceState state);
};

#endif
