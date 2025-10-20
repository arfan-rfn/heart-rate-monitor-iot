# Project 1: Heart Track IoT Device & Firmware

## Overview

This project contains the firmware for the Particle Photon IoT device that interfaces with the MAX30102 heart rate and blood oxygen sensor. The device periodically prompts users to take measurements, processes sensor data, and transmits readings to the backend server.

## Hardware Requirements

- **Microcontroller:** Particle Photon
- **Sensor:** MAX30102 Pulse Detection Blood Oxygen sensor
- **Connectivity:** Micro USB cable for programming and power
- **Prototyping:** Mini breadboard
- **Connections:** Jumper wires (Male-to-Male, Male-to-Female)

### Pinout Configuration

```
MAX30102 Sensor → Particle Photon
─────────────────────────────────
VIN  → 3.3V
GND  → GND
SDA  → D0 (I2C Data)
SCL  → D1 (I2C Clock)
INT  → D2 (Interrupt, optional)
```

## Software Architecture

### State Machine Design

The firmware implements a synchronous state machine with the following states:

```
┌──────────────┐
│   IDLE       │◄────────┐
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│   WAITING_   │         │
│   FOR_USER   │         │
│ (LED Flash)  │         │
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│  MEASURING   │         │
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│ STABILIZING  │         │
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│ TRANSMITTING │─────────┘
└──────────────┘
```

### State Descriptions

1. **IDLE:** Device waiting for next scheduled measurement time
2. **WAITING_FOR_USER:** LED flashing blue, prompting user for measurement
3. **MEASURING:** Collecting sensor data, waiting for stable reading
4. **STABILIZING:** Applying accuracy algorithm to ensure valid data
5. **TRANSMITTING:** Sending data to server (green flash) or storing locally (yellow flash)

## TODO List

### Phase 1: Hardware Setup & Basic Sensor Integration ✓ (Milestone)

- [ ] **Hardware Assembly**
  - [ ] Connect MAX30102 sensor to Particle Photon breadboard
  - [ ] Verify I2C connections (SDA, SCL)
  - [ ] Test power supply (3.3V)
  - [ ] Confirm LED functionality on Photon

- [ ] **Development Environment Setup**
  - [ ] Install Particle CLI or configure Particle Web IDE
  - [ ] Create new Particle project
  - [ ] Configure device Wi-Fi credentials
  - [ ] Flash test program to verify device connectivity

- [ ] **Sensor Library Integration**
  - [ ] Install MAX30102 library (SparkFun or equivalent)
  - [ ] Verify I2C communication with sensor
  - [ ] Read sensor ID to confirm connection
  - [ ] Test basic heart rate reading
  - [ ] Test basic SpO2 reading

- [ ] **Fixed Schedule Implementation (Milestone)**
  - [ ] Implement simple 30-minute timer
  - [ ] Flash LED blue when measurement needed
  - [ ] Take single measurement when user places finger
  - [ ] Display raw readings via Serial monitor
  - [ ] Transmit data to server using hardcoded endpoint

### Phase 2: State Machine & LED Feedback

- [ ] **State Machine Architecture**
  - [ ] Define state enumeration
  - [ ] Implement state transition logic
  - [ ] Create state entry/exit handlers
  - [ ] Add state timeout mechanisms
  - [ ] Test all state transitions

- [ ] **LED Visual Feedback System**
  - [ ] Blue flashing: Waiting for user (configurable blink rate)
  - [ ] Green flash: Data successfully transmitted
  - [ ] Yellow flash: Data stored locally (no Wi-Fi)
  - [ ] Red flash: Error condition (optional)
  - [ ] Implement non-blocking LED control

- [ ] **Measurement Request Logic**
  - [ ] 5-minute timeout if no user response
  - [ ] Stop LED after timeout or measurement taken
  - [ ] Handle user interaction detection
  - [ ] Prevent duplicate measurements

### Phase 3: Measurement Accuracy & Stability

- [ ] **Sensor Stabilization Algorithm**
  - [ ] Detect finger placement on sensor
  - [ ] Implement warm-up period (discard initial readings)
  - [ ] Collect multiple samples (e.g., 10-15 readings)
  - [ ] Calculate rolling average
  - [ ] Detect measurement stability (variance threshold)
  - [ ] Determine when reading is valid
  - [ ] Reject invalid/noisy measurements

