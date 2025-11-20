/**
 * API client functions for device management
 */

import { apiClient } from './client'
import type {
  CreateDeviceRequest,
  UpdateDeviceRequest,
  UpdateDeviceConfigRequest,
  DevicesListResponse,
  DeviceResponse,
  DeviceWithApiKeyResponse,
  DeviceConfigResponse,
} from '@/lib/types/device'

/**
 * Register a new IoT device
 * @returns Device info with API key (shown only once)
 */
export async function registerDevice(data: CreateDeviceRequest) {
  return apiClient.post<DeviceWithApiKeyResponse>('/devices', data)
}

/**
 * Get all devices for the authenticated user
 */
export async function getDevices() {
  return apiClient.get<DevicesListResponse>('/devices')
}

/**
 * Get a single device by deviceId
 */
export async function getDevice(deviceId: string) {
  return apiClient.get<DeviceResponse>(`/devices/${deviceId}`)
}

/**
 * Update device information (name, status)
 */
export async function updateDevice(deviceId: string, data: UpdateDeviceRequest) {
  return apiClient.put<DeviceResponse>(`/devices/${deviceId}`, data)
}

/**
 * Update device configuration
 */
export async function updateDeviceConfig(
  deviceId: string,
  data: UpdateDeviceConfigRequest
) {
  return apiClient.put<DeviceConfigResponse>(`/devices/${deviceId}/config`, data)
}

/**
 * Get device configuration
 * Can be called with API key or JWT token
 */
export async function getDeviceConfig(deviceId: string) {
  return apiClient.get<DeviceConfigResponse>(`/devices/${deviceId}/config`)
}

/**
 * Delete a device
 */
export async function deleteDevice(deviceId: string) {
  return apiClient.delete(`/devices/${deviceId}`)
}
