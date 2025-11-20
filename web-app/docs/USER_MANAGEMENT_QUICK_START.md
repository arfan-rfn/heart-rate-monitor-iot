# User Management - Quick Start Guide

## 🚀 Quick Test

### 1. Start Backend
```bash
cd ../api-server
npm run dev
# Backend running at http://localhost:4000
```

### 2. Start Frontend
```bash
cd web-app
npm run dev
# Frontend running at http://localhost:3000
```

### 3. Test Features
1. Sign in at http://localhost:3000/auth/sign-in
2. Navigate to http://localhost:3000/settings
3. Test each page

---

## 📁 New Files Created

### Types
- `lib/types/user.ts` - All TypeScript types

### Hooks
- `hooks/use-user-management.ts` - React Query hooks

### Pages
- `app/(app)/settings/profile/page.tsx` - Profile settings
- `app/(app)/settings/security/page.tsx` - Password change

### Docs
- `docs/USER_MANAGEMENT_FRONTEND.md` - Full documentation
- `docs/USER_MANAGEMENT_IMPLEMENTATION_SUMMARY.md` - Implementation summary

---

## 🎯 Features

### Profile Settings (`/settings/profile`)
- ✅ Update name
- ✅ View device count
- ✅ View measurement count
- ✅ Real-time validation

### Security Settings (`/settings/security`)
- ✅ Change password
- ✅ Password validation
- ✅ Show/hide password
- ✅ Requirements checklist

### Account Settings (`/settings/account`)
- ✅ View account info
- ✅ Sign out
- ✅ Delete account (with password)

---

## 🔧 API Hooks Available

```typescript
import {
  useUserProfile,          // Get profile + stats
  useUpdateUserProfile,    // Update name
  useChangePassword,       // Change password
  useDeleteUserAccount,    // Delete account
  useUpdatePhysician,      // Update physician
} from '@/hooks/use-user-management'
```

---

## 📊 Example Usage

### Get Profile
```typescript
const { data: profile, isLoading } = useUserProfile()

// profile.user.name
// profile.user.email
// profile.stats.deviceCount
// profile.stats.recentMeasurementCount
```

### Update Name
```typescript
const updateMutation = useUpdateUserProfile()

updateMutation.mutate({ name: 'New Name' })
// Shows toast on success/error
// Auto-refreshes profile data
```

### Change Password
```typescript
const changeMutation = useChangePassword()

changeMutation.mutate({
  currentPassword: 'OldPass123!',
  newPassword: 'NewPass456!'
})
```

### Delete Account
```typescript
const deleteMutation = useDeleteUserAccount()

deleteMutation.mutate({ password: 'Password123!' })
// Redirects to sign-in after success
```

---

## 🔐 Password Requirements

- ✅ Minimum 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)
- ✅ One special character (!@#$%...)

Use helper function:
```typescript
import { validatePassword } from '@/lib/types/user'

const { isValid, errors } = validatePassword('test')
// isValid: false
// errors: ['Password must be at least 8 characters...']
```

---

## 🎨 Navigation Structure

```
Settings
├── Profile    - Update name, view stats
├── Account    - View info, sign out, delete
├── Security   - Change password
└── Appearance - Theme (existing)
```

---

## ⚙️ Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🧪 Manual Testing Checklist

### Profile Page
- [ ] Name updates successfully
- [ ] Stats display correctly
- [ ] Cancel button resets form
- [ ] Save button disabled when no changes

### Security Page
- [ ] Password validation works
- [ ] Show/hide toggles work
- [ ] Password mismatch error shown
- [ ] Success toast after change
- [ ] Form clears after success

### Account Page
- [ ] Account info displays
- [ ] Sign out works
- [ ] Delete shows correct stats
- [ ] Delete requires password
- [ ] Delete succeeds and redirects

---

## 🐛 Troubleshooting

### Profile not loading?
1. Check backend is running
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for errors
4. Ensure you're signed in

### Password change failing?
1. Verify current password is correct
2. Check new password meets requirements
3. Look at toast notification for specific error

### API errors?
1. Check Network tab in DevTools
2. Verify backend is running on port 4000
3. Check CORS configuration
4. Ensure JWT token is valid

---

## 📚 Full Documentation

- **Implementation Guide:** `docs/USER_MANAGEMENT_FRONTEND.md`
- **Summary:** `docs/USER_MANAGEMENT_IMPLEMENTATION_SUMMARY.md`
- **Backend API:** `../api-server/docs/USER_MANAGEMENT_API.md`
- **Backend Quick Ref:** `../api-server/docs/QUICK_REFERENCE.md`

---

## ✨ What's Next?

### Ready to Use
- ✅ Profile management
- ✅ Password change
- ✅ Account deletion
- ✅ Sign out

### Future Features (Hooks Ready)
- ⏳ Physician association UI
- ⏳ Email change
- ⏳ Two-factor authentication
- ⏳ Session management

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-11-19
