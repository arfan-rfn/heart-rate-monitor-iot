# Heart Rate Monitor IoT - Project Breakdown Strategy

**Created:** 2025-10-20
**Course:** ECE 413/513 Final Project

## Overview

This document outlines the strategic breakdown of the Heart Track IoT Heart Rate Monitoring system into three independent yet interconnected projects. This modular approach allows for parallel development, clear separation of concerns, and easier debugging and maintenance.

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HEART TRACK SYSTEM                        │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PROJECT 1   │  │  PROJECT 2   │  │  PROJECT 3   │
│              │  │              │  │              │
│ IoT Device & │  │   Backend    │  │     Web      │
│   Firmware   │  │   Server &   │  │ Application  │
│              │  │     API      │  │   Frontend   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## The Three Projects

### Project 1: IoT Device & Firmware
**Location:** `/iot`
**Focus:** Particle Photon device firmware and sensor integration

**Responsibilities:**
- MAX30102 sensor integration
- Heart rate and SpO2 measurement
- State machine implementation
- LED visual feedback
- Local data storage (24-hour buffer)
- Wi-Fi connectivity and data transmission
- Periodic measurement scheduling
- Configuration synchronization with server

### Project 2: Backend Server & API
**Location:** `/api-server`
**Focus:** RESTful API, database, and business logic

**Responsibilities:**
- Node.js/Express server implementation
- MongoDB database schema and operations
- RESTful API endpoints
- Token-based authentication (JWT)
- User and device management
- Data aggregation and analytics
- Physician portal (ECE 513)
- HTTPS implementation (ECE 513)
- Device configuration management
- API key validation for IoT devices

### Project 3: Web Application Frontend
**Location:** `/web`
**Focus:** Responsive user interface and data visualization

**Responsibilities:**
- Responsive design (desktop, tablet, mobile)
- User authentication UI
- Dashboard with weekly summary view
- Detailed daily view with charts
- Device management interface
- Measurement scheduling configuration
- Account management
- Physician portal UI (ECE 513)
- Reference and index pages

## Integration Points

### Device ↔ Server
- **Endpoint:** POST `/api/measurements`
- **Authentication:** API Key
- **Data Format:** JSON with deviceId, heartRate, spO2, timestamp
- **Device Config:** GET `/api/devices/{deviceId}/config`

### Server ↔ Frontend
- **Authentication:** JWT tokens
- **Endpoints:** RESTful API for all operations
- **Real-time Updates:** Polling or WebSocket (optional)

## Development Strategy

### Phase 1: Foundation (Milestone - Nov 21)
1. **Project 1:** Basic sensor reading, fixed 30-min schedule
2. **Project 2:** User accounts, device registration, basic endpoints
3. **Project 3:** Login page, basic data display

### Phase 2: Core Features
1. **Project 1:** State machine, LED feedback, Wi-Fi handling
2. **Project 2:** Full CRUD operations, data aggregation
3. **Project 3:** Charts, weekly/daily views, responsive design

### Phase 3: Advanced Features
1. **Project 1:** Local storage, measurement accuracy algorithm
2. **Project 2:** Physician portal (513), HTTPS (513)
3. **Project 3:** Device configuration UI, physician portal UI (513)

### Phase 4: Polish & Extra Credit
1. **Project 2:** LLM Health Assistant backend (RAG implementation)
2. **Project 3:** Chat interface for AI assistant
3. **All:** Documentation, videos, final testing

## Technology Stack

### Project 1 (IoT Device)
- **Platform:** Particle Photon
- **Language:** C++ (Particle firmware)
- **Sensor:** MAX30102 (I2C)
- **Libraries:**
  - Particle Device OS
  - MAX30102 driver library
  - EEPROM for local storage

### Project 2 (Backend)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt, helmet, express-rate-limit
- **HTTPS:** Let's Encrypt SSL (ECE 513)
- **Extra Credit:** Ollama with RAG pattern

