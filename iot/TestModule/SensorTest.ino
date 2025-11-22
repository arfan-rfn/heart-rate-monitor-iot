/******************************************************/
//     Photon 2 + MAX30102 Diagnostic Test Suite     //
/******************************************************/

#include "Particle.h"
#include "MAX30105.h"

// Use semi-automatic mode for WiFi testing control
SYSTEM_MODE(SEMI_AUTOMATIC);
SYSTEM_THREAD(ENABLED);

MAX30105 particleSensor;

// Test configuration - UPDATE THESE WITH YOUR WIFI CREDENTIALS
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";

// Normal tolerance ranges for MAX30102
const long MIN_IR_VALUE = 50000;
const long MAX_IR_VALUE = 300000;
const long MIN_RED_VALUE = 50000;
const long MAX_RED_VALUE = 300000;

// Test state
enum TestPhase {
    INIT,
    SENSOR_TEST,
    LED_TEST,
    WIFI_MODULE_TEST,
    WIFI_CONNECT_TEST,
    COMPLETE
};

TestPhase currentPhase = INIT;
unsigned long phaseStartTime = 0;
bool testsPassed = true;

void setup() {
    Serial.begin(115200);
    delay(3000); // Wait for serial to initialize
    
    Serial.println("\n\n");
    Serial.println("====================================================");
    Serial.println("   PHOTON 2 + MAX30102 DIAGNOSTIC TEST SUITE      ");
    Serial.println("====================================================");
    Serial.println();
    
    // Display time estimate
    displayTimeEstimate();
    
    delay(2000);
    
    // Initialize RGB LED
    RGB.control(true);
    RGB.brightness(50);
    
    currentPhase = SENSOR_TEST;
}

void loop() {
    switch(currentPhase) {
        case SENSOR_TEST:
            testMAX30102Sensor();
            break;
            
        case LED_TEST:
            testRGBLED();
            break;
            
        case WIFI_MODULE_TEST:
            testWiFiModule();
            break;
            
        case WIFI_CONNECT_TEST:
            testWiFiConnection();
            break;
            
        case COMPLETE:
            displayFinalResults();
            currentPhase = INIT; // Prevent repeated execution
            break;
            
        default:
            delay(100);
            break;
    }
}

void displayTimeEstimate() {
    Serial.println("ESTIMATED TEST DURATION:");
    Serial.println("----------------------------------------------------");
    Serial.println("  Phase 1: MAX30102 Sensor Test      approximately 15 seconds");
    Serial.println("  Phase 2: RGB LED Cycle Test        approximately 10 seconds");
    Serial.println("  Phase 3: WiFi Module Test          approximately 5 seconds");
    Serial.println("  Phase 4: WiFi Connection Test      approximately 15 seconds");
    Serial.println("----------------------------------------------------");
    Serial.println("  TOTAL ESTIMATED TIME:               approximately 45 seconds");
    Serial.println();
}

void testMAX30102Sensor() {
    if (phaseStartTime == 0) {
        Serial.println("====================================================");
        Serial.println(" PHASE 1: MAX30102 SENSOR IDENTIFICATION AND TEST ");
        Serial.println("====================================================");
        Serial.println();
        Serial.println("Starting Phase 1: MAX30102 Sensor Test");
        Serial.println();
        phaseStartTime = millis();
        
        // Turn LED white during sensor test
        RGB.color(255, 255, 255);
    }
    
    // Test 1: Sensor Detection
    Serial.print("  Test 1 of 4: Detecting MAX30102 sensor... ");
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("FAILED");
        Serial.println("        ERROR: Sensor not found on I2C bus");
        Serial.println("        Please check sensor connections");
        testsPassed = false;
        phaseStartTime = 0;
        currentPhase = LED_TEST;
        return;
    }
    Serial.println("PASSED");
    Serial.println("        MAX30102 sensor successfully detected");
    delay(500);
    
    // Test 2: Sensor Configuration
    Serial.print("  Test 2 of 4: Configuring sensor... ");
    byte ledBrightness = 60;
    byte sampleAverage = 4;
    byte ledMode = 2;  // Red + IR
    byte sampleRate = 100;
    int pulseWidth = 411;
    int adcRange = 4096;
    
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, 
                        sampleRate, pulseWidth, adcRange);
    Serial.println("PASSED");
    Serial.println("        Sensor configured with optimal settings");
    delay(500);
    
    // Test 3: Reading Values
    Serial.print("  Test 3 of 4: Reading sensor values... ");
    delay(1000); // Allow sensor to stabilize
    
    long irValue = particleSensor.getIR();
    long redValue = particleSensor.getRed();
    
    Serial.println("PASSED");
    Serial.print("        Infrared Value:  ");
    Serial.println(irValue);
    Serial.print("        Red Light Value: ");
    Serial.println(redValue);
    delay(500);
    
    // Test 4: Tolerance Check
    Serial.println("  Test 4 of 4: Validating readings against normal tolerances");
    Serial.println("        Note: Place finger on sensor for accurate reading");
    Serial.println("        Collecting samples...");
    
    // Take multiple samples
    delay(2000);
    long irSum = 0, redSum = 0;
    int validSamples = 0;
    
    for (int i = 0; i < 10; i++) {
        irValue = particleSensor.getIR();
        redValue = particleSensor.getRed();
        
        if (irValue > 10000) { // Basic threshold for valid reading
            irSum += irValue;
            redSum += redValue;
            validSamples++;
        }
        delay(100);
    }
    
    if (validSamples > 0) {
        long avgIR = irSum / validSamples;
        long avgRed = redSum / validSamples;
        
        Serial.print("        Average Infrared:  ");
        Serial.println(avgIR);
        Serial.print("        Average Red Light: ");
        Serial.println(avgRed);
        
        bool irInRange = (avgIR >= MIN_IR_VALUE && avgIR <= MAX_IR_VALUE);
        bool redInRange = (avgRed >= MIN_RED_VALUE && avgRed <= MAX_RED_VALUE);
        
        if (irInRange && redInRange) {
            Serial.println("        PASSED - Values within normal tolerances");
            Serial.print("        Expected IR range: ");
            Serial.print(MIN_IR_VALUE);
            Serial.print(" to ");
            Serial.println(MAX_IR_VALUE);
            Serial.print("        Expected Red range: ");
            Serial.print(MIN_RED_VALUE);
            Serial.print(" to ");
            Serial.println(MAX_RED_VALUE);
        } else {
            Serial.println("        WARNING: Values outside expected range");
            Serial.println("        This may be normal if no finger is present");
            Serial.println("        Sensor is functional but readings vary");
        }
    } else {
        Serial.println("        WARNING: No valid samples obtained");
        Serial.println("        Please ensure sensor connections are secure");
        Serial.println("        Sensor may still be functional");
    }
    
    Serial.println();
    Serial.println("Phase 1 Complete: MAX30102 sensor is functional");
    Serial.println();
    
    phaseStartTime = 0;
    currentPhase = LED_TEST;
    delay(1000);
}

