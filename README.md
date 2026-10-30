# SHEGUARD — Women's Safety & Emergency Assistance Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**SHEGUARD** is a women's personal safety and emergency assistance web application tailored specifically for India. Designed with a mobile-first, high-contrast user interface, SHEGUARD delivers immediate, reliable safety tooling during moments of distress:
- **5-Second Countdown Emergency SOS** with false-alarm cancellation.
- **Time-Limited Live Location Sharing** using secure, access-controlled random tokens.
- **Trusted Contacts Safety Network** with delivery status tracking (`pending`, `sent`, `failed`, `acknowledged`).
- **One-Touch 112 Speed Dial** integrating India's National Emergency Response Support System (ERSS).
- **Safety Arrival Timer** with scheduled check-in and automated contact escalation.
- **Simulated Fake Call Escape Tool** to gracefully excuse yourself from uncomfortable interactions.
- **Interactive Safety Map** powered by Leaflet and OpenStreetMap showing nearby police stations and hospitals.
- **Verified Legal Rights & Resources** explaining Zero FIR, CrPC Section 46, POSH Act, and 24/7 national helplines.

---

## 1. Project Architecture

The repository is organized into distinct frontend and backend directories:

```
sheguard/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Centralized REST API client
│   │   ├── components/
│   │   │   ├── common/         # Navbar, BottomNav, Sidebar, DemoBadge
│   │   │   ├── fakecall/       # FakeCallModal simulated call interface
│   │   │   ├── map/            # LeafletMap component with SVG DivIcons
│   │   │   └── sos/            # SOSButton, CountdownOverlay, IncidentStatusCard
│   │   ├── context/            # AuthContext, EmergencyContext
│   │   ├── pages/              # Landing, Dashboard, Contacts, SafetyMap,
│   │   │                       # LiveTracking, PublicTrack, SafetyTimer,
│   │   │                       # EmergencyServices, FakeCall, SafetyResources, Profile
│   │   ├── utils/              # Audio synthesizer (Web Audio API), Geolocation helpers
│   │   └── test/               # Vitest component & workflow test suites
│   ├── vite.config.js          # Vite config with /api proxy & test configuration
│   └── tailwind.config.js      # Custom navy & coral emergency color palette
├── server/                     # Backend API Server (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection with embedded memory server fallback
│   ├── models/                 # User, Contact, Incident, LocationSession, SafetyTimer, NotificationLog
│   ├── middleware/             # JWT auth, rateLimiter, centralized errorHandler
│   ├── routes/                 # auth, contacts, incidents, location, timer, emergency
│   ├── services/               # notificationService, overpassService (OSM POIs)
│   ├── test/                   # Automated API integration test suite
│   ├── .env.example            # Environment variables template
│   └── server.js               # Express application entrypoint
└── README.md                   # Complete documentation
```

---

## 2. Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React icons, Leaflet 1.9 & OpenStreetMap Carto.
- **Backend**: Node.js 20+, Express.js 4, Mongoose 8.
- **Database**: MongoDB with automatic embedded in-memory database fallback (`mongodb-memory-server`) for development and testing without needing external services.
- **Authentication**: Stateless JSON Web Tokens (JWT) with password hashing via `bcryptjs` (salt rounds 10).
- **Security**: `helmet`, `cors`, `express-rate-limit` (brute-force protection on auth & emergency routes).
- **Audio & Haptics**: Native Web Audio API synthesis (alarm siren, countdown beeps, dual-tone phone ringtone) and Navigator Vibration API.
- **Testing**: Built-in `node:test` runner for backend API integration tests; `vitest` and `@testing-library/react` for frontend unit tests.

---

## 3. Quick Start & Execution

### Prerequisites
- Node.js (v18.0.0 or higher) and npm (v9.0.0 or higher).

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment
Copy the environment template in the `server` folder:
```bash
cd server
cp .env.example .env
```
*(If `MONGODB_URI` is left blank, SHEGUARD will automatically spin up an embedded in-memory MongoDB instance for local testing).*

### Step 3: Run the Servers

#### Start Backend API Server:
```bash
cd server
npm start
# Server listens at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

#### Start Frontend Client Dev Server:
In a separate terminal:
```bash
cd client
npm run dev
# Frontend is served at http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 4. Demo Mode (Zero Configuration Evaluation)

