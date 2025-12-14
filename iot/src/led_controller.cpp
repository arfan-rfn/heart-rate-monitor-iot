/*
 * led_controller.cpp - RGB LED Visual Feedback Implementation
 * 
 * Implements LED pattern animations for device state feedback.
 * Takes control of the RGB LED from Particle OS using RGB.control(true).
 * 
 * PATTERN TIMING:
 *   - Slow blink: 1000ms on/off (waiting for user)
 *   - Fast blink: 250ms on/off (error states)
 *   - Pulse: Smooth fade over ~1 second
 *   - Flash: 200ms single color burst
 */

#include "led_controller.h"
#include "config.h"

LEDController::LEDController() {
    currentPattern = DEVICE_LED_OFF;
    lastUpdate = 0;
    ledState = false;
    pulseValue = 0;
    pulseDirection = true;
}

/*
 * Initialize LED controller.
 * Takes control of RGB LED and sets initial brightness.
 */
void LEDController::begin() {
    RGB.control(true);      // Take control from Particle OS
    RGB.brightness(50);     // 50% brightness to reduce glare
    setColor(0, 0, 0);      // Start with LED off
}

/*
 * Update LED pattern animation.
 * Called from main loop to animate blink and pulse patterns.
 */
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
            // Slow blink for waiting for user state
            updateBlink(LED_BLINK_SLOW);
            if (ledState) setColor(0, 0, 255);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_BLINK_GREEN:
            // Fast blink (less common)
            updateBlink(LED_BLINK_FAST);
            if (ledState) setColor(0, 255, 0);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_BLINK_YELLOW:
            // Fast yellow blink
            updateBlink(LED_BLINK_FAST);
            if (ledState) setColor(255, 255, 0);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_BLINK_RED:
            // Fast red blink for fatal errors
            updateBlink(LED_BLINK_FAST);
            if (ledState) setColor(255, 0, 0);
            else setColor(0, 0, 0);
            break;
            
        case DEVICE_LED_PULSE_BLUE:
            // Smooth blue pulse for stabilizing state
            updatePulse();
            setColor(0, 0, pulseValue);
            break;
            
        case DEVICE_LED_FLASH_GREEN:
        case DEVICE_LED_FLASH_YELLOW:
        case DEVICE_LED_FLASH_RED:
            // Flash patterns are one-shot, handled by flash methods
            break;
    }
}

/*
 * Set the current LED pattern.
 * Resets animation state for blink/pulse patterns.
 */
void LEDController::setPattern(DeviceLEDPattern pattern) {
    currentPattern = pattern;
    lastUpdate = millis();
    ledState = false;
}

/*
 * Update blink pattern timing.
 * Toggles ledState at specified interval.
 */
void LEDController::updateBlink(uint16_t interval) {
    unsigned long now = millis();
    if (now - lastUpdate >= interval) {
        ledState = !ledState;
        lastUpdate = now;
    }
}

/*
 * Update pulse pattern animation.
 * Smoothly fades pulseValue from 0 to 255 and back.
 */
void LEDController::updatePulse() {
    unsigned long now = millis();
    if (now - lastUpdate >= 10) {  // Update every 10ms for smooth animation
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

/*
 * Flash green to indicate successful transmission.
 * Blocking call - delays for flash duration.
 */
void LEDController::flashSuccess() {
    setColor(0, 255, 0);
    delay(LED_FLASH_DURATION);
    setPattern(DEVICE_LED_OFF);
}

/*
 * Flash yellow to indicate measurement stored offline.
 * Blocking call - delays for flash duration.
 */
void LEDController::flashWarning() {
    setColor(255, 255, 0);
    delay(LED_FLASH_DURATION);
    setPattern(DEVICE_LED_OFF);
}

/*
 * Flash red to indicate error.
 * Blocking call - delays for flash duration.
 */
void LEDController::flashError() {
    setColor(255, 0, 0);
    delay(LED_FLASH_DURATION);
    setPattern(DEVICE_LED_OFF);
}

/*
 * Set RGB LED color directly.
 * Uses Particle RGB.color() API.
 */
void LEDController::setColor(uint8_t red, uint8_t green, uint8_t blue) {
    RGB.color(red, green, blue);
}
