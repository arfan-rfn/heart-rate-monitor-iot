# Project 3: Heart Track Web Frontend

## Overview

This project contains the web-based user interface for the Heart Track application built with **Next.js 15.2.4, React 19, TypeScript, and Tailwind CSS v4**. It provides an intuitive, responsive dashboard for users to view their heart rate and SpO2 measurements, manage devices, and interact with their health data. The frontend communicates with the backend API to display real-time health metrics, weekly summaries, and detailed daily views.

> **Note:** This project uses Next.js with the App Router, TypeScript strict mode for type safety, and Tailwind CSS v4 (PostCSS-based) for styling. This modern stack provides better performance, developer experience, and maintainability.

## ⚠️ Project Status Summary (2025-11-19)

### Quick Overview
- **Foundation:** ✅ 55% Complete (Auth, UI components, API client)
- **Core Features:** ❌ 0% Complete (Charts, Device Management, Health Views)
- **Overall:** ~35% Complete
- **Remaining Work:** 52-75 hours

### What's Working ✅
- Modern tech stack (Next.js 15, React 19, TypeScript, Tailwind CSS v4)
- Complete authentication system (email, Google OAuth, Magic Link)
- 64+ UI components (shadcn/ui + Radix UI)
- Dashboard structure and navigation
- Settings pages (profile, account, security, appearance)
- Admin portal (user management, sessions)
- API client with error handling

### Critical Missing ❌
- **Chart.js library not installed** (blocker for all visualizations)
- Device management UI (0%)
- Weekly summary view (0%)
- Daily detailed view (0%)
- Team info on landing page
- reference.html page
- Physician portal (ECE 513 requirement - 0%)

### Next Steps
1. Install Chart.js: `npm install chart.js react-chartjs-2`
2. Build device management UI (12 hours)
3. Implement weekly summary view (12 hours)
4. Implement daily detailed view (12 hours)
5. Complete landing pages (4 hours)
6. (ECE 513) Build physician portal (20 hours)

---

## ⚠️ Recent Updates (2025-11-19)

### Better Auth Integration ✅
- **Migrated to Better Auth v1.3.29** for authentication
- All auth flows now working correctly with backend
- Fixed session state update issues (see `SESSION_FIX_SUMMARY.md`)
- Session cookies properly configured for cross-origin requests

### Key Implementation Details
1. **Authentication:** Better Auth with email/password, Google OAuth, Apple, and Magic Link
2. **Frontend Framework:** Next.js 15.2.4 with App Router and React 19
3. **UI Library:** shadcn/ui with Radix UI primitives (64+ components)
4. **State Management:** TanStack Query for server state, Better Auth for auth state
5. **Styling:** Tailwind CSS v4 with dark mode support

## Technology Stack

- **Framework:** Next.js 15.2.4 (React-based framework with App Router)
- **Core:** React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (PostCSS-based configuration)
- **Charts:** Chart.js or Recharts (to be integrated)
- **State Management:** TanStack Query (React Query), Zustand stores
- **API Communication:** Fetch API with custom client wrapper
- **Authentication:** Better Auth v1.3.29 (session-based)
- **Storage:** HTTP-only cookies for session tokens (secure)
- **Icons:** Lucide React
- **UI Components:** shadcn/ui + Radix UI primitives
- **Forms:** React Hook Form + Zod validation
- **ECE 513:** Admin portal interface (partial)
- **Extra Credit:** AI chat interface (not started)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Web Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Next.js App Router                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │  /login  │  │/dashboard│  │ /weekly  │           │ │
│  │  └──────────┘  └──────────┘  └──────────┘           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │  /daily  │  │ /devices │  │/settings │           │ │
│  │  └──────────┘  └──────────┘  └──────────┘           │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         React Components & Client State              │ │
│  │  - Chart Components    - Auth Context                │ │
│  │  - UI Components       - Device State                │ │
│  └───────────────────────────────────────────────────────┘ │
│                         │                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          API Layer (lib/api.ts)                       │ │
│  │  - HTTP Client         - Error Handling               │ │
│  │  - Token Management    - Type Definitions             │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Backend REST API    │
            │  (Express Server)     │
            └───────────────────────┘
