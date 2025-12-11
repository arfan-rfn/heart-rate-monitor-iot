# Heart Track IoT Device Firmware

## Overview

This project contains the firmware for the Particle Photon 2 IoT device that interfaces with the MAX30102/MAX30105 heart rate and blood oxygen sensor. The device periodically prompts users to take measurements, processes sensor data, and transmits readings to the backend API server.

## Features

- **Heart Rate & SpO2 Measurement**: Accurate pulse oximetry using the MAX30102/MAX30105 sensor
- **State Machine Architecture**: Robust state management for measurement lifecycle
- **Configurable Scheduling**: Server-controlled measurement frequency and active time windows
- **Offline Storage**: EEPROM-based storage for up to 96 measurements when WiFi is unavailable
- **Auto-Sync**: Automatic transmission of stored measurements when connectivity is restored
- **Visual Feedback**: RGB LED patterns indicate device status and measurement results
- **Timezone Support**: User-configurable timezone for accurate scheduling

## Hardware Requirements

| Component | Description |
|-----------|-------------|
| **Microcontroller** | Particle Photon 2 |
| **Sensor** | MAX30102 or MAX30105 Pulse Oximeter |
| **Connectivity** | Micro USB cable for programming and power |
| **Prototyping** | Mini breadboard |
| **Connections** | Jumper wires (Male-to-Male, Male-to-Female) |

### Wiring Diagram

```
MAX30102/MAX30105 Sensor → Particle Photon 2
───────────────────────────────────────────
VIN  → 3.3V
GND  → GND
SDA  → D0 (I2C Data)
SCL  → D1 (I2C Clock)
INT  → D2 (Interrupt, optional)
```

## Software Architecture

### State Machine

The firmware implements a synchronous state machine with five states:

```
┌──────────────┐
│    IDLE      │◄────────────┐
│ (Scheduled)  │             │
└──────┬───────┘             │
       │ Timer expires       │
       ▼                     │
┌──────────────┐             │
│ WAITING_FOR_ │             │
│    USER      │             │
│ (Blue LED)   │             │
└──────┬───────┘             │
       │ Finger detected     │
       ▼                     │
┌──────────────┐             │
│  MEASURING   │             │
│ (Collecting) │             │
└──────┬───────┘             │
       │ Samples collected   │
       ▼                     │
┌──────────────┐             │
│ STABILIZING  │             │
│ (Averaging)  │             │
└──────┬───────┘             │
       │ Valid reading       │
       ▼                     │
┌──────────────┐             │
│ TRANSMITTING │─────────────┘
│ (Green/Yellow)│
└──────────────┘
```

### State Descriptions

| State | Description | LED Indication |
|-------|-------------|----------------|
| **IDLE** | Waiting for next scheduled measurement | Off |
| **WAITING_FOR_USER** | Prompting user to place finger on sensor | Blue blinking |
| **MEASURING** | Collecting sensor samples | Solid blue |
| **STABILIZING** | Averaging readings for accuracy | Solid cyan |
| **TRANSMITTING** | Sending data to server | Green (success) / Yellow (stored locally) |

### Module Structure

```
iot/src/
├── heart-track-iot.ino    # Main entry point
├── config.h               # Configuration settings
├── state_machine.h/cpp    # State machine logic
├── sensor_manager.h/cpp   # MAX30102 sensor interface
├── network_manager.h/cpp  # WiFi and HTTP communication
└── led_controller.h/cpp   # RGB LED patterns
```

---

## Development Setup

### Prerequisites

1. **Particle Account**
   - Create an account at https://login.particle.io/signup
   - Note: You'll need your Particle device ID for device registration

2. **Particle Photon 2 Device**
   - Device must be claimed to your Particle account
   - Get your device ID from the Particle Console or via CLI

### Option 1: VSCode with Particle Workbench (Recommended)

#### Windows Installation

1. **Install VSCode**
   - Download from https://code.visualstudio.com/
   - Run the installer with default settings

2. **Install Particle Workbench Extension**
   - Open VSCode
   - Press `Ctrl+Shift+X` to open Extensions
   - Search for "Particle Workbench"
   - Click **Install**
   - Wait for all dependencies to install (this may take several minutes)

