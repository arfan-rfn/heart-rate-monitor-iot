# Device Management Feature

## Overview

The Device Management feature allows users to register, configure, and manage their IoT devices (heart rate monitors) through the PulseConnect web application. Each device receives a unique API key that enables it to submit measurements to the backend.

**Last Updated**: 2025-11-20

---

## Features

### 1. Device Registration
- Register new IoT devices with unique device IDs
- Assign friendly names to devices (max 100 characters)
- Automatic API key generation upon registration
- One-time display of full API key (security best practice)

### 2. Device List View
- View all registered devices in a grid layout
- Display device status badges (Active, Inactive, Error)
- Show key metrics: last seen, measurement frequency, active hours
- Empty state with call-to-action for first device

### 3. Device Configuration
- Configure measurement frequency (900-14400 seconds / 15 min - 4 hours)
- Set active time window (start and end times)
- Select timezone for device operations
- Real-time configuration updates

### 4. Device Management Actions
- Update device status (Active, Inactive, Error)
- Configure device settings
- Delete devices with confirmation dialog
- Copy API key preview to clipboard

### 5. API Key Management
- Secure one-time display of full API key
- Usage examples with curl commands
- Key preview in device settings (last 8 characters only)
- Clear security warnings and instructions

---

## File Structure

```
web-app/
├── app/(app)/devices/
│   └── page.tsx                              # Main devices page
├── components/devices/
│   ├── api-key-dialog.tsx                    # API key display dialog
│   ├── device-card.tsx                       # Individual device card
│   ├── device-config-dialog.tsx              # Configuration dialog
│   └── register-device-dialog.tsx            # Registration form
├── lib/
│   ├── api/
│   │   └── devices.ts                        # Device API client functions
│   └── types/
│       └── device.ts                         # Device TypeScript types
└── docs/
    └── DEVICE_MANAGEMENT.md                  # This file
```

---

## Component Architecture

### Pages

#### `/devices` (page.tsx)
- **Purpose**: Main devices management page
- **Authentication**: Protected (requires login)
- **Features**:
  - Device list grid
  - Registration button
  - Empty state handling
  - Loading and error states
- **Data Fetching**: React Query with `['devices']` key

### Components

#### `RegisterDeviceDialog`
- **Location**: `components/devices/register-device-dialog.tsx`
- **Type**: Client Component
- **Props**: `trigger?: React.ReactNode`
- **Features**:
  - Form validation (device ID and name required)
  - API key dialog trigger on success
  - Query invalidation after registration
  - Error handling with toast notifications

#### `DeviceCard`
- **Location**: `components/devices/device-card.tsx`
- **Type**: Client Component
- **Props**: `device: Device`
- **Features**:
  - Device information display
  - Status badge with color coding
  - Dropdown menu for actions
  - Delete confirmation dialog
  - Configuration dialog trigger

#### `DeviceConfigDialog`
- **Location**: `components/devices/device-config-dialog.tsx`
- **Type**: Client Component
- **Props**:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
  - `device: Device | null`
- **Features**:
  - Measurement frequency input (validated 900-14400s)
  - Time pickers for active window
  - Timezone selector (common US timezones + UTC)
  - Form validation and submission

#### `ApiKeyDialog`
- **Location**: `components/devices/api-key-dialog.tsx`
- **Type**: Client Component
- **Props**:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
  - `apiKey: string`
  - `deviceName?: string`
- **Features**:
  - Prominent security warnings
  - Copy-to-clipboard functionality
  - Usage example with curl command
  - Environment-aware API URL

---

## API Integration

### Endpoints

All API functions are in `lib/api/devices.ts`:

#### `registerDevice(data: CreateDeviceRequest)`
- **Method**: POST
- **Endpoint**: `/devices`
- **Auth**: JWT Bearer token required
- **Request**:
  ```typescript
  {
    deviceId: string  // Unique identifier
    name: string      // Friendly name
  }
  ```
- **Response**: `DeviceWithApiKeyResponse` (includes API key - shown once)

#### `getDevices()`
- **Method**: GET
- **Endpoint**: `/devices`
- **Auth**: JWT Bearer token required
- **Response**: `DevicesListResponse` (array of devices + count)