```

## Features

### Core Features
1. **User Authentication**
   - Registration with email validation
   - Login with JWT token storage
   - Logout and session management
   - Password strength indicators

2. **Dashboard**
   - Quick overview of recent measurements
   - Navigation to all major sections
   - Welcome message with user name
   - Device status indicators

3. **Weekly Summary View**
   - Last 7 days of measurement data
   - Statistical cards (avg, min, max)
   - Line chart for heart rate trends
   - Line chart for SpO2 trends
   - Day-by-day breakdown

4. **Daily Detailed View**
   - Select specific date
   - All measurements for that day
   - Interactive Chart.js visualizations
   - Time-series heart rate graph
   - Time-series SpO2 graph
   - Measurement quality indicators

5. **Device Management**
   - View all registered devices
   - Add new device with device ID
   - View device API key (masked)
   - Configure measurement frequency
   - Configure active time range
   - Delete device

6. **Account Settings**
   - View profile information
   - Update name and email
   - Change password
   - Delete account (with confirmation)

7. **Responsive Design**
   - Mobile (320px - 767px)
   - Tablet (768px - 1023px)
   - Desktop (1024px+)
   - Touch-friendly UI elements

### ECE 513 Features
8. **Physician Portal**
   - Separate physician registration
   - View all assigned patients
   - Access patient weekly summaries
   - View patient daily details
   - Adjust patient device configurations

### Extra Credit Features
9. **AI Health Assistant Chat**
   - Chat interface for health questions
   - Context-aware responses using RAG
   - Question suggestions
   - Chat history display
   - Medical disclaimer

10. **Additional Pages**
    - Landing page (index.html)
    - References and resources page
    - Help/FAQ section

## 🚨 Critical Missing Requirements

Before project submission, these **MUST** be implemented to meet minimum requirements:

### Priority 1: Core Health Monitoring Features (0% Complete)
1. **Chart.js Library** - ❌ NOT INSTALLED
   - Install: `npm install chart.js react-chartjs-2`
   - Blocker for all data visualization

2. **Device Management UI** - ❌ NOT IMPLEMENTED
   - Backend API: ✅ Ready
   - Frontend: Need 6-8 pages/components
   - Estimated: 12 hours

3. **Weekly Summary View** - ❌ NOT IMPLEMENTED
   - Backend API: ✅ Ready
   - Charts + statistics for last 7 days
   - Estimated: 12 hours

4. **Daily Detailed View** - ❌ NOT IMPLEMENTED
   - Backend API: ✅ Ready
   - Time-series charts for selected day
   - Estimated: 12 hours

5. **Landing Pages** - 🟡 PARTIAL (50%)
   - **index.html**: Need team info (names, emails, photos)
   - **reference.html**: ❌ NOT CREATED (list all third-party code)
   - Estimated: 4 hours

### Priority 2: ECE 513 Requirements (for Graduate Students)
6. **Physician Portal** - ❌ NOT IMPLEMENTED
   - Registration, patient list, patient views
   - Estimated: 20 hours

7. **HTTPS Deployment** - ❌ NOT IMPLEMENTED
   - SSL certificate setup
   - Estimated: 4 hours

### Priority 3: Extra Credit (Optional)
8. **AI Health Assistant** - ❌ NOT IMPLEMENTED
   - Chat interface + RAG backend
   - Estimated: 20 hours

**Total Estimated Work Remaining:** 52-75 hours

---

## TODO List

### Phase 1: Project Setup & Basic Structure ✅

- [x] **Project Initialization**
  - [x] Create project folder structure (Next.js App Router)
  - [x] Set up `.gitignore` for Next.js project
  - [x] Create `package.json` with dependencies
  - [x] Set up development server (Next.js dev)

- [x] **File Structure Setup**
  - [x] Set up App Router structure (`app/` directory)
  - [x] Configure TypeScript (`tsconfig.json`)
  - [x] Set up Tailwind CSS v4 configuration
  - [x] Create component directories
  - [x] Set up modular architecture with TypeScript

- [x] **CSS Framework & Variables**
  - [x] Configure Tailwind CSS v4 (PostCSS-based)
  - [x] Define CSS custom properties in `app/globals.css`
  - [x] Set up base reset/normalize styles (Tailwind)
  - [x] Create utility classes with Tailwind
  - [x] Define responsive breakpoints (sm, md, lg, xl, 2xl)

- [x] **Component Templates**
  - [x] Create shadcn/ui component library (64+ components)
  - [x] Add meta tags for SEO and viewport
  - [x] Include accessibility attributes (Radix UI)
  - [x] Set up Next.js layout templates
  - [x] Create reusable React component templates

### Phase 2: Authentication UI ✅ (Milestone)

- [x] **Sign-In Page** (`app/(app)/auth/sign-in/page.tsx`)
  - [x] Design sign-in form (email, password)
  - [x] Add form validation with Zod
  - [x] Implement error message display (Sonner toasts)
  - [x] Add "Remember Me" checkbox
  - [x] Add "Forgot Password" link
  - [x] Style with Tailwind CSS (responsive)
  - [x] Add loading spinner during submission
  - [x] Integrate with Better Auth backend (`/api/auth/sign-in/email`)
  - [x] Google OAuth integration
  - [x] Apple sign-in integration
  - [x] Magic link authentication option

- [x] **Sign-Up Page** (`app/(app)/auth/sign-up/page.tsx`)
  - [x] Design registration form (name, email, password)
  - [x] Add email format validation with Zod
  - [x] Add password strength indicators
  - [x] Implement password validation
  - [x] Add terms of service checkbox
  - [x] Style with Tailwind CSS (responsive)
  - [x] Add loading spinner during submission
  - [x] Integrate with Better Auth backend (`/api/auth/sign-up/email`)
  - [x] OAuth options (Google, Apple)
  - [x] Magic link signup option

- [x] **Authentication Logic** (Better Auth)
  - [x] Create auth client (`lib/auth.ts`)
  - [x] Implement sign-in with email/password
  - [x] Implement sign-up function
  - [x] Session tokens stored in HTTP-only cookies (secure)
  - [x] Implement sign-out function
  - [x] Create auth check hook (`useSession`)
  - [x] Redirect to dashboard after successful login
  - [x] Redirect to sign-in if not authenticated
  - [x] Magic link verification (`app/(app)/auth/magic-link/verify/page.tsx`)

- [x] **Error Handling**
  - [x] Display server error messages with Sonner toasts
  - [x] Handle network errors gracefully
  - [x] Show user-friendly error messages
  - [x] Clear errors on input change
  - [x] Handle session expiration (401)

### Phase 3: Dashboard & Navigation (🟡 60% Complete)

- [x] **Dashboard HTML**
  - [x] Create dashboard structure (`app/(app)/dashboard/page.tsx`)
  - [x] Add navigation menu (sidebar with mobile hamburger)
  - [x] Add welcome section with user name
  - [x] Add quick stats cards (device count, measurement count placeholders)
  - [ ] Add recent measurements preview (need API integration)
  - [x] Add quick action buttons

- [x] **Navigation System**
  - [x] Design navigation menu (`components/site-header.tsx`, `components/main-nav.tsx`)
  - [x] Add links to all major sections
  - [x] Highlight active page
  - [x] Make navigation responsive (hamburger menu `components/mobile-nav.tsx`)
  - [x] Add logout button in navigation (account dropdown)
  - [x] Implement smooth page transitions

- [x] **Dashboard Logic**
  - [x] Fetch user profile on load (`hooks/use-user.ts`)
  - [x] Display user name in welcome message
  - [ ] Fetch and display recent measurements (API ready, UI pending)
  - [x] Fetch and display device count
  - [ ] Calculate today's average heart rate (need measurement API integration)
  - [x] Add loading states for data fetching
  - [x] Handle empty state (no devices/measurements)

- [x] **Navigation Styling**
  - [x] Style navigation menu with Tailwind CSS
  - [x] Add hover effects
  - [x] Implement active state styling
  - [x] Make navigation sticky
  - [x] Add icons to menu items (Lucide React)
  - [x] Ensure mobile responsiveness

### Phase 4: Weekly Summary View (❌ 0% Complete - CRITICAL)

**Backend Status:** ✅ API endpoint ready (`GET /api/measurements/weekly/summary`)

**Prerequisites:**
- [ ] Install Chart.js: `npm install chart.js react-chartjs-2`

- [ ] **Weekly Summary Page**
  - [ ] Create `app/(app)/measurements/weekly/page.tsx`
  - [ ] Add page header with date range
  - [ ] Create stats cards container (avg, min, max)
  - [ ] Add chart container for heart rate trend
  - [ ] Add chart container for SpO2 trend
  - [ ] Add day-by-day table/list
  - [ ] Add navigation back to dashboard

- [ ] **Weekly Summary Components**
  - [ ] Create `components/charts/WeeklyChart.tsx` (dual-axis: HR + SpO2)
  - [ ] Create `components/charts/WeeklyStatsCard.tsx` (avg/min/max display)
  - [ ] Create `components/measurements/DayByDayBreakdown.tsx`
  - [ ] Style stats cards with icons
  - [ ] Make cards responsive (stack on mobile)
  - [ ] Style chart containers with proper sizing
  - [ ] Add color coding (green for good, yellow for fair, red for poor)
  - [ ] Add spacing and visual hierarchy

- [ ] **Weekly Summary Logic**
  - [ ] Create `hooks/use-weekly-measurements.ts`
  - [ ] Fetch weekly summary from backend
  - [ ] Parse and display statistics (avg, min, max)
  - [ ] Calculate date range (last 7 days)
  - [ ] Group measurements by day
  - [ ] Handle empty state (no measurements this week)
  - [ ] Add loading spinner
  - [ ] Implement error handling

- [ ] **Chart.js Integration**
  - [ ] Install Chart.js library: `npm install chart.js react-chartjs-2`
  - [ ] Register Chart.js components (CategoryScale, LinearScale, etc.)
  - [ ] Create chart configuration with heart rate color (red)
  - [ ] Create chart configuration with SpO2 color (blue)
  - [ ] Test Chart.js setup with sample data
  - [ ] Prepare data format for charts
  - [ ] Implement responsive chart sizing

### Phase 5: Daily Detailed View with Charts (❌ 0% Complete - CRITICAL)

**Backend Status:** ✅ API endpoint ready (`GET /api/measurements/daily/:date`)

**Prerequisites:**
- [ ] Chart.js must be installed first (see Phase 4)

- [ ] **Daily View Page**
  - [ ] Create `app/(app)/measurements/daily/page.tsx`
  - [ ] Add date picker for selecting day (shadcn DatePicker component)
  - [ ] Add previous/next day navigation buttons
  - [ ] Create chart container for heart rate time-series
  - [ ] Create chart container for SpO2 time-series
  - [ ] Add measurements table/list below charts
  - [ ] Add export data button (optional - CSV download)

- [ ] **Daily View Components**
  - [ ] Create `components/charts/HeartRateChart.tsx` (time-series)
  - [ ] Create `components/charts/SpO2Chart.tsx` (time-series)
  - [ ] Create `components/charts/DailyStatsCard.tsx` (min/max/avg)
  - [ ] Create `components/measurements/MeasurementTable.tsx`
  - [ ] Create `components/measurements/DatePicker.tsx` (with prev/next)
  - [ ] Style date picker and navigation
  - [ ] Style chart containers with proper sizing (responsive heights)
  - [ ] Add time labels and formatting (HH:mm format)
  - [ ] Make charts responsive (mobile-friendly)
  - [ ] Add color coding for measurement quality (green/yellow/red)

- [ ] **Daily View Logic**
  - [ ] Create `hooks/use-daily-measurements.ts`
  - [ ] Implement date selection (default to today)
  - [ ] Fetch daily measurements from backend API
  - [ ] Parse timestamp data (convert to Date objects)
  - [ ] Sort measurements by time (chronological order)
  - [ ] Handle empty state (no measurements for selected day)
  - [ ] Implement previous/next day navigation
  - [ ] Add loading states (skeleton loaders)
  - [ ] Implement error handling

- [ ] **Chart.js Implementation for Daily Charts**
  - [ ] Initialize Chart.js for heart rate (Line chart)
  - [ ] Configure chart options:
    - [ ] Responsive: true
    - [ ] MaintainAspectRatio: false
    - [ ] Tooltips with custom callbacks
    - [ ] Legend positioning
  - [ ] Format time data for x-axis (HH:mm)
  - [ ] Plot heart rate data points (red line)
  - [ ] Add reference line for daily average (dashed line)
  - [ ] Initialize Chart.js for SpO2 (Line chart)
  - [ ] Plot SpO2 data points (blue line)
  - [ ] Customize chart colors:
    - [ ] Heart rate: #ef4444 (red)
    - [ ] SpO2: #3b82f6 (blue)
  - [ ] Add zoom/pan functionality (optional - chart.js-plugin-zoom)
  - [ ] Make charts update dynamically on date change
  - [ ] Add min/max indicators on charts

**Example Chart Setup:**
```javascript
// Initialize Heart Rate Chart
const ctx = document.getElementById('heartRateChart').getContext('2d');
const heartRateChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels, // ['06:00', '06:30', '07:00', ...]
    datasets: [{
      label: 'Heart Rate (bpm)',
      data: heartRateData, // [72, 68, 75, ...]
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 120,
        title: {
          display: true,
          text: 'Heart Rate (bpm)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Heart Rate: ${context.parsed.y} bpm`;
          }
        }
      }
    }
  }
});
```

### Phase 6: Device Management Interface (❌ 0% Complete - CRITICAL)

**Backend Status:** ✅ All API endpoints ready
- `POST /api/devices` - Register device
- `GET /api/devices` - List devices
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/:id/config` - Get configuration
- `PUT /api/devices/:id/config` - Update configuration

- [ ] **Device Management Pages**
  - [ ] Create `app/(app)/devices/page.tsx` - Device list view
  - [ ] Create `app/(app)/devices/new/page.tsx` - Register new device
  - [ ] Create `app/(app)/devices/[id]/page.tsx` - Device details
  - [ ] Add "Add New Device" button on list page
  - [ ] Add navigation back to dashboard

- [ ] **Device Management Components**
  - [ ] Create `components/devices/DeviceList.tsx`
  - [ ] Create `components/devices/DeviceCard.tsx`
  - [ ] Create `components/devices/AddDeviceDialog.tsx`
  - [ ] Create `components/devices/EditDeviceDialog.tsx`
  - [ ] Create `components/devices/DeleteDeviceDialog.tsx`
  - [ ] Create `components/devices/DeviceAPIKeyDisplay.tsx` (one-time display)
  - [ ] Style device cards with icons
  - [ ] Show device status (active, inactive, error)
  - [ ] Add color coding for status
  - [ ] Make modals accessible (keyboard navigation)
  - [ ] Ensure responsive layout

