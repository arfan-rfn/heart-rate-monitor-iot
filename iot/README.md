# Heart Track IoT Device Firmware

## Overview

Firmware for the Particle Photon 2 IoT device that interfaces with the MAX30102/MAX30105 heart rate and blood oxygen sensor. The device periodically prompts users to take measurements, processes sensor data, and transmits readings to the backend API server.

**Supports two connection modes:**
- **Direct HTTP** – For local development with the API server running on your computer
- **Particle Webhooks** – For production deployment with Vercel-hosted HTTPS API

---

## Features

- **Heart Rate & SpO2 Measurement** – Accurate pulse oximetry using the MAX30102/MAX30105 sensor
- **State Machine Architecture** – Robust state management for measurement lifecycle
- **Configurable Scheduling** – Server-controlled measurement frequency and active time windows
- **Offline Storage** – EEPROM-based storage when WiFi is unavailable:
  - Up to 48 measurements stored offline
  - Up to 24 timeout notifications stored offline
  - Data persists across device reboots
- **Auto-Sync** – Automatic transmission of all stored data when connectivity is restored
- **Visual Feedback** – RGB LED patterns indicate device status and measurement results
- **Dual Connection Modes** – Switch between localhost (HTTP) and Vercel (HTTPS via webhooks)

---

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
```

---

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
| **STABILIZING** | Averaging readings for accuracy | Pulsing blue |
| **TRANSMITTING** | Sending data to server | Cyan → Green (sent) / Yellow (stored offline) |

### Module Structure

```
iot/src/
├── heart-track-iot.ino    # Main entry point
├── config.h               # Configuration (WiFi, API, connection mode)
├── state_machine.h/cpp    # State machine logic & scheduling
├── sensor_manager.h/cpp   # MAX30102 sensor interface
├── network_manager.h/cpp  # HTTP/Webhook communication
└── led_controller.h/cpp   # RGB LED patterns
```

---

## Development Setup with Particle Workbench

### Prerequisites

1. **Particle Account** – Create an account at https://login.particle.io/signup
2. **Particle Photon 2** – Device must be claimed to your Particle account
3. **Visual Studio Code** – Download from https://code.visualstudio.com/

### Step 1: Install Particle Workbench

#### Windows

1. Download and install VSCode from https://code.visualstudio.com/
2. Open VSCode
3. Press `Ctrl+Shift+X` to open Extensions
4. Search for **"Particle Workbench"**
5. Click **Install** and wait for all dependencies (this may take several minutes)
6. Restart VSCode when prompted

#### macOS

1. Download and install VSCode from https://code.visualstudio.com/
2. Open VSCode
3. Press `Cmd+Shift+X` to open Extensions
4. Search for **"Particle Workbench"**
5. Click **Install** and wait for all dependencies
6. Restart VSCode when prompted

### Step 2: Login to Particle

1. Open Command Palette:
   - **Windows:** `Ctrl+Shift+P`
   - **macOS:** `Cmd+Shift+P`
2. Type `Particle: Login` and press Enter
3. Enter your Particle account credentials

### Step 3: Open the IoT Project

1. File → Open Folder
2. Navigate to the `iot/` directory and open it
3. VSCode will recognize it as a Particle project

### Step 4: Configure Target Device

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type `Particle: Configure Project for Device`
3. Select **P2 / Photon 2** as the platform
4. Select Device OS version **6.x.x** (recommended: latest stable)

### Step 5: Configure Your Device

Edit `src/config.h` with your settings:

```cpp
// ===== WiFi Credentials =====
#define WIFI_SSID "YourNetworkName"
#define WIFI_PASSWORD "YourNetworkPassword"

// ===== API Key (from web app device registration) =====
#define API_KEY "your-64-character-api-key-here"

// ===== Connection Mode (choose one) =====

// For LOCAL DEVELOPMENT (API server on your computer):
#define API_SERVER_HOST "192.168.1.100"  // Your computer's IP address
#define API_SERVER_PORT 4000
#define USE_WEBHOOK false

