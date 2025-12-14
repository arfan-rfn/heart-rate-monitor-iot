/*
 * heart-track-iot.ino - Heart Track IoT Device Main Entry Point
 * 
 * ECE 513 Final Project - Team 13
 * Particle Photon 2 + MAX30102/MAX30105 Heart Rate & SpO2 Monitor
 * 
 * OVERVIEW:
 *   This firmware implements a heart rate and blood oxygen monitoring device
 *   that periodically prompts users to take measurements and transmits the
 *   data to a backend API server for health tracking and analysis.
 * 
 * HARDWARE:
 *   - Particle Photon 2 microcontroller
 *   - MAX30102/MAX30105 pulse oximeter sensor (I2C: SDA->D0, SCL->D1)
 * 
 * CONNECTION MODES (configured in config.h):
 *   - USE_WEBHOOK false: Direct HTTP to local API server (for development)
 *   - USE_WEBHOOK true:  Particle webhooks to Vercel HTTPS API (for production)
 * 
 * CONFIGURATION:
 *   Edit src/config.h to set:
 *   - WiFi credentials (WIFI_SSID, WIFI_PASSWORD)
 *   - API key (from device registration in web app)
 *   - Connection mode (USE_WEBHOOK true/false)
 *   - API server host/port
 * 
 * For webhook mode, also configure webhooks in Particle Console.
 * See WEBHOOK_SETUP.md for instructions.
 * 
 * STATE MACHINE:
 *   IDLE -> WAITING_FOR_USER -> MEASURING -> STABILIZING -> TRANSMITTING -> IDLE
 * 
 * For detailed documentation, see README.md
 */

#include "Particle.h"
#include "config.h"
#include "state_machine.h"
#include "sensor_manager.h"
#include "led_controller.h"
#include "network_manager.h"

/*
 * SYSTEM_MODE(SEMI_AUTOMATIC)
 * 
 * We use semi-automatic mode to control the WiFi and Cloud connection manually.
 * This allows us to:
 *   - Connect to WiFi with specific credentials from config.h
 *   - Show startup feedback before cloud connection
 *   - Continue operation even if cloud connection fails
 */
SYSTEM_MODE(SEMI_AUTOMATIC);

// Global module instances
StateMachine stateMachine;
SensorManager sensorManager;
LEDController ledController;
NetworkManager networkManager;

/*
 * setup() - Device initialization
 * 
 * Initialization sequence:
 *   1. Serial port for debugging
 *   2. LED controller for visual feedback
 *   3. WiFi connection
 *   4. Particle Cloud connection (for time sync and webhooks)
 *   5. MAX30102 sensor initialization
 *   6. Network manager (loads stored measurements, sets up webhooks)
 *   7. State machine (schedules first measurement)
 */
void setup() {
    // Initialize serial for debug output
    Serial.begin(115200);
    waitFor(Serial.isConnected, 10000);  // Wait up to 10s for serial
    delay(1000);
    
    // Print startup banner
    Serial.println("\n===================================");
    Serial.println("Team 13 - IoT Heart Rate Device");
    Serial.println("===================================\n");
    
    // Initialize LED and show startup indicator (solid cyan)
    ledController.begin();
    ledController.setPattern(DEVICE_LED_SOLID_CYAN);
    
    // ===== WiFi Connection =====
    Serial.println("Connecting to WiFi...");
    WiFi.setCredentials(WIFI_SSID, WIFI_PASSWORD);
    WiFi.connect();
    
    // Wait for WiFi (up to 30 seconds)
    unsigned long wifiStart = millis();
    while (!WiFi.ready() && (millis() - wifiStart < 30000)) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    
    if (WiFi.ready()) {
        Serial.println("WiFi Connected");
        Serial.printlnf("IP: %s", WiFi.localIP().toString().c_str());
        Serial.printlnf("RSSI: %d dBm", WiFi.RSSI());
    } else {
        Serial.println("WiFi failed - offline mode");
    }
    
    // ===== Particle Cloud Connection =====
    // Required for: time sync, webhook communication, device identification
    Particle.connect();
    unsigned long cloudStart = millis();
    while (!Particle.connected() && (millis() - cloudStart < 15000)) {
        Particle.process();
        delay(100);
    }
    
    if (Particle.connected()) {
        Serial.println("Particle Cloud Connected");
        Serial.printlnf("Device: %s", System.deviceID().c_str());
        
        // Sync time from Particle Cloud (important for timestamps and scheduling)
        Particle.syncTime();
        waitFor(Particle.syncTimeDone, 10000);
    }
    
    // ===== Sensor Initialization =====
    if (!sensorManager.begin()) {
        Serial.println("FATAL: Sensor failed!");
        ledController.setPattern(DEVICE_LED_BLINK_RED);
        while (1) delay(1000);  // Halt on sensor failure
    }
    
    // ===== Network & State Machine Initialization =====
    // NetworkManager: loads stored measurements, subscribes to webhooks, prints mode info
    // StateMachine: sets default config, schedules first measurement
    networkManager.begin();
    stateMachine.begin();
    
    // Ready - turn off LED
    ledController.setPattern(DEVICE_LED_OFF);
    Serial.println("\n>>> System Ready <<<\n");
}

/*
 * loop() - Main execution loop
 * 
 * Called continuously by the Particle OS.
 * Each module's update() handles its responsibilities:
 *   - stateMachine: State transitions, scheduling, timeouts
 *   - sensorManager: Sample collection, measurement processing
 *   - ledController: LED pattern animations
 *   - networkManager: Connection monitoring, config fetching, stored measurement sync
 * 
 * Special handling for TRANSMITTING state to coordinate between
 * SensorManager (measurement complete) and NetworkManager (transmission).
 */
void loop() {
    // Update all modules
    stateMachine.update();
    sensorManager.update();
    ledController.update();
    networkManager.update();
    
    // Handle measurement transmission
    // When state machine enters TRANSMITTING state, check if measurement is ready
    if (stateMachine.getCurrentState() == STATE_TRANSMITTING) {
        if (sensorManager.isMeasurementComplete()) {
            MeasurementData data = sensorManager.getMeasurement();
            networkManager.transmitMeasurement(data);
            // transmitMeasurement() handles transition back to IDLE
        }
    }
    
    // Process Particle Cloud events (for webhooks)
    if (Particle.connected()) {
        Particle.process();
    }
    
    // Small delay to prevent tight loop
    delay(10);
}