- [ ] **Device List Logic**
  - [ ] Create `hooks/use-devices.ts`
  - [ ] Fetch all devices from backend
  - [ ] Display device name, ID, status
  - [ ] Show last seen timestamp
  - [ ] Display masked API key (show/hide button)
  - [ ] Handle empty state (no devices)
  - [ ] Add loading states
  - [ ] Implement error handling

- [ ] **Add Device Functionality**
  - [ ] Create add device form (deviceId, name)
  - [ ] Validate device ID format
  - [ ] Submit device registration to backend
  - [ ] Display API key to user (ONE-TIME ONLY - security requirement)
  - [ ] Add copy-to-clipboard for API key
  - [ ] Update device list after adding
  - [ ] Show success message with toast

- [ ] **Edit Device Configuration**
  - [ ] Open edit modal with current config
  - [ ] Allow editing measurement frequency (dropdown: 15min, 30min, 1hr, 2hr, 4hr)
  - [ ] Allow editing active time range (time pickers: default 6:00 AM - 10:00 PM)
  - [ ] Validate inputs (frequency 15 min - 4 hours per spec)
  - [ ] Submit configuration update to backend
  - [ ] Update device list with new config
  - [ ] Show success message

- [ ] **Delete Device Functionality**
  - [ ] Show confirmation modal
  - [ ] Explain consequences (all measurement data will be deleted)
  - [ ] Require password confirmation for security
  - [ ] Submit delete request to backend
  - [ ] Remove device from list
  - [ ] Show success message
  - [ ] Redirect if on device detail page

### Phase 7: Account Settings Page (✅ 100% Complete)

- [x] **Account Settings Pages**
  - [x] Create `app/(app)/settings/page.tsx` - Settings overview
  - [x] Create `app/(app)/settings/profile/page.tsx` - Profile settings
  - [x] Create `app/(app)/settings/account/page.tsx` - Account settings
  - [x] Create `app/(app)/settings/security/page.tsx` - Security settings
  - [x] Create `app/(app)/settings/appearance/page.tsx` - Appearance settings
  - [ ] Add physician selection (ECE 513 requirement - pending)

- [x] **Account Settings Styling**
  - [x] Style profile card with shadcn/ui components
  - [x] Style form sections with proper spacing
  - [x] Add visual separation between sections
  - [x] Make responsive for mobile
  - [x] Add icons for visual clarity (Lucide React)
  - [x] Implement dark mode support

- [x] **Profile Management Logic**
  - [x] Fetch user profile (`hooks/use-user.ts`)
  - [x] Display current name and email
  - [x] Allow editing name and profile picture
  - [x] Email editing disabled (Better Auth handles this)
  - [x] Submit profile updates to backend
  - [x] Show success message with toast notifications

- [x] **Change Password Functionality**
  - [x] Create change password form (current, new, confirm)
  - [x] Validate current password
  - [x] Validate new password strength (with visual indicator)
  - [x] Validate password match
  - [x] Submit to backend via Better Auth
  - [x] Show success message
  - [x] Clear form after success

- [x] **Delete Account Functionality**
  - [x] Show warning modal (AlertDialog)
  - [x] Require password confirmation
  - [x] Explain data deletion consequences
  - [x] Submit delete request to backend
  - [x] Clear session cookies
  - [x] Redirect to account-deleted confirmation page
  - [x] Show confirmation message

### Phase 8: Responsive Design (🟡 60% Complete)

- [x] **Mobile Optimization (320px - 767px)**
  - [x] Stack layout vertically (Tailwind CSS grid system)
  - [x] Make navigation hamburger menu (`components/mobile-nav.tsx`)
  - [x] Adjust font sizes for readability (Tailwind responsive classes)
  - [x] Make buttons larger (touch-friendly, min-h-11)
  - [ ] Simplify charts (charts not created yet)
  - [ ] Test on real mobile devices (basic testing done)
  - [x] Ensure forms are easy to fill on mobile (React Hook Form)
  - [ ] Add swipe gestures (optional enhancement)

- [x] **Tablet Optimization (768px - 1023px)**
  - [x] Use 2-column layouts where appropriate (Tailwind md: breakpoint)
  - [ ] Adjust chart sizes (charts not created yet)
  - [x] Make navigation visible but compact
  - [ ] Test landscape and portrait orientations (needs testing)
  - [x] Ensure touch targets are adequate (44px minimum)

- [x] **Desktop Optimization (1024px+)**
  - [x] Use multi-column layouts (Tailwind lg: breakpoint)
  - [x] Show full navigation sidebar
  - [ ] Expand charts to full width (charts not created yet)
  - [x] Add hover states for interactive elements
  - [x] Optimize for mouse and keyboard navigation (keyboard shortcuts implemented)

- [x] **Cross-Browser Testing (Basic)**
  - [x] Test on Chrome (latest) - Primary development browser
  - [x] Test on Firefox (latest) - Basic testing
  - [x] Test on Safari (latest) - Basic testing
  - [ ] Test on Edge (latest) - Needs testing
  - [ ] Fix browser-specific issues (comprehensive testing needed)
  - [x] CSS autoprefixer included in build (PostCSS)

- [x] **Performance Optimization (Basic)**
  - [x] Next.js automatic code splitting
  - [x] Image optimization with Next.js Image component
  - [x] Use SVG icons (Lucide React)
  - [ ] Lazy load charts (charts not created yet)
  - [x] Cache API responses (TanStack Query with staleTime)
  - [x] Minify CSS and JavaScript (Next.js production build)

### Phase 9: Physician Portal UI (ECE 513 Only) (❌ 0% Complete - REQUIRED FOR 513)

**Backend Status:** 🟡 Partial - User model supports `role` and `physicianId`, need physician-specific endpoints

**Required Backend Additions:**
- [ ] `POST /api/auth/register/physician` - Physician registration endpoint
- [ ] `GET /api/physician/patients` - List all assigned patients
- [ ] `GET /api/physician/patients/:id` - Get patient details
- [ ] `GET /api/physician/patients/:id/weekly` - Patient weekly summary
- [ ] `GET /api/physician/patients/:id/daily/:date` - Patient daily measurements
- [ ] `PUT /api/physician/patients/:id/device-config` - Update patient device configuration

**Frontend Implementation:**

- [ ] **Physician Registration Page**
  - [ ] Create `app/(app)/physician/register/page.tsx`
  - [ ] Add physician-specific fields (specialty, medical license number, NPI)
  - [ ] Style registration form with shadcn/ui
  - [ ] Integrate with backend physician registration endpoint
  - [ ] Redirect to physician dashboard after registration
  - [ ] Add verification workflow (if required)

- [ ] **Physician Dashboard**
  - [ ] Create `app/(app)/physician/dashboard/page.tsx`
  - [ ] Create `app/(app)/physician/patients/page.tsx`
  - [ ] Create `components/physician/PatientList.tsx`
  - [ ] Create `components/physician/PatientCard.tsx`
  - [ ] Display list of all assigned patients
  - [ ] Show patient name, email, and photo
  - [ ] Display 7-day summary for each patient (avg, min, max HR + SpO2)
  - [ ] Add "View Details" button for each patient
  - [ ] Style patient cards with health status indicators
  - [ ] Implement search/filter by patient name
  - [ ] Add pagination for large patient lists

- [ ] **Patient Summary View (Physician)**
  - [ ] Create `app/(app)/physician/patients/[id]/page.tsx`
  - [ ] Create `app/(app)/physician/patients/[id]/weekly/page.tsx`
  - [ ] Display patient weekly summary
  - [ ] Show weekly statistics (avg, min, max)
  - [ ] Reuse WeeklyChart component from Phase 4
  - [ ] Add link to daily detailed view
  - [ ] Add device configuration controls (see below)
  - [ ] Show patient demographic info

- [ ] **Patient Daily View (Physician)**
  - [ ] Create `app/(app)/physician/patients/[id]/daily/page.tsx`
  - [ ] Reuse HeartRateChart and SpO2Chart components
  - [ ] Fetch patient daily data via physician API
  - [ ] Display same charts and measurements as user view
  - [ ] Add date navigation (previous/next day)
  - [ ] Ensure physician can view but patient owns data
  - [ ] Add notes/annotations feature (optional)

- [ ] **Device Configuration (Physician)**
  - [ ] Create `components/physician/ConfigControls.tsx`
  - [ ] Add edit configuration button in patient summary
  - [ ] Allow physician to adjust measurement frequency (dropdown)
  - [ ] Allow physician to adjust active time range (time pickers)
  - [ ] Submit configuration changes to backend
  - [ ] Show confirmation message
  - [ ] Log configuration changes (audit trail)
  - [ ] Update patient's device configuration in real-time

- [ ] **Physician Authentication & Authorization**
  - [ ] Use existing Better Auth with role-based access
  - [ ] Create `components/physician/PhysicianGuard.tsx` (role check)
  - [ ] Verify physician role from session
  - [ ] Restrict access to physician pages (middleware or guard)
  - [ ] Add physician role badge in navigation
  - [ ] Implement role-based redirect after login

- [ ] **Patient-Physician Association**
  - [ ] Add physician selector in user settings page (`app/(app)/settings/profile/page.tsx`)
  - [ ] Allow users to select their physician from dropdown
  - [ ] Update user profile with `physicianId`
  - [ ] Display current physician in user profile
  - [ ] Allow users to change physician
  - [ ] Notify physician when new patient assigned (optional)

### Phase 10: AI Chat Interface (Extra Credit)

- [ ] **Chat UI Design**
  - [ ] Create ai-chat.html
  - [ ] Design chat container with message area
  - [ ] Add message input field and send button
  - [ ] Style user messages vs AI messages
  - [ ] Add typing indicator
  - [ ] Create scrollable chat history
  - [ ] Add suggested questions (prompts)