3. **Login to Particle**
   - Press `Ctrl+Shift+P` to open Command Palette
   - Type `Particle: Login` and press Enter
   - Enter your Particle credentials

4. **Open the Project**
   - File → Open Folder → Navigate to `iot/`
   - VSCode will recognize it as a Particle project

5. **Configure Target Device**
   - Press `Ctrl+Shift+P`
   - Type `Particle: Configure Project for Device`
   - Select **P2 / Photon 2** as the platform
   - Select the latest Device OS version (6.x.x recommended)

6. **Compile and Flash**
   - Press `Ctrl+Shift+P`
   - Type `Particle: Cloud Flash` to compile and flash over-the-air
   - Or use `Particle: Local Compile` then `Particle: Flash application (local)`

#### macOS Installation

1. **Install VSCode**
   - Download from https://code.visualstudio.com/
   - Drag to Applications folder

2. **Install Particle Workbench Extension**
   - Open VSCode
   - Press `Cmd+Shift+X` to open Extensions
   - Search for "Particle Workbench"
   - Click **Install**
   - Wait for all dependencies to install

3. **Login to Particle**
   - Press `Cmd+Shift+P` to open Command Palette
   - Type `Particle: Login` and press Enter
   - Enter your Particle credentials

4. **Open the Project**
   - File → Open Folder → Navigate to `iot/`

5. **Configure Target Device**
   - Press `Cmd+Shift+P`
   - Type `Particle: Configure Project for Device`
   - Select **P2 / Photon 2** as the platform
   - Select the latest Device OS version

6. **Compile and Flash**
   - Press `Cmd+Shift+P`
   - Type `Particle: Cloud Flash` to compile and flash OTA

### Option 2: Particle CLI

#### Windows Installation

```powershell
# Install Node.js first from https://nodejs.org/
# Then install Particle CLI
npm install -g particle-cli

# Login
particle login

# List your devices
particle list
```

#### macOS Installation

```bash
# Install via npm (requires Node.js)
npm install -g particle-cli

# Or install via bash installer
bash <( curl -sL https://particle.io/install-cli )

# Login
particle login

# List your devices
particle list
```

#### CLI Commands

```bash
# Navigate to project directory
cd iot/

# Compile for Photon 2
particle compile p2 src/ --saveTo firmware.bin

# Flash over-the-air
particle flash <device_name> firmware.bin

# Flash via USB (device must be in DFU mode)
particle flash --usb firmware.bin

# Monitor serial output
particle serial monitor
```

### Option 3: Particle Web IDE

1. Go to https://build.particle.io/
2. Create a new app
3. Copy all files from `src/` into the Web IDE
4. Add the library: `SparkFun_MAX3010x_Sensor_Library`
5. Select your device and click **Flash**

---

## Configuring a New Device

### Step 1: Hardware Assembly

1. Connect the MAX30102/MAX30105 sensor to the Photon 2:
   - VIN → 3.3V
   - GND → GND
   - SDA → D0
   - SCL → D1

2. Connect the Photon 2 to your computer via USB

### Step 2: Get Device ID

```bash
# Via CLI
particle identify

# Or find it in Particle Console: https://console.particle.io/devices
```

### Step 3: Configure WiFi Credentials

Edit `src/config.h`:

```cpp
#define WIFI_SSID "YourNetworkName"
#define WIFI_PASSWORD "YourNetworkPassword"
```

### Step 4: Register Device in Web App

1. Log in to the Heart Track web application
2. Navigate to **Devices** page
3. Click **Register New Device**
4. Enter your Particle device ID (24-character hex string)
5. **Copy the API key** that is displayed (shown only once!)

### Step 5: Configure API Connection

Edit `src/config.h`:

```cpp
// For local development (API server on your computer)
#define API_SERVER_HOST "192.168.1.100"  // Your computer's local IP
#define API_SERVER_PORT 4000

// For production (EC2 instance)
#define API_SERVER_HOST "your-ec2-ip-address"  // e.g., "54.123.45.67"
#define API_SERVER_PORT 4000

// API key from device registration
#define API_KEY "your-64-character-api-key-here"
```

### Step 6: Flash Firmware

