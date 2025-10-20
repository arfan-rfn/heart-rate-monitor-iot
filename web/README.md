# Project 3: Heart Track Web Frontend

## Overview

This project contains the web-based user interface for the Heart Track application. It provides an intuitive, responsive dashboard for users to view their heart rate and SpO2 measurements, manage devices, and interact with their health data. The frontend communicates with the backend API to display real-time health metrics, weekly summaries, and detailed daily views.

## Technology Stack

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charts:** Chart.js (v4.x) for data visualization
- **Design:** CSS Grid, Flexbox, CSS Variables
- **Responsive:** Mobile-first design with media queries
- **API Communication:** Fetch API for RESTful endpoints
- **Storage:** LocalStorage for JWT token persistence
- **Icons:** Font Awesome or custom SVG icons
- **ECE 513:** Physician portal interface
- **Extra Credit:** AI chat interface with streaming responses

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Frontend                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Login/     │  │  Dashboard   │  │   Weekly     │ │
│  │   Signup     │  │  Navigation  │  │   Summary    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐ │
│  │   Daily      │  │   Device     │  │   Account    │ │
│  │   Detailed   │  │  Management  │  │   Settings   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
│  ┌──────▼──────────────────▼──────────────────▼──────┐ │
│  │         API Service Layer (api.js)                 │ │
│  │    - Authentication     - Device Management        │ │
│  │    - Measurements       - Error Handling           │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
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

### Phase 1: Project Setup & Basic Structure

- [ ] **Project Initialization**
  - [ ] Create project folder structure
  - [ ] Set up `.gitignore` for web project
  - [ ] Create `package.json` (optional for build tools)
  - [ ] Set up local development server (Live Server or similar)

- [ ] **File Structure Setup**
  - [ ] Create HTML files (index.html, login.html, dashboard.html, etc.)
  - [ ] Create CSS files (styles.css, variables.css, responsive.css)
  - [ ] Create JavaScript files (app.js, api.js, auth.js, charts.js)
  - [ ] Create assets folder for images/icons
  - [ ] Set up modular architecture

- [ ] **CSS Framework & Variables**
  - [ ] Define CSS custom properties (colors, fonts, spacing)
  - [ ] Set up base reset/normalize styles
  - [ ] Create utility classes
  - [ ] Implement responsive grid system
  - [ ] Define breakpoints for mobile, tablet, desktop

- [ ] **HTML Templates**
  - [ ] Create semantic HTML structure
  - [ ] Add meta tags for SEO and viewport
  - [ ] Include accessibility attributes (ARIA)
  - [ ] Set up template structure for each page
  - [ ] Create reusable component templates

### Phase 2: Authentication UI ✓ (Milestone)

- [ ] **Login Page**
  - [ ] Design login form (email, password)
  - [ ] Add form validation (client-side)
  - [ ] Implement error message display
  - [ ] Add "Remember Me" checkbox (optional)
  - [ ] Add "Forgot Password" link (optional)
  - [ ] Style with CSS (responsive)
  - [ ] Add loading spinner during submission
  - [ ] Integrate with backend login endpoint

- [ ] **Signup Page**
  - [ ] Design registration form (name, email, password, confirm password)
  - [ ] Add email format validation
  - [ ] Add password strength meter
  - [ ] Implement password match validation
  - [ ] Add terms of service checkbox
  - [ ] Style with CSS (responsive)
  - [ ] Add loading spinner during submission
  - [ ] Integrate with backend register endpoint

- [ ] **Authentication Logic**
  - [ ] Create auth.js module
  - [ ] Implement login function with API call
  - [ ] Implement register function with API call
  - [ ] Store JWT token in localStorage
  - [ ] Implement logout function (clear token)
  - [ ] Create auth check function (verify token exists)
  - [ ] Redirect to dashboard after successful login
  - [ ] Redirect to login if not authenticated