- [ ] **Chat Styling**
  - [ ] Use chat bubble design
  - [ ] Differentiate user (right, blue) vs AI (left, gray)
  - [ ] Add timestamps to messages
  - [ ] Style suggested question buttons
  - [ ] Add medical disclaimer at top
  - [ ] Make chat responsive

- [ ] **Chat Logic**
  - [ ] Implement send message function
  - [ ] POST question to `/api/ai/chat`
  - [ ] Display user message immediately
  - [ ] Show typing indicator
  - [ ] Receive and display AI response
  - [ ] Append messages to chat history
  - [ ] Scroll to bottom on new message
  - [ ] Store chat history in memory (or localStorage)

- [ ] **Suggested Questions**
  - [ ] "What was my average heart rate yesterday?"
  - [ ] "Show me my heart rate trends this week."
  - [ ] "Do I have any concerning measurements?"
  - [ ] "How has my SpO2 been recently?"
  - [ ] Click to auto-fill input field

- [ ] **Error Handling**
  - [ ] Handle API errors gracefully
  - [ ] Show error message in chat
  - [ ] Handle LLM timeout
  - [ ] Add retry functionality
  - [ ] Display medical disclaimer on every response

**Example Chat API Call:**
```javascript
async function sendChatMessage(question) {
  const token = localStorage.getItem('jwt_token');

  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();
  return data.data.response;
}
```

### Phase 11: Index.html and References.html (🟡 50% Complete - PROJECT REQUIREMENT)

**Project Spec Requirements:**
- ✅ "The web application should have an index.html page to introduce your team and project"
- ❌ "The web application should have the reference.html page to list your third-party APIs, libraries, and code"

- [x] **Landing Page (index.html / root page)**
  - [x] Create `app/(app)/page.tsx` landing page
  - [x] Add hero section with tagline
  - [ ] **REQUIRED:** Add team member information
    - [ ] Team member names
    - [ ] Team member emails
    - [ ] Team member photos
    - [ ] Roles/contributions
  - [ ] **REQUIRED:** Project description
    - [ ] Explain Heart Track (PulseConnect) purpose
    - [ ] Describe key features
    - [ ] Add screenshots/mockups of app
    - [ ] Include demo video (optional)
  - [x] Add "Get Started" button (links to signup)
  - [x] Add "Login" button
  - [x] Add footer with links
  - [x] Make responsive design

- [ ] **References Page (REQUIRED)**
  - [ ] Create `app/(app)/references/page.tsx` or `reference.html`
  - [ ] **List all third-party APIs:**
    - [ ] Better Auth API
    - [ ] Backend REST API (api-server)
    - [ ] Any other external APIs used
  - [ ] **List all libraries and frameworks:**
    - [ ] Next.js 15.2.4
    - [ ] React 19
    - [ ] TypeScript
    - [ ] Tailwind CSS v4
    - [ ] Chart.js (when installed)
    - [ ] shadcn/ui + Radix UI
    - [ ] TanStack Query
    - [ ] All other npm packages (see package.json)
  - [ ] **List all code sources:**
    - [ ] Course examples used
    - [ ] Stack Overflow snippets
    - [ ] Tutorial code
    - [ ] GitHub repositories referenced
  - [ ] Link to documentation sources:
    - [ ] Chart.js documentation
    - [ ] Next.js documentation
    - [ ] Better Auth documentation
  - [ ] Credit icon sources (Lucide React icons)
  - [ ] Add bibliography if applicable
  - [ ] Link to project repository (GitHub/GitLab)

- [ ] **Help/FAQ Page (Optional)**
  - [ ] Create `app/(app)/help/page.tsx`
  - [ ] Answer common questions
  - [ ] Provide troubleshooting tips
  - [ ] Explain how to use each feature
  - [ ] Add contact information
  - [ ] Link to documentation

### Phase 12: Testing & Browser Compatibility (🟡 20% Complete)

**Current Status:**
- ✅ Basic authentication flow tested
- ✅ Chrome desktop testing done
- ❌ Comprehensive test suite not created
- ❌ E2E testing not implemented

- [x] **Functional Testing (Basic)**
  - [x] Test login/signup flow (working)
  - [x] Test session management (working)
  - [ ] Test navigation between pages (need to test all routes)
  - [ ] Test dashboard data loading (need real data)
  - [ ] Test weekly summary display (not implemented yet)
  - [ ] Test daily view with date selection (not implemented yet)
  - [ ] Test chart rendering (not implemented yet)
  - [ ] Test device management (add, edit, delete) (not implemented yet)
  - [x] Test account settings updates (working)
  - [x] Test logout functionality (working)

- [ ] **API Integration Testing**
  - [x] Verify auth endpoints work
  - [ ] Test device endpoints from frontend
  - [ ] Test measurement endpoints from frontend
  - [ ] Test error responses (401, 404, 500)
  - [x] Test loading states (implemented with TanStack Query)
  - [ ] Test empty states (no data)
  - [x] Test session expiration handling (implemented)
  - [ ] Test network failure scenarios

- [x] **UI/UX Testing (Basic)**
  - [x] Test on different screen sizes (basic)
  - [ ] Test on real touch devices
  - [x] Verify buttons and links work (basic)
  - [x] Check form validation (React Hook Form + Zod)
  - [x] Test keyboard navigation (basic)
  - [ ] Verify accessibility (screen readers) - needs comprehensive testing
  - [ ] Check color contrast ratios (WCAG compliance)

- [ ] **Chart Testing (Not Started)**
  - [ ] Test charts with varying data amounts
  - [ ] Test empty chart state (no data)
  - [ ] Verify chart responsiveness
  - [ ] Test chart tooltips and interactions
  - [ ] Verify correct data representation
  - [ ] Test chart performance with large datasets

- [x] **Cross-Browser Testing (Basic)**
  - [x] Chrome (desktop) - Primary development browser
  - [ ] Chrome (mobile) - Needs testing
  - [x] Firefox (desktop) - Basic testing done
  - [ ] Firefox (mobile) - Needs testing
  - [x] Safari (desktop) - Basic testing done
  - [ ] Safari (mobile/iOS) - Needs testing
  - [ ] Edge (desktop) - Needs testing
  - [ ] Fix any browser-specific bugs

- [ ] **Performance Testing**
  - [ ] Measure page load times (Lighthouse)
  - [ ] Test with large datasets (100+ measurements)
  - [ ] Check JavaScript execution time
  - [ ] Optimize slow operations
  - [ ] Test on slower network connections (3G simulation)
  - [x] Verify Next.js code splitting works
  - [x] Check bundle size (build analysis)

- [ ] **End-to-End Testing (Recommended but Optional)**
  - [ ] Set up Playwright or Cypress
  - [ ] Write E2E tests for user flows
  - [ ] Test device registration flow
  - [ ] Test measurement viewing flow
  - [ ] Test physician portal flow (ECE 513)
  - [ ] Automate testing in CI/CD

### Phase 13: Documentation (🟡 70% Complete)

**Current Status:**
- ✅ Excellent code documentation in `/docs` folder
- ✅ README with setup instructions
- ✅ CLAUDE.md development guide
- ❌ User guide missing
- ❌ Deployment documentation incomplete

