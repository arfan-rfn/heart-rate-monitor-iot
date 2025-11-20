/**
 * Device types for IoT device management
 */

export type DeviceStatus = "active" | "inactive" | "error"

export interface DeviceConfig {
  measurementFrequency: number // Seconds (900-14400, default: 1800)
  activeStartTime: string // HH:MM format (default: "06:00")
  activeEndTime: string // HH:MM format (default: "22:00")
  timezone: string // IANA timezone (default: "America/New_York")
}

export interface Device {
  id: string // MongoDB ObjectId
  deviceId: string // Unique identifier (e.g., Photon device ID)
  name: string // User-friendly name (max 100 chars)
  status: DeviceStatus
  config: DeviceConfig
  lastSeen: string | null // ISO 8601 timestamp
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

export interface DeviceWithApiKey extends Device {
  apiKey: string // Only shown once during registration
}

// Request types
export interface CreateDeviceRequest {
  deviceId: string
  name: string
}

export interface UpdateDeviceRequest {
  name?: string
  status?: DeviceStatus
}

export interface UpdateDeviceConfigRequest {
  measurementFrequency?: number
  activeStartTime?: string
  activeEndTime?: string
  timezone?: string
}

// Response types
export interface DevicesListResponse {
  devices: Device[]
  count: number
}

export interface DeviceResponse {
  device: Device
}

export interface DeviceWithApiKeyResponse {
  device: DeviceWithApiKey
}

export interface DeviceConfigResponse {
  config: DeviceConfig
}
