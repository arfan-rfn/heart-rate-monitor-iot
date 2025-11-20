# User Management Frontend Implementation

This document describes the frontend implementation for the user management system that integrates with the backend API endpoints.

## Overview

The user management frontend provides a complete interface for users to:
- View and update their profile information
- Change their password with validation
- View account statistics (devices, measurements)
- Delete their account permanently
- Associate/disassociate with physicians (future feature)

## Architecture

### File Structure

```
web-app/
├── app/(app)/settings/
│   ├── profile/page.tsx          # Profile settings page
│   ├── security/page.tsx         # Security/password page
│   ├── account/page.tsx          # Account info and deletion
│   ├── layout.tsx                # Settings navigation
│   └── page.tsx                  # Default redirect to profile
├── hooks/
│   └── use-user-management.ts    # React Query hooks for API calls
├── lib/types/
│   └── user.ts                   # TypeScript types for user management
└── components/icons.tsx          # Icon components (updated with new icons)
```

## API Integration

### Backend Endpoints Used

All endpoints are located at `/api/users/*` on the backend:

1. `GET /api/users/profile` - Get user profile with statistics
2. `PUT /api/users/profile` - Update user name
3. `POST /api/users/change-password` - Change password
4. `DELETE /api/users/profile` - Delete account permanently
5. `PUT /api/users/physician` - Update physician association

### TypeScript Types

Located in `lib/types/user.ts`:

```typescript
// Main types
- UserProfile: Complete user profile data
- UserStats: Device count and measurement statistics
- GetProfileResponse: Profile fetch response
- UpdateProfileRequest/Response: Profile update
- ChangePasswordRequest/Response: Password change
- DeleteAccountRequest/Response: Account deletion
- UpdatePhysicianRequest/Response: Physician association

// Utilities
- PASSWORD_REQUIREMENTS: Password validation rules
- validatePassword(): Password validation helper
```

### React Query Hooks

Located in `hooks/use-user-management.ts`:

#### Query Hooks
- `useUserProfile()`: Fetch user profile with statistics
  - Cache: 5 minutes
  - Refetches on window focus and reconnect
  - Only runs when authenticated

#### Mutation Hooks
- `useUpdateUserProfile()`: Update user name
- `useChangePassword()`: Change password with validation
- `useDeleteUserAccount()`: Permanently delete account
- `useUpdatePhysician()`: Update physician association

All mutations:
- Show toast notifications on success/error
- Invalidate relevant queries to refetch updated data
- Handle API errors gracefully

## Pages

### 1. Profile Settings (`/settings/profile`)

**Features:**
- Display current name, email (read-only), and role
- Update name with real-time validation
- Show account statistics (devices, measurements)
- Cancel/save changes tracking

**Components:**
- Profile information card with editable name field
- Account statistics card with visual metrics
- Form validation and loading states

### 2. Security Settings (`/settings/security`)

**Features:**
- Change password with requirements validation
- Show/hide password toggle for all fields
- Real-time password strength validation
- Password requirements checklist

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character

**Components:**
- Current password field
- New password field with validation
- Confirm password field with match checking
- Password requirements info/error display
- Security tips card

### 3. Account Settings (`/settings/account`)

**Features:**
- View account information (read-only)
- Sign out from current session
- Delete account with password confirmation

**Account Deletion:**
- Requires password confirmation
- Shows what will be deleted (devices, measurements)
- Displays real device/measurement counts
- Irreversible action with clear warnings
- Redirects to sign-in after deletion

**Components:**
- Account information card (name, email, created date, ID)
- Danger zone with sign out and delete options
- Alert dialog for account deletion confirmation

### 4. Settings Layout

**Navigation Structure:**
1. Profile - Update name and view stats
2. Account - View info and manage sessions
3. Security - Change password
4. Appearance - Theme settings (existing)

**Responsive Design:**
- Desktop: Sidebar navigation with descriptions
- Mobile: Chip-style navigation with icons

## Implementation Details

### Authentication Flow

1. All pages check authentication status using `useAuthContext()`
2. Unauthenticated users are redirected to `/auth/sign-in`
3. Auth token is retrieved from context for API calls
4. Token is included in `Authorization: Bearer <token>` header

### Data Flow

```
User Action
    ↓
Component calls mutation hook
    ↓
Hook sends request to backend API
    ↓
Backend processes request
    ↓
Response returned to hook
    ↓
Hook shows toast notification
    ↓
Hook invalidates queries
    ↓
React Query refetches updated data
    ↓
UI updates with new data
```

### Error Handling

