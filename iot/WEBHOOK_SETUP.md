# Particle Webhook Setup Guide

This guide explains how to configure Particle Webhooks for the Heart Rate Monitor IoT device to communicate with a Vercel-hosted HTTPS API.

## When to Use Webhooks

| Mode | Use Case | Configuration |
|------|----------|---------------|
| **Direct HTTP** | Local development (API on your computer) | `USE_WEBHOOK false` |
| **Webhooks** | Production (Vercel HTTPS API) | `USE_WEBHOOK true` |

When `USE_WEBHOOK true` is set in `config.h`, the Particle Cloud acts as a secure proxy—your device publishes events, and Particle forwards them to your HTTPS endpoint.

---

## Prerequisites

1. API deployed at: `https://heart-rate-monitor-iot.vercel.app`
2. Device registered in web app with a valid API key
3. Particle device claimed to your account

---

## Step 1: Access Particle Console

1. Go to [console.particle.io](https://console.particle.io)
2. Select your **Sandbox** (or Product if using one)
3. Click **Integrations** in the sidebar
4. Click **Add New Integration** → **Webhook**

---

## Webhook 1: heartrate-measurement

**Purpose:** Submit heart rate and SpO2 measurements to the API

### Basic Settings

| Field | Value |
|-------|-------|
| **Event Name** | `heartrate-measurement` |
| **URL** | `https://heart-rate-monitor-iot.vercel.app/api/measurements` |
| **Request Type** | `POST` |
| **Request Format** | `JSON` |

### Advanced Settings → Headers

Click **Advanced Settings** and add these custom headers:

| Header Name | Header Value |
|-------------|--------------|
| `X-API-Key` | `{{{apiKey}}}` |
| `Content-Type` | `application/json` |

> **Note:** The device includes `apiKey` in the JSON payload. The webhook template `{{{apiKey}}}` extracts it and places it in the header.

### JSON Data → Custom Body

Select **Custom** and enter:

```json
{
  "deviceId": "{{{deviceId}}}",
  "heartRate": {{{heartRate}}},
  "spO2": {{{spO2}}},
  "timestamp": "{{{timestamp}}}",
  "quality": "{{{quality}}}",
  "confidence": {{{confidence}}}
}
```

Click **Create Webhook**

---

## Webhook 2: heartrate-timeout

**Purpose:** Notify the server when a user doesn't respond to a measurement prompt

### Basic Settings

| Field | Value |
|-------|-------|
| **Event Name** | `heartrate-timeout` |
| **URL** | `https://heart-rate-monitor-iot.vercel.app/api/notifications` |
| **Request Type** | `POST` |
| **Request Format** | `JSON` |

### Advanced Settings → Headers

| Header Name | Header Value |
|-------------|--------------|
| `X-API-Key` | `{{{apiKey}}}` |
| `Content-Type` | `application/json` |

### JSON Data → Custom Body

```json
{
  "deviceId": "{{{deviceId}}}",
  "type": "{{{type}}}",
  "message": "{{{message}}}",
  "timestamp": "{{{timestamp}}}"
}
```

Click **Create Webhook**

---

## Webhook 3: heartrate-getconfig

**Purpose:** Fetch device configuration (measurement frequency, active hours) from the server

### Basic Settings

| Field | Value |
|-------|-------|
| **Event Name** | `heartrate-getconfig` |
| **URL** | `https://heart-rate-monitor-iot.vercel.app/api/devices/{{{deviceId}}}/config` |
| **Request Type** | `GET` |
| **Request Format** | `JSON` |

> **Note:** The URL includes `{{{deviceId}}}` which gets replaced with the actual device ID from the event payload.

### Advanced Settings → Headers

| Header Name | Header Value |
|-------------|--------------|
| `X-API-Key` | `{{{apiKey}}}` |

### ⚠️ CRITICAL: Response Configuration

This webhook needs to send the server's response back to the device.

1. Scroll to **Webhook Responses** section
2. **Response Topic** should show: `{{PARTICLE_DEVICE_ID}}/hook-response/{{PARTICLE_EVENT_NAME}}`
3. Add a **Response Template** to compress the response (webhook responses are limited to 622 bytes):

```
{"f":{{{data.config.measurementFrequency}}},"s":"{{{data.config.activeStartTime}}}","e":"{{{data.config.activeEndTime}}}"}
```

This creates a compact response like: `{"f":1800,"s":"06:00","e":"22:00"}`

Click **Create Webhook**

---

## Step 2: Update Device Configuration

Edit `iot/src/config.h`:

```cpp
// Vercel Production Mode
#define API_SERVER_HOST "heart-rate-monitor-iot.vercel.app"
#define API_SERVER_PORT 443
#define USE_WEBHOOK true   // Enable webhook mode

// Your credentials
#define API_KEY "your-64-character-api-key-here"
#define WIFI_SSID "your-wifi-network"
#define WIFI_PASSWORD "your-wifi-password"
```

---

## Step 3: Flash and Test

### Compile and Flash

Using Particle Workbench:
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type `Particle: Cloud Flash`

Using CLI:
```bash
cd iot
particle compile p2 . --saveTo firmware.bin
particle flash YOUR_DEVICE_NAME firmware.bin
```

### Monitor Serial Output

```bash
particle serial monitor
```

---

## Expected Serial Output

### On Boot

```
===================================
Team 13 - IoT Heart Rate Device
===================================

WiFi Connected
IP: 192.168.1.100
Particle Cloud Connected
Device: e00fce68xxxxxxxxxx

Network Manager initialized
Mode: Particle Webhooks (HTTPS via Particle Cloud)
Target: https://heart-rate-monitor-iot.vercel.app
Webhook events:
  'heartrate-measurement' -> POST /api/measurements
  'heartrate-timeout' -> POST /api/notifications
  'heartrate-getconfig' -> GET /api/devices/{id}/config

*** IMPORTANT: Configure webhooks in Particle Console! ***

Subscribed to config webhook responses
Config will be fetched from server (max 3 attempts)
```

### Config Fetch

```
Fetching device configuration (attempt 1/3)...
Device ID: e00fce68xxxxxxxxxx
Publishing to webhook 'heartrate-getconfig'...
Config request published: success
Waiting for webhook response...

=== Config Webhook Response Received ===
Event: hook-response/heartrate-getconfig/0
Data: {"f":1800,"s":"06:00","e":"22:00"}
✓ Configuration applied successfully from server
  Frequency: 1800 seconds
  Active: 06:00 - 22:00
```

### Sending Measurement

```
Posting measurement:
{"deviceId":"e00fce68...","heartRate":75,"spO2":98,"timestamp":"...","apiKey":"...","quality":"good","confidence":0.95}
Publishing to webhook 'heartrate-measurement'...
Webhook publish: success
Measurement posted successfully
```

---

## Switching Between Modes

### For Vercel Production (Webhooks)

```cpp
#define API_SERVER_HOST "heart-rate-monitor-iot.vercel.app"
#define API_SERVER_PORT 443
#define USE_WEBHOOK true
```

Requires all three webhooks configured in Particle Console.

### For Local Development (Direct HTTP)

```cpp
#define API_SERVER_HOST "192.168.1.100"  // Your computer's IP
#define API_SERVER_PORT 4000
#define USE_WEBHOOK false
```

No webhook configuration needed—device connects directly via HTTP.

---

## Troubleshooting

### "Not connected to Particle Cloud"

- Device needs active Particle Cloud connection for webhooks
- Check WiFi connection and `Particle.connect()` success
- Breathing cyan LED indicates cloud connection

### Config Not Loading

**Step 1: Test API directly**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://heart-rate-monitor-iot.vercel.app/api/devices/YOUR_DEVICE_ID/config"
```

Expected response:
```json
{"success":true,"data":{"config":{"measurementFrequency":1800,...}}}
```

**Step 2: Check Particle Console Events**
1. Go to console.particle.io → Events
2. Look for:
   - `heartrate-getconfig` (device published)
   - `hook-response/heartrate-getconfig` (webhook response)
   - `hook-error/heartrate-getconfig` (if failed)

**Step 3: Verify webhook configuration**
- Response Topic: `{{PARTICLE_DEVICE_ID}}/hook-response/{{PARTICLE_EVENT_NAME}}`
- Response Template must be valid JSON

### 401 Unauthorized

- API key is invalid or expired
- Check `{{{apiKey}}}` header template is correctly configured
- Verify device is registered in web app

### 400 Bad Request

- JSON template has syntax error
- Field names are case-sensitive
- Check Custom JSON body format

### Webhook Not Firing

- Event name must match exactly (case-sensitive)
- Check Particle Console → Events to verify event is published
- Ensure device is in correct product/sandbox

### Rate Limiting

- Particle limits: 1 publish per second per device
- Firmware includes 1.1s delay between publishes
- Burst publishes may be dropped

---

## Testing Webhooks

### View Events in Console

1. Go to console.particle.io
2. Click **Events** in sidebar
3. Filter by your device
4. Watch for `heartrate-*` and `hook-response/*` events

### Test API with curl

**Test Measurement:**
```bash
curl -X POST "https://heart-rate-monitor-iot.vercel.app/api/measurements" \
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

**Test Config:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://heart-rate-monitor-iot.vercel.app/api/devices/YOUR_DEVICE_ID/config"
```

---

## Summary

| Mode | Config | Webhooks Required? |
|------|--------|-------------------|
| **Webhook (Vercel)** | `USE_WEBHOOK true` | Yes (all 3) |
| **Direct HTTP (Local)** | `USE_WEBHOOK false` | No |

| Webhook Event | Purpose | Method | Endpoint | Needs Response? |
|---------------|---------|--------|----------|-----------------|
| `heartrate-measurement` | Submit readings | POST | `/api/measurements` | No |
| `heartrate-timeout` | User timeout alert | POST | `/api/notifications` | No |
| `heartrate-getconfig` | Fetch config | GET | `/api/devices/{id}/config` | **Yes** |