- [x] **Code Documentation**
  - [x] Comprehensive documentation in `/docs` folder:
    - [x] `admin-integration.md` - Admin portal documentation
    - [x] `authentication-security-audit.md` - Auth security details
    - [x] `SECURITY.md` - Security best practices
    - [x] `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Implementation details
    - [x] `USER_MANAGEMENT_FRONTEND.md` - User management guide
  - [x] Document API service module (`lib/api/client.ts` well documented)
  - [x] Explain authentication flow (Better Auth integration documented)
  - [ ] Document chart initialization (not implemented yet)
  - [x] Add inline comments for complex logic (done with JSDoc)
  - [x] CLAUDE.md development guide for AI assistance

- [ ] **User Guide (Missing - REQUIRED FOR SUBMISSION)**
  - [ ] Create `docs/USER_GUIDE.md`
  - [ ] Write step-by-step user manual:
    - [ ] How to register and login
    - [ ] How to add a device
    - [ ] How to view measurements (weekly and daily)
    - [ ] How to configure device settings
    - [ ] How to interpret charts
    - [ ] How to manage account settings
    - [ ] How to delete account
  - [ ] Add screenshots for each feature
  - [ ] Include troubleshooting section
  - [ ] **ECE 513:** Document physician portal usage

- [x] **Developer Documentation (Mostly Complete)**
  - [x] Document file structure (in README)
  - [x] Explain project architecture (in README and CLAUDE.md)
  - [x] Document API integration (in README and examples)
  - [x] Provide setup instructions (in README)
  - [x] Document build process (in README)
  - [x] Environment variable documentation (in README and CLAUDE.md)
  - [x] Component usage examples (in README)
  - [ ] Add API endpoint documentation table

- [ ] **Deployment Documentation (Partial)**
  - [x] Document hosting options (Vercel, Netlify, Docker)
  - [x] Explain environment configuration
  - [ ] Document CORS setup (needs details)
  - [ ] Provide deployment checklist
  - [ ] **ECE 513:** Document HTTPS/SSL setup
  - [ ] Document production build steps
  - [ ] Add monitoring and logging setup
  - [ ] Document backup and recovery

- [ ] **Project Documentation (REQUIRED FOR SUBMISSION)**
  - [ ] **Project Description Section** (2 points)
    - [ ] Backend implementation narrative
    - [ ] Frontend implementation narrative
    - [ ] Embedded device implementation narrative
    - [ ] **ECE 513:** LLM Health AI Assistant section (if implemented)
  - [ ] **File Description Section** (1 point)
    - [ ] List all public files with descriptions
    - [ ] List all route files with descriptions
    - [ ] List all model files with descriptions
    - [ ] List all JavaScript/TypeScript files with descriptions
    - [ ] Use full sentences/short paragraphs
  - [ ] **Results Section** (0.5 points)
    - [ ] Screenshots of website functionalities
    - [ ] Screenshots of each HTML component
    - [ ] Device screenshots (add/remove)
    - [ ] Visualization screenshots (charts)
    - [ ] **ECE 513:** Physician portal screenshots
    - [ ] Diagrams showing results
    - [ ] Tables with measurement data
  - [ ] **Lessons Learned Section** (0.5 points)
    - [ ] At least 5 bullet points in full sentences
    - [ ] What was learned from implementation
  - [ ] **Challenges Section** (0.5 points)
    - [ ] At least 5 bullet points in full sentences
    - [ ] Challenges faced during implementation
    - [ ] How challenges were resolved
  - [ ] **Team Contribution Table** (0.25 points)
    - [ ] Table with team members (rows)
    - [ ] Components: frontend, backend, embedded, docs (columns)
    - [ ] Percentage contribution out of 100 for each
  - [ ] **Reference Section** (0.25 points)
    - [ ] Properly cite all resources used
    - [ ] List all third-party libraries
    - [ ] List all tutorials followed
    - [ ] List all code sources

### Phase 14: Video Submission Requirements (❌ Not Started - REQUIRED)

**Project Spec Requirements:**
- **Pitch Video:** 5 minutes (for potential investors)
- **Demo Video:** 15-20 minutes (20 minutes maximum)

- [ ] **Pitch Video (5 minutes) - 3 points**
  - [ ] Plan video structure (storyboard)
  - [ ] Target audience: Angel investors, VCs, Kickstarter
  - [ ] **Content Requirements:**
    - [ ] Introduce the problem (heart rate monitoring needs)
    - [ ] Present the solution (PulseConnect system)
    - [ ] Explain key features (IoT device + web app + physician portal)
    - [ ] Show market opportunity
    - [ ] Demonstrate prototype (quick demo)
    - [ ] Explain business model (if applicable)
    - [ ] Call to action
  - [ ] Record video (use screen recording + webcam)
  - [ ] Edit video (add transitions, titles, music)
  - [ ] Upload to YouTube or host on server
  - [ ] Add video link to README
  - [ ] **Examples:** https://kickstarterguide.com/2012/06/13/examples-of-great-pitch-videos/

- [ ] **Demo Video (15-20 minutes max) - 1 point**
  - [ ] Plan video structure:
    - [ ] Part 1: User Experience (7-10 minutes)
    - [ ] Part 2: Code Implementation (7-10 minutes)
  - [ ] **Part 1: User Experience Demo**
    - [ ] Show landing page (index.html with team info)
    - [ ] Demonstrate user registration and login
    - [ ] Show device registration process
    - [ ] Display API key (one-time display)
    - [ ] Show dashboard with quick stats
    - [ ] Demonstrate weekly summary view (charts)
    - [ ] Demonstrate daily detailed view (charts)
    - [ ] Show device configuration (time range, frequency)
    - [ ] Demonstrate account settings
    - [ ] Show references page
    - [ ] **ECE 513:** Show physician portal features
    - [ ] **Extra Credit:** Show AI chat interface
  - [ ] **Part 2: Code Implementation Discussion**
    - [ ] Show project file structure
    - [ ] Explain Next.js App Router architecture
    - [ ] Show authentication implementation (Better Auth)
    - [ ] Show API client implementation (`lib/api/client.ts`)
    - [ ] Show device management code (components)
    - [ ] Show chart implementation (Chart.js setup)
    - [ ] Explain state management (TanStack Query)
    - [ ] Show responsive design techniques (Tailwind CSS)
    - [ ] Discuss security measures
    - [ ] **ECE 513:** Show physician portal code
  - [ ] **Address Each Requirement:**
    - [ ] Mention how each project requirement was met
    - [ ] Show responsive design on different screen sizes
    - [ ] Demonstrate error handling
    - [ ] Show loading states
    - [ ] Explain API integration
  - [ ] Record screen with narration
  - [ ] Edit video (keep under 20 minutes)
  - [ ] Upload to YouTube or host on server
  - [ ] Add video link to README
  - [ ] Ensure video is publicly accessible

- [ ] **Video Hosting**
  - [ ] Option 1: Upload to YouTube (unlisted or public)
  - [ ] Option 2: Host on your server
  - [ ] Option 3: Use Vimeo or other video platform
  - [ ] Ensure videos remain accessible until at least Dec 19
  - [ ] Test video links work from different devices

- [ ] **Video Quality Checklist**
  - [ ] Audio is clear and audible
  - [ ] Screen recording is high resolution (1080p minimum)
  - [ ] No background noise or distractions
  - [ ] Cursor movements are not too fast
  - [ ] Text on screen is readable
  - [ ] Video has proper pacing (not too fast or slow)
  - [ ] Transitions between sections are smooth

### Phase 15: Final Submission Checklist (❌ Not Started - REQUIRED)

**Submission Deadline:** Monday, December 15, 11:59 PM
**Late Submission:** Wednesday, December 17, 11:59 PM (-10 points)
**Server Must Be Accessible Until:** December 19

- [ ] **Git Repository Preparation**
  - [ ] Clean repo (remove `node_modules/`)
  - [ ] Add `.gitignore` for Next.js project
  - [ ] Well-described `README.md` in Markdown
  - [ ] Add `.env.example` with all required variables
  - [ ] Ensure all code is committed
  - [ ] Tag release with version number
  - [ ] Push to GitHub or GitLab
  - [ ] Verify repo is accessible

- [ ] **README Requirements**
  - [ ] Links to your server (live URL)
  - [ ] Link to pitch video
  - [ ] Link to demo video
  - [ ] Login credentials for existing user account with recent data
  - [ ] **ECE 513:** Login credentials for physician account
  - [ ] Setup instructions
  - [ ] Environment variable documentation
  - [ ] Dependencies list

- [ ] **Code Archive Preparation**
  - [ ] Create single archive (ZIP or TAR.GZ)
  - [ ] Include device code (IoT firmware)
  - [ ] Include server code (api-server)
  - [ ] Include front-end code (web-app)
  - [ ] Include README.md
  - [ ] Include documentation files
  - [ ] **Do NOT include:** `node_modules/`, `.env` files, build artifacts
  - [ ] Test that archive extracts correctly

- [ ] **Submit to D2L**
  - [ ] Upload code archive to D2L assignment dropbox
  - [ ] Verify submission was successful
  - [ ] Submit before December 15, 11:59 PM (or Dec 17 with penalty)

- [ ] **Server Deployment**
  - [ ] Deploy backend API to hosting service
  - [ ] Deploy frontend to hosting service
  - [ ] Configure environment variables
  - [ ] **ECE 513:** Configure HTTPS/SSL
  - [ ] Test server is publicly accessible
  - [ ] Verify all features work in production
  - [ ] Keep server running until at least December 19

- [ ] **Test Accounts Setup**
  - [ ] Create test user account with recent measurement data
  - [ ] Add at least one device to test account
  - [ ] Generate sample measurements (multiple days)
  - [ ] **ECE 513:** Create test physician account
  - [ ] **ECE 513:** Associate test user with physician
  - [ ] Document credentials in README

- [ ] **Final Testing Before Submission**
  - [ ] Test all features work from live server
  - [ ] Test with provided credentials
  - [ ] Verify videos are accessible
  - [ ] Check all links in README work
  - [ ] Test responsive design on mobile
  - [ ] Verify all requirements are met (use grading rubric)

- [ ] **Documentation for Submission (5 points total)**
  - [ ] Complete Project Description section (2 points)
  - [ ] Complete File Description section (1 point)
  - [ ] Complete Results section with screenshots (0.5 points)
  - [ ] Complete Lessons Learned section (0.5 points)
  - [ ] Complete Challenges section (0.5 points)
  - [ ] Complete Team Contribution table (0.25 points)
  - [ ] Complete Reference section (0.25 points)

## File Structure

```
web/
├── README.md                          # This file
├── package.json                       # Dependencies and scripts
├── next.config.js                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── .env.local                         # Environment variables (not committed)
├── .gitignore                         # Git ignore file
│
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Landing page
│   ├── globals.css                    # Global styles
│   │
│   ├── (auth)/                        # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── signup/
│   │       └── page.tsx              # Registration page
│   │
│   ├── (dashboard)/                   # Dashboard route group (protected)
│   │   ├── layout.tsx                # Dashboard layout with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   ├── weekly/
│   │   │   └── page.tsx              # Weekly summary view
│   │   ├── daily/
│   │   │   └── page.tsx              # Daily detailed view
│   │   ├── devices/
│   │   │   └── page.tsx              # Device management
│   │   └── settings/
│   │       └── page.tsx              # Account settings
│   │
│   ├── (physician)/                   # Physician portal (ECE 513)
│   │   ├── layout.tsx                # Physician layout
│   │   ├── physician/
│   │   │   └── page.tsx              # Physician dashboard
│   │   └── patient/
│   │       ├── [id]/
│   │       │   ├── page.tsx          # Patient summary
│   │       │   └── daily/
│   │       │       └── page.tsx      # Patient daily view
│   │
│   ├── chat/                          # AI chat interface (Extra Credit)
│   │   └── page.tsx
│   │
│   └── api/                           # Next.js API routes (optional proxy)
│       └── health/
│           └── route.ts              # Health check endpoint
│
├── components/                        # React components
│   ├── ui/                           # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── charts/                       # Chart components
│   │   ├── HeartRateChart.tsx
│   │   ├── SpO2Chart.tsx
│   │   └── WeeklyChart.tsx
│   ├── dashboard/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatsCard.tsx
│   ├── devices/
│   │   ├── DeviceList.tsx
│   │   ├── DeviceCard.tsx
│   │   └── AddDeviceModal.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── SignupForm.tsx
│
├── lib/                              # Utility libraries
│   ├── api.ts                        # API client & service layer
│   ├── auth.ts                       # Authentication utilities
│   ├── config.ts                     # App configuration
│   ├── constants.ts                  # Constants
│   ├── utils.ts                      # Helper functions
│   └── validators.ts                 # Form validation
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                    # Authentication hook
│   ├── useDevices.ts                 # Device management hook
│   ├── useMeasurements.ts            # Measurements data hook
│   └── useChart.ts                   # Chart utilities hook
│
├── contexts/                         # React contexts
│   ├── AuthContext.tsx               # Auth state provider
│   ├── DeviceContext.tsx             # Device state provider
│   └── ThemeContext.tsx              # Theme provider (optional)
│
├── types/                            # TypeScript type definitions
│   ├── index.ts                      # Main types export
│   ├── api.ts                        # API response types
│   ├── user.ts                       # User types
│   ├── device.ts                     # Device types
│   └── measurement.ts                # Measurement types
│
├── public/                           # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── heart-icon.svg
│   │   ├── spo2-icon.svg
│   │   └── device-icon.svg
│   └── fonts/                        # Custom fonts (if any)
│
└── docs/                             # Documentation
    ├── user-guide.md
    ├── developer-guide.md
    ├── api-integration.md
    └── deployment.md