### Project 3 (Frontend)
- **Core:** HTML5, CSS3, JavaScript (ES6+)
- **Charting:** Chart.js or D3.js
- **Responsive:** CSS Grid, Flexbox, Media Queries
- **Framework:** Vanilla JS or lightweight framework
- **HTTP Client:** Fetch API

## Testing Strategy

### Project 1
- Unit tests for sensor reading functions
- State machine validation
- Wi-Fi connection handling tests
- Local storage persistence tests

### Project 2
- API endpoint tests (Jest + Supertest)
- Database operation tests
- Authentication/authorization tests
- Data aggregation accuracy tests

### Project 3
- Cross-browser testing
- Responsive design testing (multiple devices)
- User flow testing
- Chart rendering tests

## Documentation Requirements

Each project will have its own detailed README with:

1. **Setup Instructions**
   - Prerequisites
   - Installation steps
   - Configuration
   - Environment variables

2. **Architecture**
   - Component diagram
   - Data flow
   - State management

3. **API Documentation** (Project 2)
   - Endpoint descriptions
   - Request/response formats
   - Error codes
   - Authentication requirements

4. **User Guide** (Project 3)
   - Feature walkthrough
   - Screenshots

5. **Development Guide**
   - Code structure
   - Contribution guidelines
   - Testing procedures

6. **Integration Guide**
   - How to connect projects
   - Configuration requirements
   - Troubleshooting

## Team Collaboration

### Recommended Division
- **Team Member 1:** Project 1 (IoT Device) + Integration Testing
- **Team Member 2:** Project 2 (Backend Server) + Database Design
- **Team Member 3:** Project 3 (Frontend) + UI/UX Design

### Communication Touchpoints
- Daily standups (async or sync)
- Integration testing sessions
- Code reviews via Git
- Shared documentation updates

## Deliverables

### Each Project Contains:
1. Source code in respective directory
2. Detailed README.md with TODO list
3. Configuration files (.env.example)
4. Dependencies (package.json for JS projects)
5. Documentation folder with guides

### Master Project Contains:
1. Integration plan (this document)
2. Combined README at root
3. Project pitch video
4. Demonstration video
5. Complete documentation
6. Git repository with all three projects

## Timeline

- **Week 1-2:** Project setup, basic implementation
- **Week 3:** Milestone submission (Nov 21)
- **Week 4-5:** Core feature development
- **Week 6:** Advanced features, ECE 513 requirements
- **Week 7:** Polish, testing, documentation
- **Week 8:** Video creation, final submission (Dec 15)

## Success Criteria

### Project 1 Success
- ✅ Sensor readings accurate and stable
- ✅ State machine handles all scenarios
- ✅ LED feedback works correctly
- ✅ Local storage reliable
- ✅ Data transmission successful

### Project 2 Success
- ✅ All API endpoints documented and working
- ✅ Authentication secure
- ✅ Database operations efficient
- ✅ Data aggregation accurate
- ✅ Physician portal functional (ECE 513)

### Project 3 Success
- ✅ Responsive on all devices
- ✅ Charts display data correctly
- ✅ User flows intuitive
- ✅ All features accessible
- ✅ Professional appearance

### Integration Success
- ✅ Device sends data to server reliably
- ✅ Frontend displays real-time data
- ✅ Configuration changes propagate to device
- ✅ System handles errors gracefully
- ✅ All requirements met

## Risk Management

### Technical Risks
1. **Sensor accuracy:** Implement averaging algorithm, calibration
2. **Wi-Fi connectivity:** Local storage buffer, retry logic
3. **Database performance:** Indexing, query optimization
4. **HTTPS setup:** Use Certbot, thorough testing

### Project Risks
1. **Timeline:** Start early, prioritize core features
2. **Integration issues:** Regular integration testing
3. **Team coordination:** Clear communication protocols
4. **Scope creep:** Stick to requirements, extras only if time permits

## References

- Project Description Document: ECE 413/513 Final Project Description 2025.pdf
- Particle Photon Documentation: https://docs.particle.io/
- Express.js Best Practices: https://expressjs.com/
- MongoDB Schema Design: https://mongoosejs.com/
- Chart.js Documentation: https://www.chartjs.org/