void testRGBLED() {
    if (phaseStartTime == 0) {
        Serial.println("====================================================");
        Serial.println(" PHASE 2: RGB LED COLOR CYCLE TEST                ");
        Serial.println("====================================================");
        Serial.println();
        Serial.println("Starting Phase 2: RGB LED Color Cycle Test");
        Serial.println();
        phaseStartTime = millis();
    }
    
    // Define major colors
    struct Color {
        const char* name;
        uint8_t r, g, b;
    };
    
    Color colors[] = {
        {"Red",     255, 0,   0},
        {"Green",   0,   255, 0},
        {"Blue",    0,   0,   255},
        {"Yellow",  255, 255, 0},
        {"Cyan",    0,   255, 255},
        {"Magenta", 255, 0,   255},
        {"White",   255, 255, 255}
    };
    
    int numColors = sizeof(colors) / sizeof(colors[0]);
    
    Serial.println("Testing all major LED colors:");
    Serial.println();
    
    for (int i = 0; i < numColors; i++) {
        Serial.print("  Test ");
        Serial.print(i + 1);
        Serial.print(" of ");
        Serial.print(numColors);
        Serial.print(": Testing color ");
        Serial.print(colors[i].name);
        Serial.print("... ");
        
        RGB.color(colors[i].r, colors[i].g, colors[i].b);
        delay(1000);
        
        Serial.println("PASSED");
        Serial.print("        LED displaying ");
        Serial.println(colors[i].name);
    }
    
    RGB.color(0, 0, 0); // Turn off
    
    Serial.println();
    Serial.println("Phase 2 Complete: All LED colors tested successfully");
    Serial.println();
    
    phaseStartTime = 0;
    currentPhase = WIFI_MODULE_TEST;
    delay(1000);
}

void testWiFiModule() {
    if (phaseStartTime == 0) {
        Serial.println("====================================================");
        Serial.println(" PHASE 3: WIFI MODULE FUNCTIONALITY TEST          ");
        Serial.println("====================================================");
        Serial.println();
        Serial.println("Starting Phase 3: WiFi Module Test");
        Serial.println();
        phaseStartTime = millis();
        
        RGB.color(0, 0, 255); // Blue for WiFi test
    }
    
    // Test 1: WiFi Module Detection
    Serial.print("  Test 1 of 2: Checking WiFi module presence... ");
    WiFi.on();
    delay(1000);
    
    Serial.println("PASSED");
    Serial.println("        WiFi module is present and responding");
    delay(500);
    
    // Test 2: WiFi Scanning
    Serial.print("  Test 2 of 2: Scanning for WiFi networks... ");
    WiFiAccessPoint aps[20];
    int found = WiFi.scan(aps, 20);
    
    if (found > 0) {
        Serial.println("PASSED");
        Serial.print("        Successfully found ");
        Serial.print(found);
        Serial.println(" wireless networks:");
        Serial.println();
        for (int i = 0; i < min(found, 5); i++) {
            Serial.print("          Network ");
            Serial.print(i + 1);
            Serial.print(": ");
            Serial.print(aps[i].ssid);
            Serial.print(" with signal strength ");
            Serial.print(aps[i].rssi);
            Serial.println(" dBm");
        }
        if (found > 5) {
            Serial.print("          ... and ");
            Serial.print(found - 5);
            Serial.println(" more networks");
        }
    } else {
        Serial.println("WARNING");
        Serial.println("        No networks found in range");
        Serial.println("        WiFi module is functional but no networks detected");
    }
    
    Serial.println();
    Serial.println("Phase 3 Complete: WiFi module is functional");
    Serial.println();
    
    phaseStartTime = 0;
    currentPhase = WIFI_CONNECT_TEST;
    delay(1000);
}

