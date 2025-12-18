# Heart Track - IoT Heart Rate Monitoring System

**ECE 413/513 Final Project**

A comprehensive IoT system for monitoring heart rate and blood oxygen saturation throughout the day using a Particle Photon device, Node.js backend, and responsive web application.

## Hosted Links
- Frontend: https://heart-rate-monitor-iot-6z2z.vercel.app/
- Backend: https://heart-rate-monitor-iot.vercel.app
- Backend Health Check: https://heart-rate-monitor-iot.vercel.app/health

---

## 📋 Project Overview

Heart Track is a low-cost, IoT-enabled health monitoring platform that:
- Periodically measures heart rate and SpO2 using a MAX30102 sensor
- Stores measurements in a MongoDB database
- Provides web-based visualization and analytics
- Supports physician monitoring (ECE 513)
- Features AI health assistant (Extra Credit)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HEART TRACK SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   PROJECT 1      │         │   PROJECT 2      │         │   PROJECT 3      │
│                  │         │                  │         │                  │
│  IoT Device      │────────>│  Backend API     │<────────│  Web Frontend    │
│  & Firmware      │  HTTPS  │  (Node.js)       │  HTTPS  │  (HTML/CSS/JS)   │
│                  │<────────│                  │────────>│                  │
│  Particle Photon │         │  MongoDB         │         │  Responsive UI   │
│  MAX30102 Sensor │         │  Express Server  │         │  Chart.js        │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## 📁 Project Structure

This repository contains **three separate sub-projects**, each with its own comprehensive README and TODO list:

```
heart-rate-monitor-iot/
├── README.md                          # This file - Master overview
├── plan/
│   └── project-breakdown.md           # Detailed breakdown strategy
│
├── iot/                               # PROJECT 1: IoT Device & Firmware
│   ├── README.md                      # ⭐ Detailed README with TODO list
│   ├── src/                           # Particle Photon firmware
│   ├── docs/                          # Hardware setup, state machine
│   └── test/                          # Unit tests
│
├── api-server/                        # PROJECT 2: Backend Server & API
│   ├── README.md                      # ⭐ Detailed README with TODO list
│   ├── package.json                   # Node.js dependencies
│   ├── server.js                      # Entry point
│   ├── src/                           # Routes, models, controllers
│   ├── tests/                         # Unit & integration tests
│   └── docs/                          # API documentation
│
└── web/                               # PROJECT 3: Web Application Frontend
    ├── README.md                      # ⭐ Detailed README with TODO list
    ├── index.html                     # Team & project intro page
    ├── references.html                # Third-party credits
    ├── css/                           # Stylesheets
    ├── js/                            # JavaScript files
    ├── assets/                        # Images, icons
    └── docs/                          # UI/UX documentation
```

---

## 🎯 Three-Project Breakdown

### Project 1: IoT Device & Firmware
**Location:** [`/iot`](./iot)
**Focus:** Particle Photon firmware and MAX30102 sensor integration

**Key Responsibilities:**
- Heart rate and SpO2 measurement
- State machine for measurement workflow
- LED visual feedback (blue/green/yellow)
- Local data storage (24-hour buffer)
- Wi-Fi connectivity and server communication
- Configurable scheduling (time-of-day, frequency)

**Tech Stack:** C++, Particle Device OS, MAX30102 library

**📖 See [`iot/README.md`](./iot/README.md) for detailed TODO list**

---

### Project 2: Backend Server & API
**Location:** [`/api-server`](./api-server)
**Focus:** RESTful API, authentication, and data management

**Key Responsibilities:**
- User authentication (JWT)
- Device registration and management
- Measurement data storage (MongoDB)
- Data aggregation (weekly summaries, daily views)
- Physician portal (ECE 513)
- HTTPS implementation (ECE 513)
- AI health assistant with RAG (Extra Credit)

**Tech Stack:** Node.js, Express, MongoDB, Mongoose, JWT, Ollama (LLM)

**📖 See [`api-server/README.md`](./api-server/README.md) for detailed TODO list**

---

### Project 3: Web Application Frontend
**Location:** [`/web`](./web)
**Focus:** Responsive user interface and data visualization

**Key Responsibilities:**
- Login/registration interface
- Dashboard with navigation
- Weekly summary view (avg, min, max heart rate)
- Daily detailed view with charts (Chart.js)
- Device management (add, remove, configure)
- Account settings
- Physician portal UI (ECE 513)
- AI chat interface (Extra Credit)
- Responsive design (mobile, tablet, desktop)

**Tech Stack:** HTML5, CSS3, JavaScript (ES6+), Chart.js

