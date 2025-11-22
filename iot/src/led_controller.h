#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H

#include "Particle.h"

enum DeviceLEDPattern {
    DEVICE_LED_OFF,
    DEVICE_LED_SOLID_BLUE,
    DEVICE_LED_SOLID_GREEN,
    DEVICE_LED_SOLID_YELLOW,
    DEVICE_LED_SOLID_RED,
    DEVICE_LED_SOLID_CYAN,
    DEVICE_LED_BLINK_BLUE,
    DEVICE_LED_BLINK_GREEN,
    DEVICE_LED_BLINK_YELLOW,
    DEVICE_LED_BLINK_RED,
    DEVICE_LED_PULSE_BLUE,
    DEVICE_LED_FLASH_GREEN,
    DEVICE_LED_FLASH_YELLOW,
    DEVICE_LED_FLASH_RED
};

class LEDController {
public:
    LEDController();
    
    void begin();
    void update();
    void setPattern(DeviceLEDPattern pattern);
    void flashSuccess();
    void flashWarning();
    void flashError();
    
private:
    DeviceLEDPattern currentPattern;
    unsigned long lastUpdate;
    bool ledState;
    uint8_t pulseValue;
    bool pulseDirection;
    
    void setColor(uint8_t red, uint8_t green, uint8_t blue);
    void updateBlink(uint16_t interval);
    void updatePulse();
};

#endif