```

## Setup Instructions

### Prerequisites

1. **Node.js & npm**
   - Node.js 18.x or later
   - npm 9.x or later (or yarn/pnpm)

2. **Backend API**
   - Backend server must be running (Project 2)
   - API endpoint URL configured

3. **Development Tools (Recommended)**
   - VS Code with ESLint and Prettier extensions
   - React Developer Tools browser extension

### Local Development

1. **Clone Repository & Navigate to Web Directory**
   ```bash
   cd web/
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**
   - Create a `.env.local` file in the web directory
   - Set the backend API URL
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   - Application will run at `http://localhost:3000`
   - Hot reload enabled for instant updates

5. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

### Deployment

#### Option 1: Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web/
vercel

# Or connect via Vercel dashboard:
# 1. Sign up at https://vercel.com
# 2. Import your Git repository
# 3. Vercel auto-detects Next.js
# 4. Configure environment variables
# 5. Deploy automatically
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
cd web/
npm run build
netlify deploy --prod

# Or via Netlify dashboard:
# 1. Sign up at https://www.netlify.com
# 2. Connect your GitHub repository
# 3. Build command: npm run build
# 4. Publish directory: .next
# 5. Configure environment variables
```

#### Option 3: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t heart-track-web .
docker run -p 3000:3000 heart-track-web
```

#### Option 4: Traditional Node.js Hosting
1. Build the application: `npm run build`
2. Upload files to server
3. Install Node.js on server
4. Run `npm install --production`
5. Start with `npm run start`
6. Use PM2 or similar for process management

### Configuration

Update `lib/config.ts` with your settings:

```typescript
// lib/config.ts

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

// Chart Configuration
export const CHART_COLORS = {
  heartRate: '#ef4444',
  spO2: '#3b82f6',
  background: 'rgba(239, 68, 68, 0.1)',
  backgroundSpO2: 'rgba(59, 130, 246, 0.1)',
} as const;

// Pagination
export const ITEMS_PER_PAGE = 10;
export const MAX_CHART_POINTS = 100;

// Date Format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Authentication
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  devices: {
    list: '/api/devices',
    add: '/api/devices',
    update: (id: string) => `/api/devices/${id}`,
    delete: (id: string) => `/api/devices/${id}`,
  },
  measurements: {
    daily: (date: string) => `/api/measurements/daily/${date}`,
    weekly: '/api/measurements/weekly/summary',
    recent: '/api/measurements/recent',
  },
  physician: {
    patients: '/api/physician/patients',
    patient: (id: string) => `/api/physician/patients/${id}`,
  },
  chat: '/api/ai/chat',
} as const;
```

## API Integration

### API Client Setup

```typescript
// lib/api.ts

import { API_BASE_URL, TOKEN_KEY } from './config';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### Authentication with Context

```typescript
// contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { TOKEN_KEY } from '@/lib/config';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'physician';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get<{ data: { user: User } }>('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ data: { token: string; user: User } }>(
      '/api/auth/login',
      { email, password }
    );

    localStorage.setItem(TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Using the Auth Hook

```typescript
// app/(auth)/login/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Custom Hook for Data Fetching

```typescript
// hooks/useMeasurements.ts

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Measurement {
  id: string;
  heartRate: number;
  spO2: number;
  timestamp: string;
}

export function useDailyMeasurements(date: string) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ data: { measurements: Measurement[] } }>(
          `/api/measurements/daily/${date}`
        );
        setMeasurements(response.data.measurements);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurements();
  }, [date]);

  return { measurements, isLoading, error };
}
```

## UI/UX Design

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        // Health Metrics
        heartRate: '#ef4444',
        spO2: '#3b82f6',
        // Status Colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.1)',
        DEFAULT: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles with Tailwind

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary;
  }
}
```

### Responsive Design with Tailwind

```typescript
// Example component with Tailwind responsive classes

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="card">
      {/* Mobile: full width, Tablet: 2 columns, Desktop: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{icon}</div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Tailwind Breakpoints
- **sm**: 640px (small tablets)
- **md**: 768px (tablets)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large desktops)
- **2xl**: 1536px (extra large screens)

### Wireframes

#### Mobile Layout
```
┌─────────────────────┐
│  ☰  Heart Track     │  Header with hamburger menu
├─────────────────────┤
│                     │
│   Welcome, John!    │  Dashboard
│                     │
│  ┌───────────────┐  │
│  │ Avg HR: 72    │  │  Stat cards (stacked)
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Min HR: 58    │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Max HR: 105   │  │
│  └───────────────┘  │
│                     │
│  Recent Readings:   │
│  ├ 14:30 - 72 bpm  │
│  ├ 14:00 - 68 bpm  │
│  └ 13:30 - 75 bpm  │
│                     │
└─────────────────────┘
```

#### Tablet Layout
```
┌──────────────────────────────────────┐
│  ☰  Heart Track              Logout  │
├──────────────────────────────────────┤
│                                      │
│         Welcome, John!               │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Avg HR:  │  │ Min HR:  │         │  2-column cards
│  │   72     │  │   58     │         │
│  └──────────┘  └──────────┘         │
│                                      │
│  ┌────────────────────────┐         │
│  │   Heart Rate Chart     │         │  Full-width chart
│  │   (Canvas)             │         │
│  └────────────────────────┘         │
│                                      │
└──────────────────────────────────────┘
```

#### Desktop Layout
```
┌──────────────────────────────────────────────────────────┐
│  Heart Track                              User | Logout   │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Dashboard │         Welcome, John Doe!                  │
│  Weekly    │                                             │
│  Daily     │  ┌──────┐  ┌──────┐  ┌──────┐             │
│  Devices   │  │ Avg  │  │ Min  │  │ Max  │             │
│  Settings  │  │  72  │  │  58  │  │ 105  │             │
│  AI Chat   │  └──────┘  └──────┘  └──────┘             │
│            │                                             │
│            │  ┌────────────────────────────────┐        │
│            │  │   Heart Rate Trend (Chart.js)   │        │
│            │  │                                 │        │
│            │  │   [Line chart visualization]    │        │
│            │  │                                 │        │
│            │  └────────────────────────────────┘        │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

## Chart Implementation

### Setting Up Chart.js in Next.js

**Install Chart.js and React wrapper:**
```bash
npm install chart.js react-chartjs-2
```

### Heart Rate Chart Component

```typescript
// components/charts/HeartRateChart.tsx

'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { CHART_COLORS } from '@/lib/config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Measurement {
  heartRate: number;
  timestamp: string;
}

interface HeartRateChartProps {
  measurements: Measurement[];
}

export function HeartRateChart({ measurements }: HeartRateChartProps) {
  const chartData = useMemo(() => {
    const timeLabels = measurements.map((m) =>
      new Date(m.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );
    const heartRateData = measurements.map((m) => m.heartRate);

    return {
      labels: timeLabels,
      datasets: [
        {
          label: 'Heart Rate (bpm)',
          data: heartRateData,
          borderColor: CHART_COLORS.heartRate,
          backgroundColor: CHART_COLORS.background,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: CHART_COLORS.heartRate,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [measurements]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `Heart Rate: ${context.parsed.y} bpm`,
        },
      },
      title: {
        display: true,
        text: 'Heart Rate Throughout the Day',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 120,
        ticks: {
          stepSize: 10,
        },
        title: {
          display: true,
          text: 'Heart Rate (bpm)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-white rounded-lg shadow-md p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}
```

### Weekly Summary Chart Component

