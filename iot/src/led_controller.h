/*
 * led_controller.h - RGB LED Visual Feedback Controller
 * 
 * Controls the Photon 2's RGB LED to provide visual feedback
 * about device state and measurement results.
 * 
 * LED PATTERNS:
 *   - OFF:         Device idle
 *   - SOLID_CYAN:  Startup / transmitting
 *   - BLINK_BLUE:  Waiting for user to place finger (slow 1Hz blink)
 *   - SOLID_BLUE:  Measuring (collecting samples)
 *   - PULSE_BLUE:  Stabilizing (processing data)
 *   - FLASH_GREEN: Measurement sent successfully
 *   - FLASH_YELLOW: Measurement stored offline (no connection)
 *   - FLASH_RED:   Error condition
 *   - BLINK_RED:   Fatal error (sensor not found)
 */

#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H

#include "Particle.h"

/*
 * DeviceLEDPattern - Available LED patterns
 */
enum DeviceLEDPattern {
    DEVICE_LED_OFF,           // LED off
    DEVICE_LED_SOLID_BLUE,    // Solid blue
    DEVICE_LED_SOLID_GREEN,   // Solid green
    DEVICE_LED_SOLID_YELLOW,  // Solid yellow
    DEVICE_LED_SOLID_RED,     // Solid red
    DEVICE_LED_SOLID_CYAN,    // Solid cyan (startup/transmit)
    DEVICE_LED_BLINK_BLUE,    // Blinking blue (slow, waiting for user)
    DEVICE_LED_BLINK_GREEN,   // Blinking green (fast)
    DEVICE_LED_BLINK_YELLOW,  // Blinking yellow (fast)
    DEVICE_LED_BLINK_RED,     // Blinking red (fast, fatal error)
    DEVICE_LED_PULSE_BLUE,    // Pulsing blue (stabilizing)
    DEVICE_LED_FLASH_GREEN,   // Single green flash
    DEVICE_LED_FLASH_YELLOW,  // Single yellow flash
    DEVICE_LED_FLASH_RED      // Single red flash
};

/*
 * LEDController - Manages RGB LED patterns
 * 
 * Uses Particle's RGB.control() for direct LED control.
 * Patterns are updated in the update() method called from main loop.
 */
class LEDController {
public:
    LEDController();
    
    /*
     * Initialize LED controller.
     * Takes control of RGB LED from Particle OS.
     */
    void begin();
    
    /*
     * Update LED pattern animation.
     * Call from main loop.
     */
    void update();
    
    /*
     * Set the current LED pattern.
     */
    void setPattern(DeviceLEDPattern pattern);
    
    /*
     * Flash green to indicate successful transmission.
     */
    void flashSuccess();
    
    /*
     * Flash yellow to indicate offline storage.
     */
    void flashWarning();
    
    /*
     * Flash red to indicate error.
     */
    void flashError();
    
private:
    DeviceLEDPattern currentPattern;
    unsigned long lastUpdate;
    bool ledState;              // For blink patterns
    uint8_t pulseValue;         // For pulse patterns (0-255)
    bool pulseDirection;        // Pulse direction (true = increasing)
    
    /*
     * Set RGB LED color directly.
     */
    void setColor(uint8_t red, uint8_t green, uint8_t blue);
    
    /*
     * Update blink pattern animation.
     */
    void updateBlink(uint16_t interval);
    
    /*
     * Update pulse pattern animation.
     */
    void updatePulse();
};

#endif // LED_CONTROLLER_H
