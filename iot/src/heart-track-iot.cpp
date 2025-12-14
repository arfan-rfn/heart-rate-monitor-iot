/******************************************************/
//       THIS IS A GENERATED FILE - DO NOT EDIT       //
/******************************************************/

#line 1 "/Users/umbrella_mt_01/Documents/4.ECE513/ECE513CODE/Final_Project/heart-rate-monitor-iot/iot/src/heart-track-iot.ino"
#include "Particle.h"
#include "config.h"
#include "state_machine.h"
#include "sensor_manager.h"
#include "led_controller.h"
#include "network_manager.h"

void setup();
void loop();
#line 8 "/Users/umbrella_mt_01/Documents/4.ECE513/ECE513CODE/Final_Project/heart-rate-monitor-iot/iot/src/heart-track-iot.ino"
SYSTEM_MODE(SEMI_AUTOMATIC);

StateMachine stateMachine;
SensorManager sensorManager;
LEDController ledController;
NetworkManager networkManager;

void setup() {
    Serial.begin(115200);
    waitFor(Serial.isConnected, 10000);
    delay(1000);
    
    Serial.println("\n===================================");
    Serial.println("Team 13 - IoT Heart Rate Device");
    Serial.println("===================================\n");
    
    ledController.begin();
    ledController.setPattern(DEVICE_LED_SOLID_CYAN);
    
    Serial.println("Connecting to WiFi...");
    WiFi.setCredentials(WIFI_SSID, WIFI_PASSWORD);
    WiFi.connect();
    
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
    
    Particle.connect();
    unsigned long cloudStart = millis();
    while (!Particle.connected() && (millis() - cloudStart < 15000)) {
        Particle.process();
        delay(100);
    }
    
    if (Particle.connected()) {
        Serial.println("Particle Cloud Connected");
        Serial.printlnf("Device: %s", System.deviceID().c_str());
        Particle.syncTime();
        waitFor(Particle.syncTimeDone, 10000);
    }
    
    if (!sensorManager.begin()) {
        Serial.println("FATAL: Sensor failed!");
        ledController.setPattern(DEVICE_LED_BLINK_RED);
        while (1) delay(1000);
    }
    
    networkManager.begin();
    stateMachine.begin();
    
    ledController.setPattern(DEVICE_LED_OFF);
    Serial.println("\n>>> System Ready <<<\n");
}

void loop() {
    stateMachine.update();
    sensorManager.update();
    ledController.update();
    networkManager.update();
    
    if (stateMachine.getCurrentState() == STATE_TRANSMITTING) {
        if (sensorManager.isMeasurementComplete()) {
            MeasurementData data = sensorManager.getMeasurement();
            networkManager.transmitMeasurement(data);
        }
    }
    
    if (Particle.connected()) {
        Particle.process();
    }
    
    delay(10);
}
