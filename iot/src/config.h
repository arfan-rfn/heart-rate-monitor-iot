/*
 * config.h - Heart Track IoT Device Configuration
 * 
 * This file contains all configurable settings for the Heart Rate Monitor IoT device.
 * Modify the values below to match your deployment environment.
 * 
 * DUAL MODE SUPPORT:
 * The device supports two connection modes controlled by USE_WEBHOOK:
 * 
 *   - USE_WEBHOOK false (Local Development):
 *     Device connects directly to API server via HTTP.
 *     Use when running api-server locally on your computer.
 *     Set API_SERVER_HOST to your computer's IP (not "localhost").
 * 
 *   - USE_WEBHOOK true (Vercel Production):
 *     Device publishes events to Particle Cloud, which forwards to Vercel via HTTPS.
 *     Requires webhook configuration in Particle Console (see WEBHOOK_SETUP.md).
 *     Set API_SERVER_HOST to your Vercel domain.
 */

#ifndef CONFIG_H
#define CONFIG_H

// ============================================================================
// CONNECTION MODE CONFIGURATION
// ============================================================================
// 
// Choose ONE of the configurations below by uncommenting it.
// The device will use the selected mode for all API communication.
//

// ----- OPTION 1: LOCAL DEVELOPMENT (Direct HTTP) -----
// Use when running api-server on your local machine.
// Device connects directly via HTTP to your computer's IP.
// No webhook configuration needed.
//
// #define API_SERVER_HOST "192.168.1.100"  // Your computer's local IP
// #define API_SERVER_PORT 4000              // Local server port
// #define USE_WEBHOOK false                 // Direct HTTP connection

// ----- OPTION 2: VERCEL PRODUCTION (HTTPS via Webhooks) -----
// Use for production with Vercel-hosted API.
// Device publishes to Particle Cloud; webhooks forward to Vercel.
// REQUIRES: Configure webhooks in Particle Console (see WEBHOOK_SETUP.md)
//
#define API_SERVER_HOST "heart-rate-monitor-iot.vercel.app"
#define API_SERVER_PORT 443
#define USE_WEBHOOK true

// ============================================================================
// API KEY CONFIGURATION
// ============================================================================
// 
// Get your API key by registering your device in the web application:
// 1. Log in to the web app (localhost:3000 for local, or Vercel URL)
// 2. Navigate to Devices page
// 3. Click "Register New Device" and enter your Particle Device ID
// 4. Copy the generated API key (only shown once!)
// 5. Paste it below
//
#define API_KEY "YOUR_API_KEY"

// ============================================================================
// WIFI CONFIGURATION
// ============================================================================
// 
// Replace with your WiFi network credentials.
// The Photon 2 supports both 2.4GHz and 5GHz networks.
//
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"

// ============================================================================
// HARDWARE PIN CONFIGURATION
// ============================================================================
// 
// MAX30102/MAX30105 sensor I2C connections.
// These are the standard I2C pins on the Photon 2.
//
#define MAX30102_SDA D0          // I2C Data line
#define MAX30102_SCL D1          // I2C Clock line
#define STATUS_LED D7            // Onboard status LED (if used)

// ============================================================================
// MEASUREMENT TIMING CONFIGURATION
// ============================================================================
// 
// Default values used until server configuration is fetched.
// The server can override these via the /api/devices/{id}/config endpoint.
//
#define MEASUREMENT_INTERVAL_MS 1800000  // Default interval: 30 minutes
#define MEASUREMENT_TIMEOUT_MS 300000    // User response timeout: 5 minutes
#define FINGER_THRESHOLD 50000           // IR threshold for finger detection
#define MAX_RETRY_ATTEMPTS 3             // Retry count for failed measurements

// ============================================================================
// ACTIVE TIME WINDOW CONFIGURATION
// ============================================================================
// 
// Default active measurement window (per project requirements).
// Measurements are only requested during this time window.
// The server can override these values.
//
#define DEFAULT_START_HOUR 6       // Active window starts: 6:00 AM
#define DEFAULT_START_MINUTE 0
#define DEFAULT_END_HOUR 22        // Active window ends: 10:00 PM
#define DEFAULT_END_MINUTE 0

// ============================================================================
// HEART RATE & SPO2 VALIDATION
// ============================================================================
// 
// Valid ranges for physiological measurements.
// Readings outside these ranges are considered invalid.
//
#define MIN_HEART_RATE 40          // Minimum valid heart rate (bpm)
#define MAX_HEART_RATE 200         // Maximum valid heart rate (bpm)
#define MIN_SPO2 70                // Minimum valid SpO2 (%)
#define MAX_SPO2 100               // Maximum valid SpO2 (%)

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================
// 
// Connection and retry settings for network operations.
//
#define CONNECTION_TIMEOUT_MS 10000      // HTTP connection timeout: 10 seconds
#define MAX_NETWORK_RETRY 3              // Retry count for failed transmissions
#define CONFIG_FETCH_INTERVAL_MS 3600000 // Fetch config from server: every hour

// ============================================================================
// LED PATTERN TIMING
// ============================================================================
// 
// Timing for RGB LED visual feedback patterns.
//
#define LED_BLINK_SLOW 1000        // Slow blink interval (ms) - waiting for user
#define LED_BLINK_FAST 250         // Fast blink interval (ms) - errors
#define LED_FLASH_DURATION 200     // Single flash duration (ms) - success/warning

// ============================================================================
// OFFLINE STORAGE CONFIGURATION
// ============================================================================
// 
// EEPROM-based storage for measurements when offline.
// Stored measurements are automatically synced when connectivity is restored.
//
#define MAX_STORED_MEASUREMENTS 48 // Max offline storage (24h at 30-min intervals)

// ============================================================================
// EEPROM ADDRESS LAYOUT
// ============================================================================
// 
// Memory addresses for persistent storage.
//
#define EEPROM_CONFIG_ADDR 0              // Config storage start address
#define EEPROM_CONFIG_VALID_MARKER 0xABCD // Marker for valid config
#define EEPROM_MEASUREMENTS_ADDR 64       // Measurement storage start address

// ============================================================================
// DEBUG MODE
// ============================================================================
// 
// Enable verbose serial output for debugging.
// Set to false for production to reduce serial traffic.
//
#define DEBUG_MODE true

#endif // CONFIG_H