**📖 See [`web/README.md`](./web/README.md) for detailed TODO list**

---

## 🚀 Quick Start

### Prerequisites

Before starting, ensure you have:

1. **Hardware** (Project 1)
   - Particle Photon
   - MAX30102 sensor
   - Breadboard, jumper wires
   - Micro USB cable

2. **Software**
   - Node.js v18+ (Projects 2 & 3)
   - MongoDB (Project 2)
   - Particle CLI or Web IDE (Project 1)
   - Modern web browser (Project 3)

3. **Accounts**
   - Particle account (for device)
   - MongoDB Atlas account (optional, for cloud DB)
   - AWS account (for deployment)

### Installation by Project

Each project has its own setup process. Follow the README in each directory:

#### 1. Set up Backend Server (Project 2)
```bash
cd api-server/
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 2. Set up IoT Device (Project 1)
```bash
cd iot/
# Follow hardware assembly guide in iot/docs/
# Configure Wi-Fi and server URL
particle flash your-device-name src/
```

#### 3. Set up Web Frontend (Project 3)
```bash
cd web/
# Open index.html in browser, or use local server:
npx http-server -p 8080
```

### Complete System Integration

1. **Start Backend Server** (Project 2)
   ```bash
   cd api-server/ && npm run dev
   ```

2. **Flash IoT Device** (Project 1)
   - Device will connect to server and start sending data

3. **Open Web App** (Project 3)
   - Navigate to http://localhost:8080
   - Register account, add device, view measurements

---

## 📝 Requirements Checklist

### Core Requirements (Both ECE 413 & 513)

- [ ] **Hardware**
  - [ ] Particle Photon with MAX30102 sensor
  - [ ] Periodic measurement reminders (LED flash)
  - [ ] State machine implementation
  - [ ] Local storage (24 hours offline)
  - [ ] Configurable scheduling

- [ ] **Backend**
  - [ ] Node.js + Express + MongoDB
  - [ ] RESTful API with documentation
  - [ ] Token-based authentication (JWT)
  - [ ] Device registration and management
  - [ ] Measurement data storage

- [ ] **Frontend**
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] Login/logout interface
  - [ ] Weekly summary view (avg, min, max)
  - [ ] Daily detailed view with charts
  - [ ] Device configuration UI
  - [ ] index.html (team introduction)
  - [ ] references.html (third-party credits)

- [ ] **Integration**
  - [ ] Device → Server communication
  - [ ] Server → Frontend API
  - [ ] End-to-end data flow

### ECE 513 Additional Requirements

- [ ] **HTTPS Implementation**
  - [ ] SSL certificates (Let's Encrypt)
  - [ ] Server configured for HTTPS

- [ ] **Physician Portal**
  - [ ] Physician registration
  - [ ] Patient-physician association
  - [ ] All-patient view with summaries
  - [ ] Patient detail views
  - [ ] Physician can adjust measurement frequency

### Extra Credit (+5 pts)

- [ ] **AI Health Assistant**
  - [ ] Local LLM (Ollama) with RAG pattern
  - [ ] Chat interface in web app
  - [ ] Responses based only on user's data
  - [ ] Documentation of implementation

---

## 📅 Project Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | Setup & Basic Implementation | Project structure, basic functionality |
| 3 | **Milestone (Nov 21)** | Basic measurement, server, web page |
| 4-5 | Core Features | State machine, API endpoints, charts |
| 6 | Advanced Features | Configuration, physician portal (513) |
| 7 | Polish & Testing | Documentation, testing, optimization |
| 8 | **Final Submission (Dec 15)** | All features, videos, documentation |

### Key Dates

- **November 21, 11:59 PM:** Milestone submission (+3 pts extra credit)
- **December 15, 11:59 PM:** Final project due
- **December 17, 11:59 PM:** Late submission deadline (-10 pts)
- **December 19:** Server must remain accessible

---

## 🎥 Submission Requirements

### Required Deliverables

1. **Git Repository**
   - All three projects
   - README files with setup instructions
   - No node_modules (use .gitignore)

2. **Videos**
   - **5-minute Pitch Video:** Sell Heart Track to investors
   - **15-20 minute Demo Video:**
     - 7-10 min: User experience walkthrough
     - 7-10 min: Code implementation discussion

3. **Documentation**
   - Project description (backend, frontend, device)
   - File descriptions
   - Results with screenshots
   - Lessons learned (5+ points)
   - Challenges faced (5+ points)
   - Team contribution table
   - References

4. **Login Credentials**
   - User account with recent data
   - Physician account (ECE 513)

5. **Live Server**
   - Accessible AWS deployment
   - Must stay up until Dec 19

---

## 🧪 Testing

Each project has its own testing strategy:

### Project 1 (IoT Device)
```bash
# Hardware tests
# State machine validation
# Network communication tests
```

### Project 2 (Backend)
```bash
cd api-server/
npm test                    # All tests
npm run test:coverage       # With coverage
```

### Project 3 (Frontend)
- Manual browser testing
- Responsive design testing
- Cross-browser compatibility
- Accessibility testing (WCAG)

---

## 🔧 Development Workflow

### Working on Individual Projects

Each project can be developed independently:

```bash
# Work on IoT firmware
cd iot/
# Follow iot/README.md