- [ ] **Error Handling**
  - [ ] Display server error messages (401, 400, etc.)
  - [ ] Handle network errors gracefully
  - [ ] Show user-friendly error messages
  - [ ] Clear errors on input change

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
├── index.html                         # Landing page
├── login.html                         # Login page
├── signup.html                        # Registration page
├── dashboard.html                     # Main dashboard
├── weekly-summary.html                # Weekly summary view
├── daily-view.html                    # Daily detailed view
├── devices.html                       # Device management
├── settings.html                      # Account settings
├── physician-register.html            # Physician registration (ECE 513)
├── physician-dashboard.html           # Physician dashboard (ECE 513)
├── physician-patient-summary.html     # Patient summary (ECE 513)
├── physician-patient-daily.html       # Patient daily view (ECE 513)
├── ai-chat.html                       # AI chat interface (Extra Credit)
├── references.html                    # References page
├── css/
│   ├── variables.css                  # CSS custom properties
│   ├── reset.css                      # CSS reset/normalize
│   ├── styles.css                     # Main stylesheet
│   ├── responsive.css                 # Media queries
│   ├── auth.css                       # Login/signup styles
│   ├── dashboard.css                  # Dashboard styles
│   ├── charts.css                     # Chart container styles
│   ├── devices.css                    # Device management styles
│   ├── modals.css                     # Modal styles
│   └── chat.css                       # Chat interface styles (Extra Credit)
├── js/
│   ├── config.js                      # Configuration (API URL, constants)
│   ├── api.js                         # API service layer
│   ├── auth.js                        # Authentication logic
│   ├── dashboard.js                   # Dashboard logic
│   ├── weekly-summary.js              # Weekly summary logic
│   ├── daily-view.js                  # Daily view logic
│   ├── charts.js                      # Chart.js initialization
│   ├── devices.js                     # Device management logic
│   ├── settings.js                    # Account settings logic
│   ├── physician.js                   # Physician portal logic (ECE 513)
│   ├── chat.js                        # AI chat logic (Extra Credit)
│   ├── utils.js                       # Utility functions
│   └── validation.js                  # Form validation helpers
├── assets/
│   ├── images/
│   │   ├── logo.png                   # Application logo
│   │   ├── heart-icon.svg             # Heart rate icon
│   │   ├── spo2-icon.svg              # SpO2 icon
│   │   └── device-icon.svg            # Device icon
│   └── fonts/                         # Custom fonts (if any)
├── docs/
│   ├── user-guide.md                  # User manual
│   ├── developer-guide.md             # Developer documentation
│   ├── api-integration.md             # API integration guide
│   └── deployment.md                  # Deployment guide
└── tests/
    ├── test-auth.html                 # Manual test page for auth
    ├── test-charts.html               # Manual test page for charts
    └── test-api.html                  # Manual test page for API calls
```

## Setup Instructions

### Prerequisites

1. **Web Browser**
   - Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
   - JavaScript enabled
   - LocalStorage enabled

2. **Backend API**
   - Backend server must be running (Project 2)
   - API endpoint URL configured

3. **Development Server (Optional)**
   - Live Server (VS Code extension)
   - Python HTTP server
   - Node.js http-server

### Local Development

1. **Clone Repository**
   ```bash
   cd web/
   ```

2. **Configure API Endpoint**
   - Open `js/config.js`
   - Set the backend API URL
   ```javascript
   const API_BASE_URL = 'http://localhost:3000';
   // Or for production:
   // const API_BASE_URL = 'https://your-domain.com';
   ```

3. **Start Development Server**

   **Option 1: VS Code Live Server**
   - Install Live Server extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

   **Option 2: Python HTTP Server**
   ```bash
   python3 -m http.server 8080
   # Visit http://localhost:8080
   ```

   **Option 3: Node.js http-server**
   ```bash
   npx http-server -p 8080
   # Visit http://localhost:8080
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:8080`
   - Start with `index.html` or `login.html`

### Deployment

#### Option 1: GitHub Pages
```bash
# Create gh-pages branch
git checkout -b gh-pages

# Push web folder
git subtree push --prefix web origin gh-pages

# Access at: https://username.github.io/repo-name
```

#### Option 2: Netlify
1. Sign up at https://www.netlify.com
2. Connect your GitHub repository
3. Set build command (if any): `none`
4. Set publish directory: `web`
5. Deploy

#### Option 3: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web/
vercel
```

#### Option 4: AWS S3 Static Hosting
1. Create S3 bucket
2. Enable static website hosting
3. Upload all files from `web/` folder
4. Set bucket policy for public access
5. Access via S3 endpoint URL

### Configuration

Update `js/config.js` with your settings:

```javascript
// API Configuration
const API_BASE_URL = 'https://your-api-domain.com';

// Chart Configuration
const CHART_COLORS = {
  heartRate: '#e74c3c',
  spO2: '#3498db',
  background: 'rgba(231, 76, 60, 0.1)'
};

// Pagination
const ITEMS_PER_PAGE = 10;

// Date Format
const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';

// LocalStorage Keys
const STORAGE_KEYS = {
  token: 'jwt_token',
  user: 'user_data',
  chatHistory: 'chat_history'
};
```