Using VSCode/Particle Workbench:
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type `Particle: Cloud Flash`

Using CLI:
```bash
particle flash <device_name> src/
```

### Step 7: Verify Connection

```bash
# Monitor serial output
particle serial monitor
```

You should see:
```
===================================
Team 13 - IoT Heart Rate Device
===================================

Connecting to WiFi...
WiFi Connected
IP: 192.168.1.xxx
Particle Cloud Connected
Device: 1a2b3c4d5e6f7890abcd1234
Fetching device configuration from server...

>>> System Ready <<<
```

---

## Configuration Reference

### config.h Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `API_SERVER_HOST` | - | IP address or hostname of API server |
| `API_SERVER_PORT` | 4000 | API server port |
| `API_KEY` | - | Device API key from web app |
| `WIFI_SSID` | - | WiFi network name |
| `WIFI_PASSWORD` | - | WiFi password |
| `MEASUREMENT_INTERVAL_MS` | 1800000 | Default 30 minutes (overridden by server) |
| `MEASUREMENT_TIMEOUT_MS` | 300000 | 5-minute timeout for user response |
| `DEFAULT_START_HOUR` | 6 | Default active window start (6 AM) |
| `DEFAULT_END_HOUR` | 22 | Default active window end (10 PM) |
| `DEFAULT_TIMEZONE_OFFSET` | -7.0 | Default UTC offset (MST) |
| `MAX_STORED_MEASUREMENTS` | 96 | Offline storage capacity |

### Server Configuration

The device fetches configuration from the API server on boot and every hour:

```
GET /api/devices/{deviceId}/config
```

Server response:
```json
{
  "success": true,
  "data": {
    "config": {
      "measurementFrequency": 1800,
      "activeStartTime": "06:00",
      "activeEndTime": "22:00",
      "timezone": "America/Phoenix",
      "timezoneOffset": -7.0
    }
  }
}
```

---

## API Integration

### Measurement Submission

The device sends measurements via HTTP POST:

```
POST /api/measurements
```

Headers:
```
Content-Type: application/json
X-API-Key: <your-api-key>
```

Body:
```json
{
  "deviceId": "1a2b3c4d5e6f7890abcd1234",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-12-11T14:30:00Z",
  "quality": "good",
  "confidence": 0.95
}
```

### Finding Your Computer's IP (Local Development)

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address under your WiFi adapter
```

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Or: System Preferences → Network → WiFi → Advanced → TCP/IP
```

---

## LED Signal Reference

| Color | Pattern | Meaning |
|-------|---------|---------|
| Cyan | Solid | Device starting up |
| Blue | Slow blink (1 Hz) | Waiting for user measurement |
| Blue | Solid | Measurement in progress |
| Green | Single flash | Measurement sent successfully |
| Yellow | Single flash | Measurement stored locally (no WiFi) |
| Red | Rapid blink | Error condition |

---

## Troubleshooting

### Sensor Not Detected
1. Check I2C connections (SDA→D0, SCL→D1)
2. Verify 3.3V power connection
3. Ensure sensor module has proper pull-up resistors

### WiFi Won't Connect
1. Verify SSID and password are correct in `config.h`
2. Ensure network is 2.4GHz (Photon 2 supports both 2.4/5GHz)
3. Try resetting WiFi credentials: hold MODE button for 3+ seconds

### Measurements Not Transmitting
1. Verify `API_SERVER_HOST` and `API_SERVER_PORT` are correct
2. Check `API_KEY` matches your registered device
3. Ensure API server is running and accessible
4. Monitor serial output for error messages

### Inaccurate Readings
1. Ensure finger is properly placed (pad of finger, not tip)
2. Keep finger still during measurement
3. Clean sensor surface with soft cloth
4. Avoid bright ambient light during measurement

---

## Resources

### Documentation
- [Particle Photon 2 Docs](https://docs.particle.io/photon-2/)
- [MAX30102 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX30102.pdf)
- [SparkFun MAX3010x Library](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library)

### Particle CLI Reference
```bash
particle help              # Show all commands
particle list              # List your devices
particle serial monitor    # View serial output
particle flash <device>    # Flash firmware OTA
particle identify          # Get device ID
```

---

## License

MIT License - See repository root for details.