All API calls use try-catch with:
- Toast notifications for user feedback
- Specific error messages from backend
- Loading states during operations
- Disabled buttons during pending operations

### Form Validation

**Profile Update:**
- Name: 1-100 characters, required, non-empty

**Password Change:**
- All fields required
- New password must meet requirements
- Confirm password must match new password
- Real-time validation feedback

**Account Deletion:**
- Password required
- Confirmation before action
- Shows impact (device/measurement counts)

## Testing

### Manual Testing Checklist

#### Profile Settings
- [ ] Load profile data on page mount
- [ ] Update name successfully
- [ ] Show validation error for empty name
- [ ] Cancel changes resets form
- [ ] Display correct device and measurement counts

#### Security Settings
- [ ] Validate password requirements in real-time
- [ ] Show/hide password toggles work
- [ ] Password mismatch shows error
- [ ] Success toast on password change
- [ ] Form clears after successful change
- [ ] Error handling for incorrect current password

#### Account Settings
- [ ] Display all account information correctly
- [ ] Sign out button works
- [ ] Delete account shows correct statistics
- [ ] Delete requires password
- [ ] Delete button disabled without password
- [ ] Successfully deletes account and redirects

### Integration Testing

To test with the backend API:

1. Ensure backend is running at `http://localhost:4000`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `.env.local`
3. Sign in with a test account
4. Navigate to `/settings`
5. Test each page functionality

### Expected API Responses

All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Dependencies

All dependencies are already included in the project:
- `@tanstack/react-query` - Data fetching and caching
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `zod` - Schema validation (used in backend integration)

## Security Considerations

1. **Password Handling:**
   - Passwords never stored in state longer than necessary
   - Password fields use type="password"
   - Current password required for changes and deletion

2. **API Security:**
   - All requests include JWT token
   - Token retrieved from secure auth context
   - CORS configured on backend

3. **Data Validation:**
   - Client-side validation for UX
   - Server-side validation for security
   - Type-safe with TypeScript

## Future Enhancements

### Physician Association
The `useUpdatePhysician()` hook is implemented but not yet exposed in the UI. To add:

1. Create physician selection component
2. Add to profile or account settings page
3. Fetch available physicians (requires backend endpoint)
4. Allow users to select/remove physician

### Email Change
Currently email cannot be changed. To implement:
1. Add email change endpoint to backend
2. Implement verification flow
3. Add UI in account settings

### Two-Factor Authentication
Could be added to security settings:
1. Backend support for 2FA
2. QR code display for authenticator apps
3. Backup codes generation

## Troubleshooting

### Common Issues

**Profile not loading:**
- Check if user is authenticated
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for API errors
- Ensure backend is running

**Password change failing:**
- Verify current password is correct
- Check new password meets all requirements
- Look for specific error in toast notification
- Check network tab for API response

**Account deletion not working:**
- Ensure password is entered correctly
- Check if user has permission
- Verify backend endpoint is accessible
- Look for error messages in console

### Debug Mode

To enable debug logging:
1. Open browser DevTools
2. Check Network tab for API requests
3. Check Console for React Query logs
4. Verify request/response payloads

## Code Examples

### Using Hooks in Custom Components

```typescript
import { useUserProfile, useUpdateUserProfile } from '@/hooks/use-user-management'

function CustomProfileComponent() {
  const { data: profile, isLoading } = useUserProfile()
  const updateMutation = useUpdateUserProfile()

  const handleUpdate = () => {
    updateMutation.mutate({ name: 'New Name' })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <p>{profile?.user.name}</p>
      <button onClick={handleUpdate}>Update</button>
    </div>
  )
}
```

### Custom Password Validation

```typescript
import { validatePassword } from '@/lib/types/user'

const { isValid, errors } = validatePassword('TestPass123!')

if (!isValid) {
  errors.forEach(error => console.log(error))
}
```

## Maintenance

### Updating API Integration

If backend API changes:
1. Update types in `lib/types/user.ts`
2. Update hooks in `hooks/use-user-management.ts`
3. Update page components if needed
4. Run type checking: `npm run typecheck`
5. Test all functionality

### Adding New Settings Pages

1. Create page in `app/(app)/settings/[name]/page.tsx`
2. Add navigation item to `layout.tsx`
3. Add necessary hooks in `hooks/`
4. Add types in `lib/types/`
5. Update this documentation

## Resources

- [Backend API Documentation](../../../api-server/docs/USER_MANAGEMENT_API.md)
- [Backend Quick Reference](../../../api-server/docs/QUICK_REFERENCE.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Last Updated:** 2025-11-19
**Version:** 1.0.0
**Status:** Production Ready ✅
