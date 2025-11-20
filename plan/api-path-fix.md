# API Path Fix

## Issue
The measurement API endpoints had double `/api` in the paths:
- ❌ `http://localhost:4000/api/api/measurements/daily/2025-11-19`

## Root Cause
The API client in `lib/api/client.ts` directly appends endpoints to the base URL. Other API files (like `devices.ts`) don't include `/api` in their paths because the base URL or routing handles it.

## Fix Applied
Removed `/api` prefix from all measurement endpoints in `lib/api/measurements.ts`:

**Before**:
```typescript
'/api/measurements/weekly/summary'
'/api/measurements/daily/${date}'
'/api/measurements/daily-aggregates?days=${days}'
'/api/measurements?${queryString}'
'/api/measurements/device/${deviceId}'
'/api/measurements'
```

**After**:
```typescript
'/measurements/weekly/summary'
'/measurements/daily/${date}'
'/measurements/daily-aggregates?days=${days}'
'/measurements?${queryString}'
'/measurements/device/${deviceId}'
'/measurements'
```

## Result
URLs now resolve correctly:
- ✅ `http://localhost:4000/measurements/daily/2025-11-19`
- ✅ `http://localhost:4000/measurements/weekly/summary`
- ✅ `http://localhost:4000/measurements/daily-aggregates?days=7`

## Pattern to Follow
All API client functions should use paths **without** the `/api` prefix:
- ✅ Correct: `/devices`, `/measurements`, `/users`
- ❌ Wrong: `/api/devices`, `/api/measurements`, `/api/users`

The base URL (`NEXT_PUBLIC_API_URL`) handles the routing.

## Files Updated
1. `lib/api/measurements.ts` - Fixed all 6 endpoint paths
2. `docs/user-dashboard-visualization.md` - Updated API documentation
3. `web-app/README-DASHBOARD.md` - Added clarification note

**Status**: ✅ Fixed and verified with type checking