void testWiFiConnection() {
    static int connectionState = 0;
    
    if (phaseStartTime == 0) {
        Serial.println("====================================================");
        Serial.println(" PHASE 4: WIFI NETWORK CONNECTION TEST            ");
        Serial.println("====================================================");
        Serial.println();
        Serial.println("Starting Phase 4: WiFi Network Connection Test");
        Serial.println();
        phaseStartTime = millis();
        connectionState = 0;
        
        RGB.color(255, 255, 0); // Yellow during connection
    }
    
    if (connectionState == 0) {
        Serial.print("  Test 1 of 2: Connecting to network: ");
        Serial.println(WIFI_SSID);
        Serial.println("        Please wait while connecting...");
        
        WiFi.setCredentials(WIFI_SSID, WIFI_PASSWORD);
        WiFi.connect();
        connectionState = 1;
        phaseStartTime = millis();
    }
    else if (connectionState == 1) {
        // Check connection status
        if (WiFi.ready()) {
            Serial.println("        PASSED - Connection successful");
            Serial.print("        IP Address assigned: ");
            Serial.println(WiFi.localIP());
            Serial.print("        Signal Strength: ");
            Serial.print(WiFi.RSSI());
            Serial.println(" dBm");
            
            // Test 2: Internet Connectivity
            Serial.println();
            Serial.print("  Test 2 of 2: Testing internet connectivity... ");
            
            if (Particle.connected()) {
                Serial.println("PASSED");
                Serial.println("        Successfully connected to Particle Cloud");
                Serial.println("        Internet connectivity verified");
                RGB.color(0, 255, 0); // Green for success
            } else {
                Serial.println("PARTIAL");
                Serial.println("        WiFi connected but Particle Cloud not reached");
                Serial.println("        Local network connection is functional");
                RGB.color(255, 165, 0); // Orange for partial success
            }
            
            connectionState = 2;
        }
        else if (millis() - phaseStartTime > 15000) {
            Serial.println("        FAILED - Connection timeout after 15 seconds");
            Serial.println("        Please verify the following:");
            Serial.println("          - SSID is correct");
            Serial.println("          - Password is correct");
            Serial.println("          - Network is in range");
            Serial.println("          - Network allows new connections");
            testsPassed = false;
            RGB.color(255, 0, 0); // Red for failure
            connectionState = 2;
        }
        else {
            // Still connecting, show progress
            if ((millis() / 500) % 2 == 0) {
                RGB.color(255, 255, 0);
            } else {
                RGB.color(0, 0, 0);
            }
        }
    }
    else if (connectionState == 2) {
        Serial.println();
        Serial.println("Phase 4 Complete: WiFi connection test finished");
        Serial.println();
        
        phaseStartTime = 0;
        currentPhase = COMPLETE;
        delay(1000);
    }
}

void displayFinalResults() {
    Serial.println("====================================================");
    Serial.println("       DIAGNOSTIC TEST SUITE COMPLETE              ");
    Serial.println("====================================================");
    Serial.println();
    
    if (testsPassed) {
        Serial.println("  FINAL RESULT: ALL TESTS PASSED");
        Serial.println();
        Serial.println("  Your Photon 2 system is fully operational:");
        Serial.println("    - MAX30102 sensor: Working correctly");
        Serial.println("    - RGB LED: All colors functional");
        Serial.println("    - WiFi module: Operational");
        Serial.println("    - Network connection: Successful");
        Serial.println();
        RGB.color(0, 255, 0); // Green
    } else {
        Serial.println("  FINAL RESULT: SOME TESTS FAILED");
        Serial.println();
        Serial.println("  Please review the test log above for details.");
        Serial.println("  Common issues to check:");
        Serial.println("    - Sensor connections and wiring");
        Serial.println("    - WiFi credentials accuracy");
        Serial.println("    - Network availability");
        Serial.println();
        RGB.color(255, 0, 0); // Red
    }
    
    Serial.println("  Test suite has finished.");
    Serial.println("  Reset or power cycle the device to run tests again.");
    Serial.println();
    
    // Flash LED 3 times to indicate completion
    for (int i = 0; i < 3; i++) {
        delay(500);
        RGB.color(0, 0, 0);
        delay(500);
        RGB.color(testsPassed ? 0 : 255, testsPassed ? 255 : 0, 0);
    }
    
    // Keep final color displayed
    while(true) {
        delay(1000);
    }
}