# Work on backend
cd api-server/
# Follow api-server/README.md

# Work on frontend
cd web/
# Follow web/README.md
```

### Integration Points

**Device → Server:**
- Endpoint: `POST /api/measurements`
- Auth: API key in `X-API-Key` header

**Server → Frontend:**
- All endpoints use JWT in `Authorization: Bearer <token>`
- RESTful API with JSON responses

**Configuration Sync:**
- Device polls `GET /api/devices/{deviceId}/config`
- Frontend updates via `PUT /api/devices/{deviceId}/config`

---

## 🛠️ Technology Stack Summary

| Component | Technologies |
|-----------|-------------|
| **IoT Device** | C++, Particle Device OS, MAX30102 Library |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt |
| **Frontend** | HTML5, CSS3, JavaScript ES6+, Chart.js |
| **Deployment** | AWS EC2, Let's Encrypt SSL (513), PM2 |
| **Testing** | Jest, Supertest (backend), Manual (frontend/device) |
| **Extra Credit** | Ollama, phi-3:mini/gemma:2b/llama3:8b, ngrok |

---

## 📚 Documentation

### Project-Specific Documentation

Each project has extensive documentation:

- **Project 1 (IoT):**
  - Hardware setup guide
  - State machine documentation
  - API protocol specification
  - Troubleshooting guide

- **Project 2 (Backend):**
  - API endpoint documentation
  - Database schema
  - Authentication flow
  - Deployment guide

- **Project 3 (Frontend):**
  - UI/UX design docs
  - Component documentation
  - Chart implementation
  - Responsive design guide

### Master Documentation

- [`plan/project-breakdown.md`](./plan/project-breakdown.md) - Detailed project breakdown strategy

---

## 🎨 Team Organization

### Recommended Division of Work

**Option 1: By Project**
- Team Member 1: Project 1 (IoT Device)
- Team Member 2: Project 2 (Backend Server)
- Team Member 3: Project 3 (Frontend Web App)

**Option 2: By Layer**
- Team Member 1: Data layer (DB schema, models)
- Team Member 2: Logic layer (firmware, API controllers)
- Team Member 3: Presentation layer (UI, charts)

**Shared Responsibilities:**
- Integration testing
- Documentation
- Video creation
- Deployment

---

## 🐛 Troubleshooting

### Common Issues

**Device not connecting to Wi-Fi:**
- Check SSID and password
- Ensure 2.4GHz network
- See `iot/README.md` troubleshooting section

**Backend server won't start:**
- Check MongoDB is running
- Verify `.env` configuration
- See `api-server/README.md` troubleshooting section

**Frontend can't connect to API:**
- Check CORS settings in backend
- Verify API URL in frontend config
- See `web/README.md` troubleshooting section

**Integration issues:**
- Verify API key format
- Check JWT token expiration
- Review network logs

---

## 🔒 Security Considerations

1. **Passwords:** Hashed with bcrypt (10 salt rounds)
2. **JWT Tokens:** 24-hour expiration, secure secret
3. **API Keys:** Cryptographically secure random generation
4. **HTTPS:** Let's Encrypt SSL (ECE 513)
5. **Input Validation:** All user inputs sanitized
6. **CORS:** Configured for allowed origins only
7. **Rate Limiting:** Prevent abuse

---

## 📊 Grading Rubric (35 points)

| Item | ECE 413 | ECE 513 | Description |
|------|---------|---------|-------------|
| AWS Running | 1 | 1 | Server accessible |
| Index.html | 1 | 1 | Team introduction page |
| Project Info | 1 | 1 | Project description |
| Team Info | 1 | 1 | Photos, emails |
| Sign in/up | 2 | 1 | Authentication UI |
| Strong Password | 3 | 2 | Salted hash |
| Device Registration | 1 | 1 | Register devices |
| Reading Data | 1 | 1 | Sensor measurements |
| Periodic Reading | 2 | 2 | Every 30 min (state machine) |
| README | 2 | 2 | Complete documentation |
| Git Repo | 2 | 2 | Well-organized repository |
| Pitch Video | 3 | 3 | 5-minute investor pitch |
| Code Style | 2 | 2 | Comments, formatting |
| Responsive | 1 | 1 | Mobile support |
| Demo Video | 1 | 1 | 15-20 minute demonstration |
| Code Submission | 1 | 1 | All code files |
| Local Storage | 3 | 2 | 24-hour offline buffer |
| Charts | 1 | 1 | Data visualization |
| Localhost | 1 | 1 | Local demo |
| HTTPS | - | 3 | SSL implementation |
| Documentation | 5 | 5 | Project documentation |
| **Extra Credit** | | | |
| LLM Assistant | +5 | +5 | AI health assistant |
| Milestone | +3 | +3 | Nov 21 submission |
| **Penalty** | | | |
| Late Submission | -10 | -10 | Dec 17 deadline |

---

## 🌟 Extra Features (Optional)

Beyond the requirements, consider:

- **Project 1:**
  - Heart rate variability (HRV) calculation
  - Irregular heartbeat detection
  - Battery monitoring (if battery-powered)

- **Project 2:**
  - Email notifications for abnormal readings
  - Data export (CSV, PDF)
  - Admin dashboard

- **Project 3:**
  - Dark mode
  - Multiple chart types
  - Progressive Web App (PWA)
  - Real-time updates (WebSocket)

---

## 📖 Resources

### Documentation
- [Project Description PDF](./ECE%20413%20513%20Final%20Project%20Description%202025.pdf)
- [Particle Photon Docs](https://docs.particle.io/photon/)
- [Express.js Guide](https://expressjs.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [MongoDB Manual](https://docs.mongodb.com/)

### Tutorials
- [GitHub Tutorial](https://www.youtube.com/watch?v=iv8rSLsi1xo)
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/)
- [JWT Authentication](https://jwt.io/introduction)

### Hardware
- [MAX30102 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX30102.pdf)
- [I2C Protocol](https://learn.sparkfun.com/tutorials/i2c)

---

## 🤝 Contributing

### Team Workflow

1. **Create feature branches:**
   ```bash
   git checkout -b feature/project1-state-machine
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "Implement state machine for IoT device"
   ```

3. **Push and create pull request:**
   ```bash
   git push origin feature/project1-state-machine
   ```

4. **Review and merge**

---

## 📞 Support

For project-related questions:
- **TA:** [Contact via course email]
- **Documentation:** Check individual project READMEs
- **Issues:** Use GitHub Issues in repository

---

## ✅ Final Checklist

Before submission:

- [ ] All three projects implemented
- [ ] All requirements met (see checklist above)
- [ ] Git repository clean and organized
- [ ] README files complete with TODO lists
- [ ] Videos created (pitch + demo)
- [ ] Documentation complete
- [ ] Server deployed and accessible
- [ ] Code well-commented
- [ ] Login credentials provided
- [ ] Third-party references listed
- [ ] Tested end-to-end

---

## 📜 License

[Specify your license - e.g., MIT, Apache 2.0]

---

## 👥 Team Members

| Name | Email | Role | Photo |
|------|-------|------|-------|
| [Name 1] | email1@example.com | IoT Device | [Photo] |
| [Name 2] | email2@example.com | Backend | [Photo] |
| [Name 3] | email3@example.com | Frontend | [Photo] |

---

## 📝 Changelog

### Version 0.1.0 - Initial Setup
- Project structure created
- Three sub-projects organized
- README files with TODO lists

### Version 0.2.0 - Milestone (Nov 21)
- Basic IoT measurements
- Server with device registration
- Simple web page

### Version 1.0.0 - Final Release (Dec 15)
- All requirements implemented
- ECE 513 features complete
- Extra credit features (if applicable)
- Full documentation
- Deployment complete

---

**Last Updated:** 2025-10-20

---

## 🎯 Next Steps

1. **Read each project's README:**
   - [`iot/README.md`](./iot/README.md)
   - [`api-server/README.md`](./api-server/README.md)
   - [`web/README.md`](./web/README.md)

2. **Review the project breakdown strategy:**
   - [`plan/project-breakdown.md`](./plan/project-breakdown.md)

3. **Set up development environment:**
   - Install prerequisites for all three projects

4. **Start with Project 2 (Backend):**
   - This is the central hub that both device and frontend depend on

5. **Begin coding:**
   - Follow the TODO lists in each project README
   - Start with milestone requirements first

**Good luck with your Heart Track project! 🚀❤️**