SHEGUARD includes a built-in **Demo Mode**:
1. Click the **"Explore Demo Mode (1-Click)"** button on the landing page or login screen.
2. An evaluation user profile (`Priya Sharma`) is instantly authenticated.
3. Three fictional emergency contacts (*Pooja Sharma*, *Dr. Rajesh Verma*, *Neha Patel*) are seeded automatically.
4. Alerts, phone dials, and notifications are simulated safely in user space—no real SMS fees are incurred and no emergency numbers are accidentally phoned.
5. A visible **`DEMO MODE ACTIVE`** badge is displayed throughout the application. You can toggle between Demo and Live Mode in the top navigation or under Profile Settings at any time.

---

## 5. Automated Testing

### Run Backend API Integration Tests
Tests user registration, duplicate email rejection, contact CRUD, SOS incident creation, live tracking tokens, session revocation, and emergency directories:
```bash
cd server
npm test
```
*Output: 10/10 tests passing.*

### Run Frontend Vitest & React Testing Library Tests
Tests SOS button rendering, 5-second countdown timer, false-alarm cancellation, and demo badges:
```bash
cd client
npm test
```
*Output: 3/3 tests passing.*

---

## 6. API Reference Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create new user account and seeds default contacts |
| `POST` | `/login` | Public | Authenticate with email/password and obtain JWT |
| `GET` | `/me` | Private | Retrieve current user profile and preferences |
| `PUT` | `/profile` | Private | Update name, medical notes, blood group, demo mode |
| `DELETE` | `/account` | Private | Permanently delete account and associated safety data |
| `POST` | `/demo/reset` | Private | Reset trusted contacts back to demo baseline |

### Trusted Contacts (`/api/contacts`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Private | Retrieve all trusted contacts for current user |
| `POST` | `/` | Private | Add new contact (name, phone, relationship, channel) |
| `PUT` | `/:id` | Private | Update contact details or toggle emergency recipient |
| `DELETE` | `/:id` | Private | Remove contact from safety network |
| `POST` | `/:id/test-alert` | Private | Dispatch a test alert notification to verify channel |

### Emergency SOS Incidents (`/api/incidents`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/sos` | Private | Trigger emergency incident, capture GPS, dispatch alerts |
| `GET` | `/active` | Private | Retrieve user's currently active emergency incident |
| `POST` | `/:id/cancel` | Private | Cancel false alarm or drill; revokes location token |
| `POST` | `/:id/resolve` | Private | Mark incident as safely resolved |
| `GET` | `/history` | Private | Retrieve past emergency activations |

### Live Location Tracking (`/api/location`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/start` | Private | Start a time-limited live location session (15m–2h) |
| `POST` | `/update` | Private | Append GPS coordinates to active session |
| `POST` | `/stop` | Private | Revoke and immediately terminate live sharing link |
| `GET` | `/active` | Private | Retrieve active sharing session for user |
| `GET` | `/track/:token` | **Public** | Access-controlled tracking page for authorized contacts |

### Safety Timer (`/api/timer`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/start` | Private | Start arrival timer with destination and deadline |
| `GET` | `/active` | Private | Retrieve active timer and auto-check overdue status |
| `POST` | `/checkin` | Private | Confirm safe arrival; concludes timer |
| `POST` | `/cancel` | Private | Cancel active trip timer |
| `POST` | `/escalate` | Private | Escalate overdue arrival to designated emergency contacts |

### Emergency Services & Facilities (`/api/emergency`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/services` | Public | Official 24/7 Indian emergency numbers directory |
| `GET` | `/nearby?lat=&lng=` | Public | Query nearby police and hospitals via Overpass API |

---

## 7. External Services Configuration

| Service | Environment Key | Default / Fallback Behavior |
|---|---|---|
| **MongoDB** | `MONGODB_URI` | Starts embedded `mongodb-memory-server` if blank |
| **SMS Gateway (Twilio)** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Dispatches in verified local simulation mode with delivery logs |
| **SMS Gateway (Fast2SMS)** | `FAST2SMS_API_KEY` | Dispatches in verified local simulation mode with delivery logs |
| **OpenStreetMap Overpass** | Direct HTTP query to `overpass-api.de` | Uses verified regional hospital & police directory if offline |
| **App Public URL** | `PUBLIC_APP_URL` | Defaults to `http://localhost:5173` |

---

## 8. Emergency Reliability & Privacy Disclosures

- **Explicit Action Required**: SHEGUARD uses device telephone links (`tel:112`). It never automatically initiates cellular phone calls without user confirmation.
- **Access-Controlled Location**: Live location is never made public. Only individuals with the unguessable 128-bit random token can access the tracking view.
- **Automatic Expiry**: Location tracking links expire automatically after the session duration (e.g. 30 minutes) and are permanently invalidated when the incident is resolved.
- **Browser Limitations**: Web browser timers may be throttled when a mobile browser tab is placed in the background or the device loses data connectivity. In an immediate physical threat, always dial **112** directly.