- [ ] **Data Quality Checks**
  - [ ] Validate heart rate range (40-200 bpm)
  - [ ] Validate SpO2 range (70-100%)
  - [ ] Detect finger removal during measurement
  - [ ] Implement retry logic for failed readings
  - [ ] Add confidence score to measurements

### Phase 4: Wi-Fi & Data Transmission

- [ ] **Network Connectivity Management**
  - [ ] Check Wi-Fi connection status
  - [ ] Implement connection retry logic
  - [ ] Handle connection timeouts
  - [ ] Detect network failures gracefully

- [ ] **Server Communication**
  - [ ] Implement HTTP POST to server endpoint
  - [ ] Add API key authentication header
  - [ ] Format measurement data as JSON
  - [ ] Include device ID and timestamp
  - [ ] Handle server response codes
  - [ ] Implement exponential backoff on failures

- [ ] **Local Data Storage (Offline Mode)**
  - [ ] Design EEPROM storage structure
  - [ ] Implement circular buffer (24-hour capacity)
  - [ ] Store measurements when Wi-Fi unavailable
  - [ ] Add timestamp to stored measurements
  - [ ] Detect when storage is full
  - [ ] Implement data upload on reconnection
  - [ ] Clear uploaded data from storage
  - [ ] Test storage persistence across reboots

### Phase 5: Configurable Scheduling

- [ ] **Configuration Management**
  - [ ] Fetch configuration from server on boot
  - [ ] Parse JSON configuration response
  - [ ] Store configuration in EEPROM
  - [ ] Implement configuration update polling

- [ ] **Time-of-Day Configuration**
  - [ ] Sync device time with server (NTP)
  - [ ] Implement configurable start time (default: 6:00 AM)
  - [ ] Implement configurable end time (default: 10:00 PM)
  - [ ] Only request measurements during active window
  - [ ] Handle timezone considerations

- [ ] **Measurement Frequency Configuration**
  - [ ] Default: 30 minutes between measurements
  - [ ] Allow server to adjust frequency
  - [ ] Implement dynamic timer adjustment
  - [ ] Validate frequency range (e.g., 15 min - 4 hours)
  - [ ] Apply changes without device reboot

### Phase 6: API Integration

- [ ] **Device Registration**
  - [ ] Generate unique device identifier
  - [ ] Display device ID on Serial for user registration
  - [ ] Implement device activation handshake

- [ ] **API Key Management**
  - [ ] Receive API key from server
  - [ ] Store API key securely in EEPROM
  - [ ] Include API key in all requests
  - [ ] Handle key rotation if needed

- [ ] **Endpoint Implementation**
  - [ ] POST `/api/measurements` - Submit measurement data
  - [ ] GET `/api/devices/{deviceId}/config` - Fetch configuration
  - [ ] POST `/api/devices/{deviceId}/heartbeat` - Device status check (optional)

### Phase 7: Error Handling & Reliability

- [ ] **Sensor Error Handling**
  - [ ] Detect sensor disconnection
  - [ ] Handle I2C communication failures
  - [ ] Implement sensor reset functionality
  - [ ] Log errors to Serial for debugging

- [ ] **System Reliability**
  - [ ] Implement watchdog timer
  - [ ] Handle system crashes gracefully
  - [ ] Add diagnostic LED patterns
  - [ ] Implement safe mode for troubleshooting

- [ ] **Data Integrity**
  - [ ] Add checksums to stored data
  - [ ] Verify data before transmission
  - [ ] Handle partial data corruption
  - [ ] Implement data validation

### Phase 8: Testing & Optimization

- [ ] **Unit Testing**
  - [ ] Test state machine transitions
  - [ ] Test sensor reading accuracy
  - [ ] Test LED patterns
  - [ ] Test storage read/write operations
  - [ ] Test time calculations

- [ ] **Integration Testing**
  - [ ] Test full measurement cycle
  - [ ] Test offline storage and sync
  - [ ] Test configuration updates
  - [ ] Test long-term reliability (24+ hours)
  - [ ] Test multiple measurement cycles

- [ ] **Performance Optimization**
  - [ ] Optimize power consumption
  - [ ] Reduce measurement time
  - [ ] Minimize network overhead
  - [ ] Optimize EEPROM usage

- [ ] **Real-World Testing**
  - [ ] Test with multiple users
  - [ ] Test in different lighting conditions
  - [ ] Test with different skin tones
  - [ ] Test finger placement variations
  - [ ] Collect accuracy comparison data