## API Integration

### Authentication Flow

```javascript
// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('jwt_token', data.data.token);
    localStorage.setItem('user_data', JSON.stringify(data.data.user));
    window.location.href = 'dashboard.html';
  } else {
    showError('Login failed. Please check your credentials.');
  }
}

// Register
async function register(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('jwt_token', data.data.token);
    localStorage.setItem('user_data', JSON.stringify(data.data.user));
    window.location.href = 'dashboard.html';
  } else {
    showError(data.message || 'Registration failed.');
  }
}

// Logout
function logout() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_data');
  window.location.href = 'login.html';
}

// Check Authentication
function checkAuth() {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    window.location.href = 'login.html';
  }
  return token;
}
```

### Fetching Data with JWT

```javascript
// Generic API call with authentication
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('jwt_token');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      return;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Example: Fetch weekly summary
async function fetchWeeklySummary() {
  const data = await apiCall('/api/measurements/weekly/summary');
  return data.data.summary;
}

// Example: Fetch daily measurements
async function fetchDailyMeasurements(date) {
  const data = await apiCall(`/api/measurements/daily/${date}`);
  return data.data.measurements;
}

// Example: Add new device
async function addDevice(deviceId, name) {
  const data = await apiCall('/api/devices', 'POST', { deviceId, name });
  return data.data.device;
}
```

### Error Handling

```javascript
function handleApiError(error) {
  if (error.status === 401) {
    showError('Session expired. Please login again.');
    logout();
  } else if (error.status === 404) {
    showError('Resource not found.');
  } else if (error.status === 500) {
    showError('Server error. Please try again later.');
  } else {
    showError('An error occurred. Please try again.');
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}
```

## UI/UX Design

### Color Scheme

```css
:root {
  /* Primary Colors */
  --primary-color: #3498db;
  --primary-dark: #2980b9;
  --primary-light: #5dade2;

  /* Secondary Colors */
  --secondary-color: #2ecc71;
  --secondary-dark: #27ae60;

  /* Status Colors */
  --success: #2ecc71;
  --warning: #f39c12;
  --danger: #e74c3c;
  --info: #3498db;

  /* Health Metrics */
  --heart-rate-color: #e74c3c;
  --spo2-color: #3498db;

  /* Neutral Colors */
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --background: #ecf0f1;
  --white: #ffffff;
  --gray-light: #bdc3c7;
  --gray-dark: #34495e;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;

  /* Borders */
  --border-radius: 8px;
  --border-radius-sm: 4px;
  --border-radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

### Responsive Breakpoints

```css
/* Mobile First Approach */

/* Base styles (mobile) - 320px to 767px */
body {
  font-size: 16px;
  padding: 1rem;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  body {
    font-size: 18px;
    padding: 1.5rem;
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop - 1024px and up */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }

  .grid-2-cols {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

/* Large Desktop - 1280px and up */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }

  .grid-3-cols {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

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

### Setting Up Chart.js

**Include Chart.js:**
```html
<!-- Via CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- Or via npm -->
<!-- npm install chart.js -->
<!-- <script src="node_modules/chart.js/dist/chart.umd.min.js"></script> -->
```

### Heart Rate Time-Series Chart

```javascript
// daily-view.js
async function renderHeartRateChart(measurements) {
  const ctx = document.getElementById('heartRateChart').getContext('2d');

  // Prepare data
  const timeLabels = measurements.map(m => formatTime(m.timestamp));
  const heartRateData = measurements.map(m => m.heartRate);

  // Create chart
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [{
        label: 'Heart Rate (bpm)',
        data: heartRateData,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#e74c3c',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Heart Rate: ${context.parsed.y} bpm`;
            }
          }
        },
        title: {
          display: true,
          text: 'Heart Rate Throughout the Day'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 50,
          max: 120,
          ticks: {
            stepSize: 10
          },
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
      }
    }
  });

  return chart;
}

