#ifndef CONFIG_H
#define CONFIG_H

// ==================== API SERVER CONNECTION STRING ====================
// 
// This is the connection string for your API server.
// The IoT device will POST measurements to: {API_SERVER_URL}/api/measurements
// 
// FOR LOCAL DEVELOPMENT:
//   1. Find your Mac's IP: ifconfig | grep "inet " | grep -v 127.0.0.1
//   2. Use that IP with port 4000, e.g.: "192.168.1.100:4000"
//
// FOR AWS EC2 PRODUCTION:
//   Use your EC2 public IP or domain, e.g.: "54.123.45.67:4000"
//
#define API_SERVER_HOST "IP/Domain"   // <-- CHANGE THIS (IP or domain, no http://)
#define API_SERVER_PORT 4000

// ==================== API Key Configuration ====================
// Get your API key from the web app:
// 1. Log in to the web app (http://localhost:3000 for local, or your EC2 URL)
// 2. Go to Devices page
// 3. Register your device (use your Particle device ID)
// 4. Copy the API key shown (only displayed once!)
// 5. Paste it below
//
#define API_KEY "My_API_Key"   // <-- CHANGE THIS to your device API key
//t5@t.com
// ==================== WiFi Configuration ====================
// Replace with your WiFi credentials
#define WIFI_SSID "MY_SSID"
#define WIFI_PASSWORD "MY_PASSWORD"

// ==================== Hardware Configuration ====================
#define MAX30102_SDA D0
#define MAX30102_SCL D1
#define STATUS_LED D7

// ==================== Measurement Configuration ====================
#define MEASUREMENT_INTERVAL_MS 1800000    // 30 minutes (server config overrides this)
#define MEASUREMENT_TIMEOUT_MS 300000    // 5 minutes
#define FINGER_THRESHOLD 50000
#define MAX_RETRY_ATTEMPTS 3

// ==================== Time-of-Day Configuration ====================
// Default active window for measurements (per project requirements)
// Measurements will only be requested during this time window
// These defaults are used until server config is fetched
#define DEFAULT_START_HOUR 6       // 6:00 AM (per project spec)
#define DEFAULT_START_MINUTE 0
#define DEFAULT_END_HOUR 22        // 10:00 PM
#define DEFAULT_END_MINUTE 0

// ==================== Timezone Configuration ====================
// Default timezone offset in hours from UTC
// This is overridden by the user's timezone setting from the server
// Common offsets: -8 (PST), -7 (MST/PDT), -6 (CST), -5 (EST), -4 (EDT), 0 (UTC)
#define DEFAULT_TIMEZONE_OFFSET -7.0f  // Default to MST (Arizona)

// ==================== Heart Rate & SpO2 Configuration ====================
#define MIN_HEART_RATE 40
#define MAX_HEART_RATE 200
#define MIN_SPO2 70
#define MAX_SPO2 100

// ==================== Measurement Accuracy Configuration ====================
// Collect multiple valid readings and average for better accuracy
#define MIN_VALID_SAMPLES 3           // Minimum valid readings before accepting
#define MAX_VALID_SAMPLES 5           // Stop after this many valid readings
#define MAX_HR_VARIANCE 10            // Max acceptable variance in HR readings (bpm)
#define MAX_SPO2_VARIANCE 3           // Max acceptable variance in SpO2 readings (%)

// ==================== Network Configuration ====================
#define CONNECTION_TIMEOUT_MS 10000
#define MAX_NETWORK_RETRY 3
#define CONFIG_FETCH_INTERVAL_MS 3600000  // Fetch config from server every hour

// ==================== LED Patterns ====================
#define LED_BLINK_SLOW 1000
#define LED_BLINK_FAST 250
#define LED_FLASH_DURATION 200

// ==================== Storage Configuration ====================
// Maximum stored measurements for offline operation
// At minimum 15-min intervals (900s), 24 hours = 96 measurements
// At default 30-min intervals (1800s), 24 hours = 48 measurements
// Using 96 to support full 24 hours at minimum frequency
#define MAX_STORED_MEASUREMENTS 96

// ==================== EEPROM Configuration Addresses ====================
#define EEPROM_CONFIG_ADDR 0
#define EEPROM_CONFIG_VALID_MARKER 0xABCD
#define EEPROM_MEASUREMENTS_ADDR 64 //min time config on the patient portal

// ==================== Debug ====================
#define DEBUG_MODE true

#endif