// For VERCEL PRODUCTION (HTTPS via webhooks):
#define API_SERVER_HOST "heart-rate-monitor-iot.vercel.app"
#define API_SERVER_PORT 443
#define USE_WEBHOOK true
```

### Step 6: Compile the Firmware

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Choose one of:
   - **`Particle: Cloud Compile`** – Compile in the cloud (recommended for first time)
   - **`Particle: Local Compile`** – Compile locally (faster after initial setup)

### Step 7: Flash the Firmware

#### Option A: Cloud Flash (Over-the-Air)

1. Ensure your Photon 2 is online (breathing cyan LED)
2. Open Command Palette
3. Type `Particle: Cloud Flash`
4. Select your device from the list

#### Option B: Local Flash (USB)

1. Connect your Photon 2 via USB
2. Put device in DFU mode:
   - Hold **MODE** button
   - Press and release **RESET** button
   - Continue holding **MODE** until LED blinks yellow
3. Open Command Palette
4. Type `Particle: Flash application (local)`

### Step 8: Monitor Serial Output

1. Connect your Photon 2 via USB (if not already)
2. Open Command Palette
3. Type `Particle: Serial Monitor`
4. Select your device's serial port

You should see:
```
===================================
Team 13 - IoT Heart Rate Device
===================================

Connecting to WiFi...
WiFi Connected
IP: 192.168.1.xxx
Particle Cloud Connected
Device: e00fce68xxxxxxxxxx

Network Manager initialized
Mode: Direct HTTP
API Server: http://192.168.1.100:4000

>>> System Ready <<<
```

---

## Testing Modes

### Local Development Testing (Direct HTTP)

Use this mode when running the API server on your local machine.

#### Configuration

Edit `src/config.h`:

```cpp
#define API_SERVER_HOST "192.168.1.100"  // Your computer's local IP
#define API_SERVER_PORT 4000
#define USE_WEBHOOK false
```

#### Finding Your Computer's IP Address

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

**macOS:**
```bash
ipconfig getifaddr en0
# Or: System Settings → Network → WiFi → Details → TCP/IP
```

#### Starting the Local API Server

```bash
cd ../api-server
npm install
npm run dev
```

The server should start on `http://localhost:4000`

#### Testing the Connection

1. Start the API server
2. Flash firmware with `USE_WEBHOOK false`
3. Monitor serial output
4. Wait for measurement prompt (blue blinking LED)
5. Place finger on sensor
6. Verify measurement appears in API logs

### Vercel Production Testing (Webhooks)

Use this mode for production deployment with the Vercel-hosted API.

#### Configuration

Edit `src/config.h`:

```cpp
#define API_SERVER_HOST "heart-rate-monitor-iot.vercel.app"
#define API_SERVER_PORT 443
#define USE_WEBHOOK true
```

#### Setting Up Webhooks

**You must configure webhooks in Particle Console before using this mode.**

See [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) for detailed instructions.

#### Required Webhooks

| Webhook Event | Endpoint | Method |
|---------------|----------|--------|
| `heartrate-measurement` | `/api/measurements` | POST |
| `heartrate-timeout` | `/api/notifications` | POST |
| `heartrate-getconfig` | `/api/devices/{deviceId}/config` | GET |

#### Testing the Connection

1. Configure all three webhooks in Particle Console
2. Flash firmware with `USE_WEBHOOK true`
3. Monitor serial output for webhook messages
4. Verify events in Particle Console → Events
5. Check measurements in the web app

---

## Device Registration

### Step 1: Get Your Device ID

Using Particle CLI:
```bash
particle identify
```

Or from serial output:
```
Device: e00fce68xxxxxxxxxx  ← This is your Device ID
```

Or from Particle Console: https://console.particle.io/devices

### Step 2: Register in Web App

1. Log in to the Heart Track web application
2. Navigate to **Devices** page
3. Click **Register New Device**
4. Enter your 24-character Particle device ID
5. **Copy the API key** that is displayed (shown only once!)

### Step 3: Update config.h

```cpp
#define API_KEY "your-64-character-api-key-here"
```

---

## Configuration Reference

### config.h Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `API_SERVER_HOST` | – | API server hostname or IP |
| `API_SERVER_PORT` | 4000 / 443 | Port (4000 for local, 443 for Vercel) |
| `USE_WEBHOOK` | true | `true` for Vercel, `false` for localhost |
| `API_KEY` | – | Device API key from web app |
| `WIFI_SSID` | – | WiFi network name |
| `WIFI_PASSWORD` | – | WiFi password |
| `MEASUREMENT_INTERVAL_MS` | 1800000 | Default 30 min (server can override) |
| `MEASUREMENT_TIMEOUT_MS` | 300000 | 5-minute timeout for user response |
| `DEFAULT_START_HOUR` | 6 | Active window start (6 AM) |
| `DEFAULT_END_HOUR` | 22 | Active window end (10 PM) |
| `MAX_STORED_MEASUREMENTS` | 48 | Offline measurement storage capacity |
| `MAX_STORED_TIMEOUTS` | 24 | Offline timeout notification storage |