// Helper function
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
```

### Weekly Summary Chart

```javascript
// weekly-summary.js
async function renderWeeklySummaryChart(summaryData) {
  const ctx = document.getElementById('weeklySummaryChart').getContext('2d');

  // Group data by day
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const avgHeartRates = [72, 68, 75, 71, 69, 73, 70]; // Example data
  const avgSpO2 = [98, 97, 98, 97, 98, 98, 97]; // Example data

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Avg Heart Rate (bpm)',
          data: avgHeartRates,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          yAxisID: 'y-hr',
          tension: 0.3
        },
        {
          label: 'Avg SpO2 (%)',
          data: avgSpO2,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          yAxisID: 'y-spo2',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Weekly Average Trends'
        }
      },
      scales: {
        'y-hr': {
          type: 'linear',
          position: 'left',
          min: 50,
          max: 120,
          title: {
            display: true,
            text: 'Heart Rate (bpm)'
          }
        },
        'y-spo2': {
          type: 'linear',
          position: 'right',
          min: 90,
          max: 100,
          title: {
            display: true,
            text: 'SpO2 (%)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });

  return chart;
}
```

### Responsive Chart Container

```html
<div class="chart-container">
  <canvas id="heartRateChart"></canvas>
</div>
```

```css
.chart-container {
  position: relative;
  height: 300px;
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
}

@media (min-width: 768px) {
  .chart-container {
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .chart-container {
    height: 500px;
  }
}
```

## Resources

### Documentation
- [Chart.js Official Docs](https://www.chartjs.org/docs/latest/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs - LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [JWT Introduction](https://jwt.io/introduction)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### Libraries & Tools
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Font Awesome](https://fontawesome.com/) - Icons (optional)
- [Google Fonts](https://fonts.google.com/) - Typography
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

### Design Resources
- [Material Design](https://material.io/design) - Design system inspiration
- [Dribbble](https://dribbble.com/) - UI/UX inspiration
- [Coolors](https://coolors.co/) - Color palette generator
- [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### Testing Tools
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [WAVE](https://wave.webaim.org/) - Accessibility checker
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance testing

## Security Considerations

1. **JWT Token Storage**
   - Store in localStorage (acceptable for client-side apps)
   - Clear token on logout
   - Handle token expiration gracefully
   - Never expose token in URLs

2. **Input Validation**
   - Validate all form inputs (client-side)
   - Sanitize user inputs before display
   - Use proper input types (email, password, etc.)
   - Implement CSRF protection (server-side)

3. **HTTPS**
   - Use HTTPS for all API calls (especially in production)
   - Ensure backend API uses HTTPS (ECE 513)
   - Check for mixed content warnings

4. **API Key Handling**
   - Never store device API keys in frontend code
   - Display API keys only once during device registration
   - Mask API keys when displaying
   - Provide copy-to-clipboard functionality

5. **CORS Configuration**
   - Ensure backend CORS allows frontend origin
   - Use specific origins, not wildcard (*)
   - Handle preflight requests

## Troubleshooting

### CORS Errors
```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin
'http://localhost:8080' has been blocked by CORS policy
```
**Solution:** Configure backend CORS to allow your frontend origin.

### JWT Token Expired
```javascript
// Detect expired token and redirect to login
if (response.status === 401) {
  localStorage.removeItem('jwt_token');
  window.location.href = 'login.html';
}
```

### Chart Not Rendering
- Check if Chart.js script is loaded
- Verify canvas element exists in HTML
- Check for JavaScript errors in console
- Ensure data is in correct format
- Verify container has explicit height

### LocalStorage Not Working
- Check if browser allows localStorage
- Check for private/incognito mode
- Verify domain/origin is consistent
- Check browser storage settings

### Mobile Display Issues
- Use viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Test with browser dev tools device emulation
- Test on real devices
- Check media queries syntax

## Performance Optimization

1. **Minimize HTTP Requests**
   - Combine CSS files in production
   - Combine JavaScript files in production
   - Use CSS sprites or SVG icons

2. **Optimize Images**
   - Use appropriate image formats (PNG, SVG, WebP)
   - Compress images
   - Use responsive images

3. **Lazy Load Charts**
   - Initialize charts only when user navigates to page
   - Destroy charts when leaving page
   - Cache chart data to avoid re-fetching

4. **Cache API Responses**
   - Store frequently accessed data in memory
   - Use localStorage for semi-persistent data
   - Implement cache invalidation

5. **Code Optimization**
   - Minify JavaScript and CSS for production
   - Remove unused code
   - Use efficient DOM manipulation
   - Debounce user inputs

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

**Last Updated:** 2025-10-20