```typescript
// components/charts/WeeklyChart.tsx

'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { CHART_COLORS } from '@/lib/config';

interface WeeklySummary {
  day: string;
  avgHeartRate: number;
  avgSpO2: number;
}

interface WeeklyChartProps {
  summaryData: WeeklySummary[];
}

export function WeeklyChart({ summaryData }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    const labels = summaryData.map((d) => d.day);
    const heartRates = summaryData.map((d) => d.avgHeartRate);
    const spO2Values = summaryData.map((d) => d.avgSpO2);

    return {
      labels,
      datasets: [
        {
          label: 'Avg Heart Rate (bpm)',
          data: heartRates,
          borderColor: CHART_COLORS.heartRate,
          backgroundColor: CHART_COLORS.background,
          yAxisID: 'y-hr',
          tension: 0.3,
        },
        {
          label: 'Avg SpO2 (%)',
          data: spO2Values,
          borderColor: CHART_COLORS.spO2,
          backgroundColor: CHART_COLORS.backgroundSpO2,
          yAxisID: 'y-spo2',
          tension: 0.3,
        },
      ],
    };
  }, [summaryData]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Average Trends',
      },
    },
    scales: {
      'y-hr': {
        type: 'linear',
        position: 'left',
        min: 50,
        max: 120,
        title: {
          display: true,
          text: 'Heart Rate (bpm)',
        },
      },
      'y-spo2': {
        type: 'linear',
        position: 'right',
        min: 90,
        max: 100,
        title: {
          display: true,
          text: 'SpO2 (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-white rounded-lg shadow-md p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}
```

### Using Charts in Pages

```typescript
// app/(dashboard)/daily/page.tsx

'use client';

import { useState } from 'react';
import { HeartRateChart } from '@/components/charts/HeartRateChart';
import { useDailyMeasurements } from '@/hooks/useMeasurements';

export default function DailyViewPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const { measurements, isLoading, error } = useDailyMeasurements(selectedDate);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Daily View</h1>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border rounded px-4 py-2"
      />

      <HeartRateChart measurements={measurements} />
    </div>
  );
}
```

## Resources