### Server-Controlled Configuration

The device fetches configuration on boot and hourly:

```
GET /api/devices/{deviceId}/config
```

Response:
```json
{
  "success": true,
  "data": {
    "config": {
      "measurementFrequency": 1800,
      "activeStartTime": "06:00",
      "activeEndTime": "22:00"
    }
  }
}
```

---

## API Integration

### Measurement Submission

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
  "deviceId": "e00fce68xxxxxxxxxx",
  "heartRate": 72,
  "spO2": 98,
  "timestamp": "2025-12-11T14:30:00Z",
  "quality": "good",
  "confidence": 0.95
}
```

### Testing API Endpoints

**Test measurement submission:**
```bash
curl -X POST "http://localhost:4000/api/measurements" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "deviceId": "YOUR_DEVICE_ID",
    "heartRate": 75,
    "spO2": 98,
    "timestamp": "2025-12-11T12:00:00Z",
    "quality": "good"
  }'
```

**Test config endpoint:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "http://localhost:4000/api/devices/YOUR_DEVICE_ID/config"
```

For Vercel, replace `http://localhost:4000` with `https://heart-rate-monitor-iot.vercel.app`

---

## LED Signal Reference

| Color | Pattern | Meaning |
|-------|---------|---------|
| Cyan | Solid | Device starting up |
| Blue | Slow blink (1 Hz) | Waiting for user measurement |
| Blue | Solid | Measurement in progress |
| Blue | Pulsing | Stabilizing/calculating |
| Cyan | Solid | Transmitting data |
| Green | Single flash | Data sent successfully to server |
| Yellow | Single flash | Data stored locally (offline mode) |
| Green | Single flash (sync) | Stored data synced to server |
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
3. Check WiFi signal strength via serial output (RSSI)
4. Note: Particle devices persist WiFi credentials - old networks may auto-connect

### Testing Offline Mode
To test offline functionality:
1. **Option A:** Uncomment `WiFi.clearCredentials();` in setup(), flash, then comment it back
2. **Option B:** Use invalid WiFi credentials in `config.h`
3. **Option C:** Turn off your WiFi router

When offline, you should see:
```
WiFi Not Connected - offline mode
...
No connection - storing measurement locally
Measurement STORED locally (1/48)
```

When WiFi reconnects:
```
WiFi reconnected - will retry config fetch
Syncing stored measurement to server...
Stored measurement synced successfully (X remaining)
```

### Measurements Not Transmitting (Local Mode)
1. Verify `API_SERVER_HOST` is your computer's IP (not localhost)
2. Ensure API server is running on port 4000
3. Check that device and computer are on the same network
4. Verify firewall allows connections on port 4000

### Measurements Not Transmitting (Webhook Mode)
1. Verify all three webhooks are configured in Particle Console
2. Check Particle Console → Events for `hook-error/*` events
3. Ensure `API_KEY` matches your registered device
4. Verify device is connected to Particle Cloud (breathing cyan LED)

### Configuration Not Loading
1. Check API key is valid (test with curl)
2. For webhooks, verify `heartrate-getconfig` webhook has Response Template
3. Monitor serial output for config response parsing errors

### Inaccurate Readings
1. Ensure finger is properly placed (pad of finger, not tip)
2. Keep finger still during measurement
3. Clean sensor surface with soft cloth
4. Avoid bright ambient light during measurement

---

## Particle CLI Reference

```bash
particle login              # Log in to Particle account
particle list               # List your devices
particle identify           # Get device ID (when connected via USB)
particle serial monitor     # View serial output
particle compile p2 .       # Compile firmware
particle flash <device>     # Flash over-the-air
particle flash --usb        # Flash via USB (DFU mode)
```

---

## Resources

- [Particle Photon 2 Documentation](https://docs.particle.io/photon-2/)
- [Particle Workbench Guide](https://docs.particle.io/getting-started/developer-tools/workbench/)
- [MAX30102 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX30102.pdf)
- [SparkFun MAX3010x Library](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library)
- [Particle Console](https://console.particle.io/)
- [Particle Webhooks Guide](https://docs.particle.io/integrations/webhooks/)

---

## License

MIT License - See repository root for details.
