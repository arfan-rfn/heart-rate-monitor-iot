# Project 3: Heart Track Web Frontend

## Overview

This project contains the web-based user interface for the Heart Track application built with **Next.js 15.2.4, React 19, TypeScript, and Tailwind CSS v4**. It provides an intuitive, responsive dashboard for users to view their heart rate and SpO2 measurements, manage devices, and interact with their health data. The frontend communicates with the backend API to display real-time health metrics, weekly summaries, and detailed daily views.

> **Note:** This project uses Next.js with the App Router, TypeScript strict mode for type safety, and Tailwind CSS v4 (PostCSS-based) for styling. This modern stack provides better performance, developer experience, and maintainability.

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

### Phase 3: Dashboard & Navigation

- [ ] **Dashboard HTML**
  - [ ] Create dashboard.html structure
  - [ ] Add navigation menu (sidebar or top nav)
  - [ ] Add welcome section with user name
  - [ ] Add quick stats cards (today's measurements, device count)
  - [ ] Add recent measurements preview
  - [ ] Add quick action buttons

- [ ] **Navigation System**
  - [ ] Design navigation menu
  - [ ] Add links to Weekly Summary, Daily View, Devices, Settings
  - [ ] Highlight active page
  - [ ] Make navigation responsive (hamburger menu for mobile)
  - [ ] Add logout button in navigation
  - [ ] Implement smooth page transitions

- [ ] **Dashboard Logic**
  - [ ] Fetch user profile on load
  - [ ] Display user name in welcome message
  - [ ] Fetch and display recent measurements (last 5)
  - [ ] Fetch and display device count
  - [ ] Calculate today's average heart rate
  - [ ] Add loading states for data fetching
  - [ ] Handle empty state (no devices/measurements)

- [ ] **Navigation Styling**
  - [ ] Style navigation menu
  - [ ] Add hover effects
  - [ ] Implement active state styling
  - [ ] Make navigation sticky (optional)
  - [ ] Add icons to menu items
  - [ ] Ensure mobile responsiveness

### Phase 4: Weekly Summary View

- [ ] **Weekly Summary HTML**
  - [ ] Create weekly-summary.html
  - [ ] Add page header with date range
  - [ ] Create stats cards container (avg, min, max)
  - [ ] Add canvas element for heart rate chart
  - [ ] Add canvas element for SpO2 chart
  - [ ] Add day-by-day table/list
  - [ ] Add navigation back to dashboard

- [ ] **Weekly Summary Styling**
  - [ ] Style stats cards with icons
  - [ ] Make cards responsive (stack on mobile)
  - [ ] Style chart containers
  - [ ] Add color coding (green for good, yellow for fair, red for poor)
  - [ ] Style day-by-day breakdown
  - [ ] Add spacing and visual hierarchy

- [ ] **Weekly Summary Logic**
  - [ ] Fetch weekly summary from backend
  - [ ] Parse and display statistics (avg, min, max)
  - [ ] Calculate date range (last 7 days)
  - [ ] Group measurements by day
  - [ ] Handle empty state (no measurements this week)
  - [ ] Add loading spinner
  - [ ] Implement error handling

- [ ] **Basic Chart Integration (Preview)**
  - [ ] Include Chart.js library (CDN or npm)
  - [ ] Create placeholder charts
  - [ ] Test Chart.js setup
  - [ ] Prepare data format for charts
  - [ ] (Full chart implementation in Phase 5)

### Phase 5: Daily Detailed View with Charts

- [ ] **Daily View HTML**
  - [ ] Create daily-view.html
  - [ ] Add date picker for selecting day
  - [ ] Add previous/next day buttons
  - [ ] Create canvas for heart rate time-series chart
  - [ ] Create canvas for SpO2 time-series chart
  - [ ] Add measurements table/list
  - [ ] Add export data button (optional)

- [ ] **Daily View Styling**
  - [ ] Style date picker and navigation
  - [ ] Style chart containers with proper sizing
  - [ ] Create measurement cards or table
  - [ ] Add time labels and formatting
  - [ ] Make charts responsive
  - [ ] Add color coding for measurement quality

- [ ] **Daily View Logic**
  - [ ] Implement date selection
  - [ ] Fetch daily measurements from backend
  - [ ] Parse timestamp data
  - [ ] Sort measurements by time
  - [ ] Handle empty state (no measurements today)
  - [ ] Implement previous/next day navigation
  - [ ] Add loading states

- [ ] **Chart.js Implementation**
  - [ ] Initialize Chart.js for heart rate
  - [ ] Configure chart options (responsive, tooltips, legend)
  - [ ] Format time data for x-axis
  - [ ] Plot heart rate data points
  - [ ] Add reference line for average
  - [ ] Initialize Chart.js for SpO2
  - [ ] Plot SpO2 data points
  - [ ] Customize chart colors and styling
  - [ ] Add zoom/pan functionality (optional)
  - [ ] Make charts update dynamically on date change

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

### Phase 6: Device Management Interface

- [ ] **Device Management HTML**
  - [ ] Create devices.html
  - [ ] Add "Add New Device" button
  - [ ] Create device cards/list display
  - [ ] Add modal for adding new device
  - [ ] Add modal for editing device configuration
  - [ ] Add delete confirmation modal

- [ ] **Device Management Styling**
  - [ ] Style device cards with icons
  - [ ] Show device status (active, inactive, error)
  - [ ] Add color coding for status
  - [ ] Style modals with overlay
  - [ ] Make modals accessible (keyboard navigation)
  - [ ] Ensure responsive layout

- [ ] **Device List Logic**
  - [ ] Fetch all devices from backend
  - [ ] Display device name, ID, status
  - [ ] Show last seen timestamp
  - [ ] Display masked API key (show/hide button)
  - [ ] Handle empty state (no devices)
  - [ ] Add loading state

- [ ] **Add Device Functionality**
  - [ ] Create add device form (deviceId, name)
  - [ ] Validate device ID format
  - [ ] Submit device registration to backend
  - [ ] Display API key to user (one-time)
  - [ ] Add copy-to-clipboard for API key
  - [ ] Update device list after adding
  - [ ] Show success message

- [ ] **Edit Device Configuration**
  - [ ] Open edit modal with current config
  - [ ] Allow editing measurement frequency (dropdown)
  - [ ] Allow editing active time range (time pickers)
  - [ ] Validate inputs (frequency 15 min - 4 hours)
  - [ ] Submit configuration update to backend
  - [ ] Update device list
  - [ ] Show success message

- [ ] **Delete Device Functionality**
  - [ ] Show confirmation modal
  - [ ] Explain consequences (data deletion)
  - [ ] Submit delete request to backend
  - [ ] Remove device from list
  - [ ] Show success message

### Phase 7: Account Settings Page

- [ ] **Account Settings HTML**
  - [ ] Create settings.html
  - [ ] Add profile section (name, email)
  - [ ] Add change password form
  - [ ] Add delete account section
  - [ ] Add physician selection (ECE 513)

- [ ] **Account Settings Styling**
  - [ ] Style profile card
  - [ ] Style form sections
  - [ ] Add visual separation between sections
  - [ ] Make responsive for mobile
  - [ ] Add icons for visual clarity

- [ ] **Profile Management Logic**
  - [ ] Fetch user profile
  - [ ] Display current name and email
  - [ ] Allow editing name
  - [ ] Disable email editing (or require verification)
  - [ ] Submit profile updates to backend
  - [ ] Show success message

- [ ] **Change Password Functionality**
  - [ ] Create change password form (current, new, confirm)
  - [ ] Validate current password
  - [ ] Validate new password strength
  - [ ] Validate password match
  - [ ] Submit to backend
  - [ ] Show success message
  - [ ] Clear form after success

- [ ] **Delete Account Functionality**
  - [ ] Show warning modal
  - [ ] Require password confirmation
  - [ ] Explain data deletion
  - [ ] Submit delete request to backend
  - [ ] Clear localStorage
  - [ ] Redirect to landing page
  - [ ] Show confirmation message

### Phase 8: Responsive Design

- [ ] **Mobile Optimization (320px - 767px)**
  - [ ] Stack layout vertically
  - [ ] Make navigation hamburger menu
  - [ ] Adjust font sizes for readability
  - [ ] Make buttons larger (touch-friendly)
  - [ ] Simplify charts (reduce data points if needed)
  - [ ] Test on real mobile devices
  - [ ] Ensure forms are easy to fill on mobile
  - [ ] Add swipe gestures (optional)

- [ ] **Tablet Optimization (768px - 1023px)**
  - [ ] Use 2-column layouts where appropriate
  - [ ] Adjust chart sizes
  - [ ] Make navigation visible but compact
  - [ ] Test landscape and portrait orientations
  - [ ] Ensure touch targets are adequate

- [ ] **Desktop Optimization (1024px+)**
  - [ ] Use multi-column layouts
  - [ ] Show full navigation sidebar
  - [ ] Expand charts to full width
  - [ ] Add hover states for interactive elements
  - [ ] Optimize for mouse and keyboard navigation

- [ ] **Cross-Browser Testing**
  - [ ] Test on Chrome (latest)
  - [ ] Test on Firefox (latest)
  - [ ] Test on Safari (latest)
  - [ ] Test on Edge (latest)
  - [ ] Fix browser-specific issues
  - [ ] Add vendor prefixes for CSS if needed

- [ ] **Performance Optimization**
  - [ ] Minimize HTTP requests
  - [ ] Compress images
  - [ ] Use CSS sprites or SVG icons
  - [ ] Lazy load charts (initialize on view)
  - [ ] Cache API responses where appropriate
  - [ ] Minify CSS and JavaScript (production)

### Phase 9: Physician Portal UI (ECE 513 Only)

- [ ] **Physician Registration Page**
  - [ ] Create physician-register.html
  - [ ] Add physician-specific fields (specialty, license)
  - [ ] Style registration form
  - [ ] Integrate with backend physician registration endpoint
  - [ ] Redirect to physician dashboard

- [ ] **Physician Dashboard**
  - [ ] Create physician-dashboard.html
  - [ ] Display list of all patients
  - [ ] Show patient name and email
  - [ ] Display 7-day summary for each patient
  - [ ] Add "View Details" button for each patient
  - [ ] Style patient cards/table
  - [ ] Implement search/filter (optional)

- [ ] **Patient Summary View (Physician)**
  - [ ] Create physician-patient-summary.html
  - [ ] Display patient weekly summary
  - [ ] Show weekly statistics
  - [ ] Add charts (same as user weekly view)
  - [ ] Add link to daily detailed view
  - [ ] Add configuration controls

- [ ] **Patient Daily View (Physician)**
  - [ ] Create physician-patient-daily.html
  - [ ] Reuse daily view components
  - [ ] Fetch patient daily data
  - [ ] Display same charts and measurements
  - [ ] Ensure physician can view but patient owns data

- [ ] **Device Configuration (Physician)**
  - [ ] Add edit configuration button in patient summary
  - [ ] Allow physician to adjust measurement frequency
  - [ ] Allow physician to adjust active time range
  - [ ] Submit configuration changes to backend
  - [ ] Show confirmation message
  - [ ] Update patient's device configuration

- [ ] **Physician Authentication**
  - [ ] Separate login page for physicians (optional)
  - [ ] Or role-based redirect after login
  - [ ] Verify physician role from JWT
  - [ ] Restrict access to physician pages
  - [ ] Add logout functionality

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

### Phase 11: Index.html and References.html

- [ ] **Landing Page (index.html)**
  - [ ] Create attractive landing page
  - [ ] Add hero section with tagline
  - [ ] Explain Heart Track features
  - [ ] Add "Get Started" button (links to signup)
  - [ ] Add "Login" button
  - [ ] Include screenshots/mockups
  - [ ] Add footer with links

- [ ] **References Page**
  - [ ] Create references.html
  - [ ] List all libraries and frameworks used
  - [ ] Link to Chart.js documentation
  - [ ] Link to backend API (if public)
  - [ ] Credit icon sources (Font Awesome, etc.)
  - [ ] Add bibliography if applicable
  - [ ] Link to project repository

- [ ] **Help/FAQ Page (Optional)**
  - [ ] Create faq.html
  - [ ] Answer common questions
  - [ ] Provide troubleshooting tips
  - [ ] Explain how to use each feature
  - [ ] Add contact information

### Phase 12: Testing & Browser Compatibility

- [ ] **Functional Testing**
  - [ ] Test login/signup flow
  - [ ] Test JWT token storage and retrieval
  - [ ] Test navigation between pages
  - [ ] Test dashboard data loading
  - [ ] Test weekly summary display
  - [ ] Test daily view with date selection
  - [ ] Test chart rendering
  - [ ] Test device management (add, edit, delete)
  - [ ] Test account settings updates
  - [ ] Test logout functionality

- [ ] **API Integration Testing**
  - [ ] Verify all API endpoints work
  - [ ] Test error responses (401, 404, 500)
  - [ ] Test loading states
  - [ ] Test empty states (no data)
  - [ ] Test token expiration handling
  - [ ] Test network failure scenarios

- [ ] **UI/UX Testing**
  - [ ] Test on different screen sizes
  - [ ] Test on touch devices
  - [ ] Verify all buttons and links work
  - [ ] Check form validation
  - [ ] Test keyboard navigation
  - [ ] Verify accessibility (screen readers)
  - [ ] Check color contrast ratios

- [ ] **Chart Testing**
  - [ ] Test charts with varying data amounts
  - [ ] Test empty chart state (no data)
  - [ ] Verify chart responsiveness
  - [ ] Test chart tooltips and interactions
  - [ ] Verify correct data representation

- [ ] **Cross-Browser Testing**
  - [ ] Chrome (desktop and mobile)
  - [ ] Firefox (desktop and mobile)
  - [ ] Safari (desktop and mobile)
  - [ ] Edge (desktop)
  - [ ] Fix any browser-specific bugs

- [ ] **Performance Testing**
  - [ ] Measure page load times
  - [ ] Test with large datasets
  - [ ] Check JavaScript execution time
  - [ ] Optimize slow operations
  - [ ] Test on slower network connections

### Phase 13: Documentation

- [ ] **Code Documentation**
  - [ ] Add JSDoc comments to functions
  - [ ] Document API service module
  - [ ] Explain authentication flow
  - [ ] Document chart initialization
  - [ ] Add inline comments for complex logic

- [ ] **User Guide**
  - [ ] Write step-by-step user manual
  - [ ] Explain how to register and login
  - [ ] Explain how to add a device
  - [ ] Explain how to view measurements
  - [ ] Explain how to interpret charts
  - [ ] Add screenshots for clarity

- [ ] **Developer Documentation**
  - [ ] Document file structure
  - [ ] Explain project architecture
  - [ ] Document API integration
  - [ ] Provide setup instructions
  - [ ] Document build process (if any)

- [ ] **Deployment Documentation**
  - [ ] Document hosting options (GitHub Pages, Netlify, etc.)
  - [ ] Explain environment configuration
  - [ ] Document CORS setup
  - [ ] Provide deployment checklist

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

**Overall Completion:** ~55% (Foundation complete, features in progress)

| Phase | Status | Progress |
|-------|--------|----------|
| **1. Project Setup** | ✅ Complete | 100% |
| **2. Authentication** | ✅ Complete | 100% |
| **3. Dashboard/Nav** | 🟡 Partial | 80% |
| **4. Weekly Summary** | ❌ Not Started | 0% |
| **5. Daily View + Charts** | ❌ Not Started | 0% |
| **6. Device Management** | ❌ Not Started | 0% |
| **7. Account Settings** | ✅ Complete | 100% |
| **8. Responsive Design** | 🟡 Partial | 60% |
| **9. Physician Portal** | 🟡 Partial | 20% |
| **10. AI Chat** | ❌ Not Started | 0% |
| **11. Additional Pages** | ✅ Complete | 100% |
| **12. Testing** | ❌ Not Started | 0% |
| **13. Documentation** | 🟡 Partial | 70% |

### ✅ Completed
- Next.js 15 + React 19 + TypeScript setup
- Tailwind CSS v4 configuration
- shadcn/ui component library (64+ components)
- Better Auth integration (email, OAuth, Magic Link)
- Sign-in and sign-up pages with full validation
- Dashboard structure and navigation
- Settings pages (account, appearance)
- Admin portal (users, sessions)
- SEO optimization (sitemap, metadata, JSON-LD)

### 🚧 In Progress
- Health data visualization pages
- Chart.js/Recharts integration
- Responsive mobile design
- Device management UI

### ❌ To Do
- Weekly summary view
- Daily detailed view with charts
- Device CRUD interface
- Physician portal completion
- AI chat interface (extra credit)
- Testing suite

See `IMPLEMENTATION_STATUS.md` for detailed status and metrics.

---

**Last Updated:** 2025-11-19

**Current Stack:** Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS v4 + Better Auth

**Frontend Server:** http://localhost:3000
**Backend API:** http://localhost:4000/api