### Documentation
- [Next.js Official Docs](https://nextjs.org/docs) - Next.js framework documentation
- [React Docs](https://react.dev/) - React library documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Tailwind CSS utility classes
- [Chart.js Official Docs](https://www.chartjs.org/docs/latest/) - Chart.js documentation
- [react-chartjs-2](https://react-chartjs-2.js.org/) - React wrapper for Chart.js
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JWT Introduction](https://jwt.io/introduction) - JSON Web Token guide

### Libraries & Tools
- [Next.js](https://nextjs.org/) - React framework with SSR/SSG
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
- [Lucide React](https://lucide.dev/) - Icon library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management (alternative)
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Zod](https://zod.dev/) - Schema validation

### Design Resources
- [Tailwind UI](https://tailwindui.com/) - Official Tailwind component examples
- [Headless UI](https://headlessui.com/) - Unstyled accessible components
- [Material Design](https://material.io/design) - Design system inspiration
- [Dribbble](https://dribbble.com/) - UI/UX inspiration
- [Coolors](https://coolors.co/) - Color palette generator
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

### Development Tools
- [ESLint](https://eslint.org/) - JavaScript/TypeScript linting
- [Prettier](https://prettier.io/) - Code formatting
- [VS Code](https://code.visualstudio.com/) - Code editor
- [React Developer Tools](https://react.dev/learn/react-developer-tools) - Browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

### Testing Tools
- [Vercel Analytics](https://vercel.com/analytics) - Performance monitoring
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [WAVE](https://wave.webaim.org/) - Accessibility checker
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance testing

## Security Considerations

1. **JWT Token Storage**
   - **Best Practice**: Use HTTP-only cookies for token storage (prevents XSS attacks)
   - **Alternative**: localStorage with proper XSS protection measures
   - Implement token refresh mechanism
   - Clear token on logout
   - Handle token expiration gracefully
   - Never expose token in URLs or console logs

2. **Environment Variables**
   - Use `.env.local` for sensitive configuration
   - Prefix client-side env vars with `NEXT_PUBLIC_`
   - Never commit `.env.local` to version control
   - Use different env files for development and production

3. **Input Validation**
   - Use TypeScript for type safety
   - Implement client-side validation with Zod or Yup
   - Validate all form inputs before submission
   - Sanitize user inputs before display (prevent XSS)
   - Use proper input types (email, password, etc.)
   - Server-side validation is still required

4. **HTTPS & Network Security**
   - Use HTTPS for all API calls (especially in production)
   - Ensure backend API uses HTTPS
   - Implement CORS properly (specific origins, not wildcard)
   - Use Content Security Policy (CSP) headers

5. **API Key Handling**
   - Never hardcode API keys in frontend code
   - Use environment variables for configuration
   - Display device API keys only once during registration
   - Mask API keys when displaying
   - Provide secure copy-to-clipboard functionality

6. **Next.js Security Best Practices**
   - Enable strict mode in React
   - Use Next.js Image optimization (prevents image-based attacks)
   - Implement rate limiting for API routes
   - Use middleware for authentication checks
   - Keep dependencies updated (use `npm audit`)

## Troubleshooting

### Common Next.js Issues

#### Hydration Errors
```
Error: Text content does not match server-rendered HTML
```
**Solution:**
- Ensure server and client render the same content
- Use `useEffect` for client-only code
- Check for browser-only APIs in server components
- Use `suppressHydrationWarning` sparingly

#### Environment Variables Not Loading
```
process.env.NEXT_PUBLIC_API_BASE_URL is undefined
```
**Solution:**
- Verify `.env.local` file exists in project root
- Check variable names start with `NEXT_PUBLIC_` for client-side access
- Restart development server after adding new env vars
- Ensure `.env.local` is not in `.gitignore`

#### CORS Errors
```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin
'http://localhost:3001' has been blocked by CORS policy
```
**Solution:**
- Configure backend CORS to allow your frontend origin
- Add your Next.js dev server URL to backend CORS whitelist
- Check for proper headers in API responses

### Chart Issues

#### Chart Not Rendering
**Common causes:**
- Chart.js not registered properly
- Missing canvas element
- Data in incorrect format
- Container has no height

**Solution:**
```typescript
// Ensure Chart.js components are registered
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

// Ensure container has explicit height
<div className="h-[400px]">
  <Line data={data} options={options} />
</div>
```

#### Chart Not Updating
**Solution:**
- Use `useMemo` to memoize chart data
- Ensure dependencies array is correct in `useMemo`
- Check if data is actually changing

### Authentication Issues

#### Token Persistence Problems
**Solution:**
- Verify localStorage is working (not in incognito mode)
- Check token is being set correctly
- Implement token refresh mechanism
- Use browser DevTools to inspect localStorage

#### Redirects Not Working
**Solution:**
- Use Next.js router: `useRouter()` from `next/navigation`
- Ensure you're using client components (`'use client'`)
- Check middleware is configured correctly

### Build & Deployment Issues

#### Build Fails
```
Type error: Cannot find module '@/components/...'
```
**Solution:**
- Check `tsconfig.json` path aliases are correct
- Verify all imports use correct casing
- Run `npm run build` locally before deploying

#### Static Export Issues
**Solution:**
- Next.js API routes don't work with static export
- Use external API backend instead
- Configure `next.config.js` for static export if needed

### Performance Issues

#### Slow Page Loads
**Solution:**
- Use Next.js Image component for optimized images
- Implement lazy loading for heavy components
- Use dynamic imports for large libraries
- Enable React strict mode for debugging

#### Large Bundle Size
**Solution:**
- Use dynamic imports: `const Chart = dynamic(() => import('chart.js'))`
- Analyze bundle with: `npm run build --analyze`
- Remove unused dependencies
- Use tree-shaking compatible libraries

## Performance Optimization

### Next.js Built-in Optimizations

1. **Automatic Code Splitting**
   - Next.js automatically splits code by page
   - Only load JavaScript needed for current page
   - Prefetch links in viewport for faster navigation

2. **Image Optimization**
   ```typescript
   import Image from 'next/image';

   <Image
     src="/heart-icon.png"
     alt="Heart Rate"
     width={100}
     height={100}
     priority // for above-the-fold images
   />
   ```
   - Automatic image optimization
   - Lazy loading by default
   - Responsive images with srcset
   - WebP format when supported

3. **Font Optimization**
   ```typescript
   import { Inter } from 'next/font/google';

   const inter = Inter({ subsets: ['latin'] });

   <body className={inter.className}>
     {children}
   </body>
   ```
   - Automatic font optimization
   - No layout shift
   - Self-hosted fonts

### Custom Optimizations

4. **Dynamic Imports for Heavy Components**
   ```typescript
   import dynamic from 'next/dynamic';

   const HeartRateChart = dynamic(
     () => import('@/components/charts/HeartRateChart'),
     { ssr: false, loading: () => <div>Loading chart...</div> }
   );
   ```
   - Reduce initial bundle size
   - Load components on demand
   - Disable SSR for client-only components

5. **API Response Caching**
   ```typescript
   // Use SWR or React Query for data fetching
   import useSWR from 'swr';

   const { data, error } = useSWR('/api/measurements/weekly', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000, // 1 minute
   });
   ```
   - Cache API responses
   - Automatic revalidation
   - Optimistic updates

6. **Memoization**
   ```typescript
   import { useMemo, useCallback } from 'react';

   const chartData = useMemo(() => processData(measurements), [measurements]);
   const handleClick = useCallback(() => {}, [dependencies]);
   ```
   - Prevent unnecessary re-renders
   - Cache expensive calculations
   - Optimize callbacks

7. **Bundle Analysis**
   ```bash
   npm install @next/bundle-analyzer
   npm run build
   ```
   - Analyze bundle size
   - Identify large dependencies
   - Remove unused code

8. **Code Splitting Strategies**
   - Split by routes (automatic)
   - Split by components (dynamic imports)
   - Split by vendor chunks
   - Use React.lazy for component-level splitting

## Integration with Other Projects

### Required from Project 2 (Backend)
- All API endpoints (auth, devices, measurements)
- JWT authentication
- CORS configuration
- HTTPS support (ECE 513)
- AI chat endpoint (Extra Credit)

### Provides to Backend
- User interactions
- API requests with JWT tokens
- Device API key validation (during registration)

### Integration with Project 1 (IoT)
- User registers device using device ID
- Device API key displayed to user
- User configures device measurement frequency
- User views measurements from device

## Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Provide alt text for images
- Ensure color contrast meets WCAG standards
- Test with screen readers

## License

[Specify your license]

## Contributors

[Team member names and roles]

## Changelog

### Version 0.1.0 (Milestone - Nov 21)
- Basic authentication UI (login/signup)
- Simple dashboard
- Basic API integration

### Version 0.2.0
- Weekly summary view
- Daily detailed view with charts
- Device management interface

### Version 1.0.0 (Final - Dec 15)
- Full feature implementation
- Responsive design
- Physician portal (ECE 513)
- AI chat (Extra Credit)
- Complete documentation

---

## 📊 Implementation Status

**Overall Completion:** ~35% (Foundation 55% complete, Core Features 0% complete)

**Last Updated:** 2025-11-19

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| **1. Project Setup** | ✅ Complete | 100% | Next.js 15, React 19, Tailwind CSS v4 all configured |
| **2. Authentication** | ✅ Complete | 100% | Better Auth with email, OAuth, Magic Link working |
| **3. Dashboard/Nav** | 🟡 Partial | 60% | Structure done, missing real health data display |
| **4. Weekly Summary** | ❌ Not Started | 0% | **CRITICAL:** Backend ready, need frontend + charts |
| **5. Daily View + Charts** | ❌ Not Started | 0% | **CRITICAL:** Chart.js not installed yet |
| **6. Device Management** | ❌ Not Started | 0% | **CRITICAL:** Backend ready, need full UI |
| **7. Account Settings** | ✅ Complete | 100% | Profile, password, delete account all working |
| **8. Responsive Design** | 🟡 Partial | 60% | Framework ready, needs chart optimization |
| **9. Physician Portal** | ❌ Not Started | 0% | **ECE 513 REQUIRED:** 0% complete |
| **10. AI Chat** | ❌ Not Started | 0% | Extra Credit: Backend + frontend needed |
| **11. Additional Pages** | 🟡 Partial | 50% | Landing page exists, missing team info + references.html |
| **12. Testing** | 🟡 Partial | 20% | Basic auth tested, need comprehensive suite |
| **13. Documentation** | 🟡 Partial | 70% | Good code docs, missing user guide |
| **14. Video Submission** | ❌ Not Started | 0% | **REQUIRED:** Pitch (5min) + Demo (15-20min) videos |
| **15. Final Submission** | ❌ Not Started | 0% | **REQUIRED:** Git repo, archive, deployment, testing |

### ✅ Completed (Foundation ~55%)
- ✅ Next.js 15 + React 19 + TypeScript setup
- ✅ Tailwind CSS v4 configuration
- ✅ shadcn/ui component library (64+ components)
- ✅ Better Auth integration (email, OAuth, Magic Link)
- ✅ Sign-in and sign-up pages with full validation
- ✅ Dashboard structure and navigation
- ✅ Settings pages (profile, account, security, appearance)
- ✅ Admin portal (users, sessions, impersonation)
- ✅ SEO optimization (sitemap, metadata, JSON-LD)
- ✅ API client infrastructure with error handling
- ✅ TanStack Query integration
- ✅ Mobile navigation (hamburger menu)

### 🚧 In Progress (Partial Features)
- 🟡 Dashboard (60%) - Structure done, missing real health data
- 🟡 Responsive design (60%) - Framework ready, needs chart optimization
- 🟡 Landing pages (50%) - Landing page exists, needs team info
- 🟡 Testing (20%) - Basic auth tested, need comprehensive suite
- 🟡 Documentation (70%) - Good code docs, missing user guide

### ❌ To Do - CRITICAL (Core Features 0%)
- ❌ **Chart.js library** - NOT INSTALLED (blocker for all visualizations)
- ❌ **Device management UI** - Backend ready, need full frontend
- ❌ **Weekly summary view** - Charts + statistics for last 7 days
- ❌ **Daily detailed view** - Time-series charts for selected day
- ❌ **Measurement display** - Show actual health data on dashboard
- ❌ **index.html** - Team introduction page (PROJECT REQUIREMENT)
- ❌ **reference.html** - Third-party credits page (PROJECT REQUIREMENT)

### ❌ To Do - ECE 513 Requirements (0%)
- ❌ **Physician portal** - Complete implementation (registration, patient list, views)
- ❌ **HTTPS deployment** - SSL certificates, secure server
- ❌ **Patient-physician association** - Backend + frontend

### ❌ To Do - Extra Credit (0%)
- ❌ **AI chat interface** - Health assistant with RAG (backend + frontend)
- ❌ **Testing suite** - Comprehensive end-to-end tests

See `IMPLEMENTATION_STATUS.md` for detailed status and metrics.

---

**Last Updated:** 2025-11-19

**Current Stack:** Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS v4 + Better Auth

**Frontend Server:** http://localhost:3000
**Backend API:** http://localhost:4000/api

---

## 📋 Grading Rubric Checklist (Total: 35 points)

Use this checklist to ensure all graded items are complete before submission.

### Web Application Requirements (ECE 413 & 513)

| # | Item | Points (413) | Points (513) | Status | Notes |
|---|------|--------------|--------------|--------|-------|
| 1 | AWS running | 1 | 1 | ❌ | Server must be publicly accessible |
| 2 | Index.html | 1 | 1 | 🟡 | Page exists, needs team info |
| 3 | Information about project | 1 | 1 | 🟡 | Needs project description |
| 4 | Team information | 1 | 1 | ❌ | Need names, emails, photos |
| 5 | Sign in/Sign up | 2 | 1 | ✅ | Working with Better Auth |
| 6 | Strong password | 3 | 2 | ✅ | Salted hash with bcrypt |
| 7 | Device registration | 1 | 1 | ❌ | Backend ready, UI missing |
| 8 | Reading Data | 1 | 1 | ❌ | Sensor integration (IoT project) |
| 9 | Periodic reading (30 min) | 2 | 2 | ❌ | IoT firmware (state machine) |
| 10 | README file | 2 | 2 | ✅ | Complete with instructions |
| 11 | Git Repo | 2 | 2 | ✅ | GitHub repo with good commits |
| 12 | Video pitch submission | 3 | 3 | ❌ | 5-minute pitch video |
| 13 | Coding style | 2 | 2 | ✅ | Well-commented TypeScript |
| 14 | Responsive pages | 1 | 1 | 🟡 | Framework ready, charts needed |
| 15 | Video demo submission | 1 | 1 | ❌ | 15-20 minute demo |
| 16 | Code submission | 1 | 1 | ❌ | Archive ready for D2L |
| 17 | Store data in device | 3 | 2 | ❌ | IoT: 24-hour local storage |
| 18 | Charts | 1 | 1 | ❌ | Chart.js visualization |
| 19 | Localhost running | 1 | 1 | ✅ | Evidence in demo video |
| 20 | HTTPS implementation | - | 3 | ❌ | **ECE 513 ONLY:** SSL/TLS |
| 21 | Project Documentation | 5 | 5 | 🟡 | Partial (needs completion) |

**ECE 413 Total:** 35 points
**ECE 513 Total:** 35 points

### Extra Credit & Penalties

| # | Item | Points | Status | Notes |
|---|------|--------|--------|-------|
| 22 | LLM Health AI Assistant | +5 | ❌ | Chat interface + RAG backend |
| 23 | Milestone (Nov 21) | +3 | ❌ | Early submission bonus |
| 24 | Late submission (Dec 17) | -10 | N/A | Avoid this! |

### Detailed Requirements Checklist

#### Core Features Checklist
- [x] User can create account with email and strong password
- [x] User can login and logout
- [ ] User can register at least one device (backend ready, UI missing)
- [x] User can update account information (except email)
- [ ] User can add and remove devices (backend ready, UI missing)
- [x] User can have multiple devices (backend supports it)
- [ ] Weekly summary view shows avg/min/max heart rate (last 7 days)
- [ ] Daily view plots heart rate and SpO2 on separate charts
- [ ] Charts show time of day on X-axis, measurement on Y-axis
- [ ] Min/max values visually indicated on charts
- [ ] User can define time-of-day range for measurements
- [ ] User can define measurement frequency
- [x] Web app has navigation menu
- [x] Web app uses responsive design (desktop, tablet, mobile)
- [ ] index.html page introduces team and project (page exists, missing team info)
- [ ] reference.html page lists third-party APIs, libraries, code

#### ECE 513 Additional Checklist
- [ ] Server uses HTTPS
- [ ] Physician can register account
- [ ] Users can select physician on account page
- [ ] Physician portal has patient view (list all patients)
- [ ] Patient view shows 7-day avg/max/min heart rate
- [ ] Physician can select patient to view summary
- [ ] Patient summary view shows weekly data
- [ ] Patient summary includes controls to adjust measurement frequency
- [ ] Patient detailed view shows same info as user daily view

#### Extra Credit Checklist
- [ ] Chat interface for AI assistant
- [ ] Local LLM (Ollama) running
- [ ] RAG pattern implemented (retrieve user data, construct prompt)
- [ ] LLM responses based only on user's health data
- [ ] Documented in final submission

---
