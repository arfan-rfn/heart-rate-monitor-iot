#include "led_controller.h"
#include "config.h"

LEDController::LEDController() {
    currentPattern = DEVICE_LED_OFF;
    lastUpdate = 0;
    ledState = false;
    pulseValue = 0;
    pulseDirection = true;
}

void LEDController::begin() {
    RGB.control(true);
    RGB.brightness(50);
    setColor(0, 0, 0);
}

void LEDController::update() {
    switch (currentPattern) {
        case DEVICE_LED_OFF:
            setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_SOLID_BLUE:
            setColor(0, 0, 255);
            break;
            
        case DEVICE_LED_SOLID_GREEN:
            setColor(0, 255, 0);
            break;
            
        case DEVICE_LED_SOLID_YELLOW:
            setColor(255, 255, 0);
            break;
            
        case DEVICE_LED_SOLID_RED:
            setColor(255, 0, 0);
            break;
            
        case DEVICE_LED_SOLID_CYAN:
            setColor(0, 255, 255);
            break;
            
        case DEVICE_LED_BLINK_BLUE:
            updateBlink(LED_BLINK_SLOW);
            if (ledState) setColor(0, 0, 255);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_BLINK_GREEN:
            updateBlink(LED_BLINK_FAST);
            if (ledState) setColor(0, 255, 0);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_BLINK_YELLOW:
            updateBlink(LED_BLINK_FAST);
            if (ledState) setColor(255, 255, 0);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_BLINK_RED:
            updateBlink(LED_BLINK_FAST);
            if (ledState) setColor(255, 0, 0);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_PULSE_BLUE:
            updatePulse();
            setColor(0, 0, pulseValue);
            break;
            
        case DEVICE_LED_FLASH_GREEN:
        case DEVICE_LED_FLASH_YELLOW:
        case DEVICE_LED_FLASH_RED:
            break;
    }
}

void LEDController::setPattern(DeviceLEDPattern pattern) {
    currentPattern = pattern;
    lastUpdate = millis();
    ledState = false;
}

void LEDController::updateBlink(uint16_t interval) {
    unsigned long now = millis();
    if (now - lastUpdate >= interval) {
        ledState = !ledState;
        lastUpdate = now;
    }
}

void LEDController::updatePulse() {
    unsigned long now = millis();
    if (now - lastUpdate >= 10) {
        if (pulseDirection) {
            pulseValue += 5;
            if (pulseValue >= 255) {
                pulseValue = 255;
                pulseDirection = false;
            }
        } else {
            pulseValue -= 5;
            if (pulseValue <= 0) {
                pulseValue = 0;
                pulseDirection = true;
            }
        }
        lastUpdate = now;
    }
}

void LEDController::flashSuccess() {
    setColor(0, 255, 0);
    delay(LED_FLASH_DURATION);
    setPattern(DEVICE_LED_OFF);
}

void LEDController::flashWarning() {
    setColor(255, 255, 0);
    delay(LED_FLASH_DURATION);
    setPattern(DEVICE_LED_OFF);
}

void LEDController::flashError() {
    setColor(255, 0, 0);
    delay(LED_FLASH_DURATION);
    setPattern(DEVICE_LED_OFF);
}

void LEDController::setColor(uint8_t red, uint8_t green, uint8_t blue) {
    RGB.color(red, green, blue);
}