#### `getDevice(deviceId: string)`
- **Method**: GET
- **Endpoint**: `/devices/:deviceId`
- **Auth**: JWT Bearer token required
- **Response**: `DeviceResponse`

#### `updateDevice(deviceId: string, data: UpdateDeviceRequest)`
- **Method**: PUT
- **Endpoint**: `/devices/:deviceId`
- **Auth**: JWT Bearer token required
- **Request**:
  ```typescript
  {
    name?: string
    status?: "active" | "inactive" | "error"
  }
  ```
- **Response**: `DeviceResponse`

#### `updateDeviceConfig(deviceId: string, data: UpdateDeviceConfigRequest)`
- **Method**: PUT
- **Endpoint**: `/devices/:deviceId/config`
- **Auth**: JWT Bearer token required
- **Request**:
  ```typescript
  {
    measurementFrequency?: number  // 900-14400 seconds
    activeStartTime?: string       // HH:MM format
    activeEndTime?: string         // HH:MM format
    timezone?: string              // IANA timezone
  }
  ```
- **Response**: `DeviceConfigResponse`

#### `getDeviceConfig(deviceId: string)`
- **Method**: GET
- **Endpoint**: `/devices/:deviceId/config`
- **Auth**: API Key OR JWT Bearer token
- **Response**: `DeviceConfigResponse`

#### `deleteDevice(deviceId: string)`
- **Method**: DELETE
- **Endpoint**: `/devices/:deviceId`
- **Auth**: JWT Bearer token required
- **Response**: 204 No Content

---

## TypeScript Types

### Device
```typescript
interface Device {
  id: string                  // MongoDB ObjectId
  deviceId: string            // Unique identifier
  name: string                // User-friendly name
  status: DeviceStatus        // "active" | "inactive" | "error"
  config: DeviceConfig
  lastSeen: string | null     // ISO 8601 timestamp
  createdAt: string           // ISO 8601 timestamp
  updatedAt: string           // ISO 8601 timestamp
}
```

### DeviceConfig
```typescript
interface DeviceConfig {
  measurementFrequency: number  // Seconds (900-14400)
  activeStartTime: string       // HH:MM format
  activeEndTime: string         // HH:MM format
  timezone: string              // IANA timezone
}
```

### DeviceWithApiKey
```typescript
interface DeviceWithApiKey extends Device {
  apiKey: string  // Only included in registration response
}
```

---

## State Management

### React Query Keys
```typescript
['devices']                    // All devices list
['device', deviceId]           // Single device detail
```

### Query Invalidation
After mutations, the following queries are invalidated:
- Device registration → `['devices']`
- Device update → `['devices']`, `['device', deviceId]`
- Device config update → `['devices']`, `['device', deviceId]`
- Device deletion → `['devices']`

---

## User Flows

### 1. Registering a New Device

1. User navigates to `/devices`
2. Clicks "Register Device" button
3. Dialog opens with registration form
4. User enters:
   - Device ID (e.g., "photon-12345abc")
   - Device Name (e.g., "Living Room Monitor")
5. User submits form
6. Backend validates and generates API key
7. Registration dialog closes
8. API key dialog opens showing full key
9. User copies API key for device configuration
10. User confirms they've saved the key
11. Device appears in devices list

### 2. Configuring a Device

1. User clicks menu icon on device card
2. Selects "Configure" from dropdown
3. Configuration dialog opens with current settings
4. User updates:
   - Measurement frequency slider/input
   - Active start time
   - Active end time
   - Timezone
5. User clicks "Update Config"
6. Backend validates and saves configuration
7. Dialog closes, device card updates

### 3. Managing Device Status

1. User clicks menu icon on device card
2. Selects status option:
   - "Mark Active" - device is operational
   - "Mark Inactive" - device is paused/offline
3. Backend updates status
4. Device card badge updates immediately

### 4. Deleting a Device

1. User clicks menu icon on device card
2. Selects "Delete Device" (red text)
3. Confirmation dialog appears with warning
4. User confirms deletion
5. Backend deletes device and associated data
6. Device removed from list
7. Success toast notification

---

## Security Considerations

### API Key Security
1. **One-Time Display**: Full API key only shown once during registration
2. **No Storage**: API keys are NOT stored in frontend state or localStorage
3. **Preview Only**: Device list shows last 8 characters only
4. **Copy Protection**: Users must manually copy during registration dialog
5. **Regeneration**: Users must regenerate account-level key in security settings