### Phase 9: Documentation

- [ ] **Code Documentation**
  - [ ] Add function-level comments
  - [ ] Document state machine logic
  - [ ] Explain measurement algorithm
  - [ ] Add configuration examples
  - [ ] Include troubleshooting guide

- [ ] **User Documentation**
  - [ ] Create quick start guide
  - [ ] Document LED signal meanings
  - [ ] Provide measurement tips
  - [ ] Include FAQs

- [ ] **Developer Documentation**
  - [ ] Circuit diagram with Fritzing
  - [ ] Pin configuration reference
  - [ ] API communication protocol
  - [ ] Storage format specification
  - [ ] Testing procedures

### Phase 10: Extra Features (Optional)

- [ ] **Enhanced User Feedback**
  - [ ] Add buzzer for audio alerts
  - [ ] Implement haptic feedback (if hardware available)
  - [ ] Multi-color LED patterns for more states

- [ ] **Advanced Features**
  - [ ] Calculate heart rate variability (HRV)
  - [ ] Detect irregular heartbeats
  - [ ] Implement activity detection
  - [ ] Add manual measurement trigger button

- [ ] **Diagnostic Features**
  - [ ] Remote debugging via Particle Cloud
  - [ ] Health metrics logging
  - [ ] Battery level monitoring (if battery-powered)
  - [ ] Signal quality indicator

## File Structure

```
iot/
├── README.md                    # This file
├── src/
│   ├── heart-track.ino         # Main firmware file
│   ├── state-machine.h         # State machine definitions
│   ├── state-machine.cpp       # State machine implementation
│   ├── sensor-manager.h        # Sensor interface
│   ├── sensor-manager.cpp      # Sensor reading logic
│   ├── network-manager.h       # Wi-Fi and HTTP
│   ├── network-manager.cpp     # Network implementation
│   ├── storage-manager.h       # EEPROM storage
│   ├── storage-manager.cpp     # Storage implementation
│   ├── led-controller.h        # LED patterns
│   ├── led-controller.cpp      # LED control logic
│   ├── config-manager.h        # Configuration handling
│   └── config-manager.cpp      # Configuration implementation
├── lib/
│   └── MAX30102/               # Sensor library (if custom)
├── docs/
│   ├── hardware-setup.md       # Hardware assembly guide
│   ├── state-machine.md        # State machine documentation
│   ├── api-protocol.md         # Server API details
│   ├── storage-format.md       # EEPROM data structure
│   └── circuit-diagram.png     # Fritzing diagram
└── test/
    ├── test-sensor.cpp         # Sensor unit tests
    ├── test-storage.cpp        # Storage unit tests
    └── test-network.cpp        # Network unit tests
```

## Development Setup

### Prerequisites

1. **Particle Account**
   - Create account at https://login.particle.io/signup
   - Register your Particle Photon device
   - Note your device ID

