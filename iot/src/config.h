#ifndef CONFIG_H
#define CONFIG_H

// ==================== WiFi Configuration ====================
// Replace with your WiFi credentials
#define WIFI_SSID "SKYNET Mobile Comms"
#define WIFI_PASSWORD "12345678"

// ==================== Hardware Configuration ====================
#define MAX30102_SDA D0
#define MAX30102_SCL D1
#define STATUS_LED D7

// ==================== Measurement Configuration ====================
#define MEASUREMENT_INTERVAL_MS 60000  // 2 minutes
#define MEASUREMENT_TIMEOUT_MS 300000    // 5 minutes
#define FINGER_THRESHOLD 50000
#define MAX_RETRY_ATTEMPTS 3

// ==================== Heart Rate & SpO2 Configuration ====================
#define MIN_HEART_RATE 40
#define MAX_HEART_RATE 200
#define MIN_SPO2 70
#define MAX_SPO2 100

// ==================== MongoDB Proxy Configuration ====================
// You'll update this after deploying to Railway
#define MONGODB_PROXY_URL "https://iot-production-6ff3.up.railway.app"
#define MONGODB_PROXY_ENDPOINT "/api/measurements"

// ==================== Network Configuration ====================
#define CONNECTION_TIMEOUT_MS 10000
#define MAX_NETWORK_RETRY 3

// ==================== LED Patterns ====================
#define LED_BLINK_SLOW 1000
#define LED_BLINK_FAST 250
#define LED_FLASH_DURATION 200

// ==================== Storage Configuration ====================
#define MAX_STORED_MEASUREMENTS 48

// ==================== Debug ====================
#define DEBUG_MODE true

#endif