### Authentication
- All device management endpoints require JWT authentication
- Session validated on every API request
- Automatic redirect to sign-in if unauthenticated
- Device ownership verified by backend

### Data Validation
- Device ID and name required (frontend + backend)
- Device name max 100 characters
- Measurement frequency: 900-14400 seconds (validated)
- Time format: HH:MM (HTML5 time input)
- Timezone: IANA format (dropdown selection)

---

## Error Handling

### Frontend Error Display
```typescript
// API errors shown via toast notifications
try {
  await registerDevice(data)
} catch (error) {
  toast.error(error?.message || "Failed to register device")
}
```

### Common Error Scenarios
1. **Device ID Already Exists** (400)
   - Message: "Device ID already registered"
   - Action: User must choose different ID

2. **Unauthorized** (401)
   - Message: "User not authenticated"
   - Action: Redirect to sign-in

3. **Invalid Input** (400)
   - Message: "Device ID and name are required"
   - Action: User corrects form

4. **Network Error**
   - Message: "Failed to connect to server"
   - Action: User retries

---

## Accessibility

### Keyboard Navigation
- All dialogs support ESC to close
- Tab navigation through forms
- Enter to submit forms

### Screen Readers
- Semantic HTML elements
- ARIA labels on icon buttons
- Form labels properly associated
- Alert dialogs for destructive actions

### Visual Design
- Status badges with clear colors:
  - Green: Active
  - Gray: Inactive
  - Red: Error
- High contrast text
- Responsive grid layout

---

## Mobile Responsiveness

### Breakpoints
- **Mobile**: Single column grid
- **Tablet (md)**: 2 column grid
- **Desktop (lg)**: 3 column grid

### Mobile Optimizations
- Touch-friendly button sizes
- Full-width dialogs on small screens
- Scrollable dialog content
- Simplified dropdown menus

---

## Future Enhancements

### Planned Features
1. **Device Analytics**
   - Uptime tracking
   - Data quality metrics
   - Connection history

2. **Bulk Actions**
   - Select multiple devices
   - Batch status updates
   - Export device list

3. **Device Grouping**
   - Organize by location
   - Custom tags
   - Filtering and search

4. **Real-time Status**
   - WebSocket connection status
   - Live measurement preview
   - Connection quality indicator

5. **API Key Rotation**
   - Per-device API keys (currently account-level)
   - Automatic key expiration
   - Key usage analytics

---

## Troubleshooting

### Device Not Appearing After Registration
- Check browser console for errors
- Verify authentication token is valid
- Try refreshing the page
- Check network tab for API response

### Configuration Not Saving
- Verify measurement frequency is 900-14400
- Check time format is HH:MM
- Ensure timezone is selected
- Look for validation error messages

### API Key Not Displaying
- Ensure popup blockers are disabled
- Check browser console for errors
- Verify registration completed successfully
- Contact support if key was missed (requires regeneration)

---

## Testing Checklist

### Manual Testing
- [ ] Register device with valid inputs
- [ ] Register device with duplicate ID (should fail)
- [ ] Register device with empty fields (should fail)
- [ ] View device list
- [ ] Update device configuration
- [ ] Change device status
- [ ] Delete device
- [ ] Copy API key to clipboard
- [ ] Test on mobile device
- [ ] Test with keyboard navigation
- [ ] Test error states

### Integration Testing
- [ ] Verify API key works for measurements
- [ ] Test authentication redirect
- [ ] Verify query invalidation
- [ ] Test concurrent updates
- [ ] Verify ownership restrictions

---

## Resources

### Related Documentation
- [API Documentation](../api-server/README.md)
- [Security Guidelines](./SECURITY.md)
- [Authentication](./authentication-security-audit.md)

### External References
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)
- [IANA Timezones](https://www.iana.org/time-zones)

---

## Changelog

### 2025-11-20
- Initial device management implementation
- Device registration with API key generation
- Device list with card layout
- Configuration management
- Status updates and deletion
- API key display dialog with security warnings

---

## Support

For questions or issues:
1. Check this documentation
2. Review [CLAUDE.md](../CLAUDE.md) for development guidelines
3. Check browser console for errors
4. Verify backend API is running and accessible
5. Open issue in project repository