2. **Development Tools**
   - Option 1: Particle CLI (recommended)
     ```bash
     npm install -g particle-cli
     particle login
     ```
   - Option 2: Particle Web IDE (https://build.particle.io/)
   - Option 3: Particle Workbench (VS Code extension)

3. **Hardware Tools**
   - Micro USB cable
   - Breadboard and jumper wires
   - MAX30102 sensor module

### Installation Steps

1. **Clone Repository**
   ```bash
   cd iot/
   ```

2. **Install Dependencies**
   ```bash
   particle library install MAX30102   # Or appropriate library
   ```

3. **Configure Device**
   - Create `config.h` from `config.h.example`
   - Add your Wi-Fi credentials
   - Add server URL and API endpoint
   ```cpp
   #define WIFI_SSID "your-wifi-name"
   #define WIFI_PASSWORD "your-wifi-password"
   #define SERVER_URL "https://your-server.com"
   #define API_ENDPOINT "/api/measurements"
   ```

4. **Compile and Flash**
   ```bash
   particle compile photon src/
   particle flash your-device-name src/
   ```

5. **Monitor Serial Output**
   ```bash
   particle serial monitor
   ```

## Configuration

### Server Configuration Endpoint

The device fetches configuration from:
```
GET /api/devices/{deviceId}/config
```

Response format:
```json
{
  "measurementFrequency": 1800,  // seconds (30 minutes)
  "activeStartTime": "06:00",    // HH:MM format
  "activeEndTime": "22:00",      // HH:MM format
  "apiKey": "device-api-key-here",
  "timezone": "America/New_York"
}
```

### Measurement Data Format

POST to `/api/measurements`:
```json
{
  "deviceId": "photon-device-id",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-10-20T14:30:00Z",
  "quality": "good",           // good, fair, poor
  "confidence": 0.95           // 0.0 - 1.0
}
```

Headers:
```
Content-Type: application/json
X-API-Key: device-api-key-here
```

## LED Signal Reference

| Color | Pattern | Meaning |
|-------|---------|---------|
| Blue | Slow blink (1 Hz) | Waiting for user to take measurement |
| Green | Single flash | Measurement sent successfully |
| Yellow | Single flash | Measurement stored locally (no Wi-Fi) |
| Cyan | Breathing | Device starting up |
| Red | Rapid blink | Error condition |
| Magenta | Single flash | Configuration updated |

## Testing

### Hardware Test
```cpp
// test-sensor.cpp
// Verify sensor is connected and reading
void testSensorConnection() {
  if (particleSensor.begin() == true) {
    Serial.println("✓ MAX30102 detected");
  } else {
    Serial.println("✗ MAX30102 not found");
  }
}
```

### State Machine Test
```cpp
// Test state transitions
void testStateMachine() {
  // Verify all states reachable
  // Verify timeout handling
  // Verify event processing
}
```

### Network Test
```bash
# Monitor network activity
particle serial monitor --follow
# Look for HTTP request/response logs
```

## Troubleshooting

### Sensor Not Detected
1. Check I2C connections (SDA=D0, SCL=D1)
2. Verify 3.3V power connection
3. Test with I2C scanner code
4. Try different sensor module

### No Wi-Fi Connection
1. Verify SSID and password in config.h
2. Check Wi-Fi signal strength
3. Ensure 2.4GHz network (Photon doesn't support 5GHz)
4. Try manual Wi-Fi setup with Particle app

### Inaccurate Readings
1. Ensure finger is properly placed on sensor
2. Wait for initial stabilization period
3. Adjust averaging algorithm parameters
4. Check ambient light interference
5. Clean sensor surface

### Data Not Transmitting
1. Verify server URL and endpoint
2. Check API key configuration
3. Monitor Serial output for HTTP errors
4. Verify network connectivity
5. Test server endpoint with curl/Postman

## Performance Metrics

### Target Performance
- **Measurement Time:** < 30 seconds
- **Accuracy:** ±2 bpm (heart rate), ±2% (SpO2)
- **Power Consumption:** < 200mA during measurement
- **Storage Capacity:** 48 measurements (24 hours @ 30-min intervals)
- **Boot Time:** < 5 seconds
- **Network Latency:** < 2 seconds for data transmission

## Security Considerations

1. **API Key Storage:** Encrypted in EEPROM
2. **HTTPS:** Use secure connections to server (if Photon supports)
3. **Device Authentication:** Unique device ID + API key
4. **Data Validation:** Sanitize all configuration inputs
5. **Firmware Updates:** Use Particle OTA with verification

## Integration with Other Projects

### Required from Project 2 (Backend)
- Device registration endpoint
- Configuration endpoint
- Measurement submission endpoint
- API key generation

### Provides to Project 2
- Heart rate and SpO2 measurements
- Device health status
- Measurement quality metrics

## Resources

### Documentation
- [Particle Photon Docs](https://docs.particle.io/photon/)
- [MAX30102 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX30102.pdf)
- [I2C Protocol Guide](https://learn.sparkfun.com/tutorials/i2c)

### Libraries
- [SparkFun MAX3010x Library](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library)
- [Particle Device OS](https://docs.particle.io/reference/device-os/api/)

### Example Code
- Particle Examples: https://docs.particle.io/tutorials/
- MAX30102 Examples: Included with library

## License

[Specify your license here - e.g., MIT, Apache 2.0]

## Contributors

[Team member names and roles]

## Changelog

### Version 0.1.0 (Milestone - Nov 21)
- Basic sensor reading
- Fixed 30-minute schedule
- Simple data transmission

### Version 0.2.0
- State machine implementation
- LED feedback system
- Configurable scheduling

### Version 1.0.0 (Final - Dec 15)
- Full feature implementation
- Local storage
- Measurement accuracy optimization

---

**Last Updated:** 2025-10-20
