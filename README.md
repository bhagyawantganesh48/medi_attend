# Smart Internship Attendance Tracker

A full-stack, production-ready attendance tracking system that **automatically logs attendance** based on company WiFi connection.

## Architecture

```
[Python Agent on Laptop]
  └─ Checks WiFi SSID every 60 seconds
  └─ POST /heartbeat → Google Apps Script Web App
         └─ Reads/Writes Google Sheet
                └─ GET /attendance → React Dashboard
                                       └─ Hosted on Vercel
```

## Features

- ✅ Automatic attendance via WiFi detection (no manual check-in)
- ✅ Real-time online/offline status with live indicator
- ✅ IN/OUT time tracking with auto-offline after 5 minutes
- ✅ Excel (.xlsx) and CSV export
- ✅ Calendar heatmap view
- ✅ Monthly summary with attendance percentage
- ✅ Dark mode toggle
- ✅ Admin view (see all employees)
- ✅ Search, filter, sort, and paginate records
- ✅ Print attendance records

## Project Structure

```
attendance-tracker/
├── frontend/              # React + Vite + Tailwind
├── backend-appscript/     # Google Apps Script (Code.gs)
├── python-agent/          # Python WiFi detection agent
└── docs/                  # Setup and deployment guides
```

## Quick Start

### 1. Set up Google Sheet + Apps Script

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

### 2. Configure the Python Agent

```bash
cd python-agent
pip install -r requirements.txt
# Edit config.py: set COMPANY_WIFI, USER_NAME, API_URL
python agent.py --test   # Test connectivity
python agent.py          # Run the agent
```

### 3. Run the Frontend Locally

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: set VITE_API_URL
npm run dev
```

### 4. Deploy to Vercel

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

## Credentials

| User   | Password    | Role  |
|--------|-------------|-------|
| Ganesh | password123 | User  |
| Friend | password123 | User  |
| admin  | admin123    | Admin |

> ⚠️ Change these in `frontend/src/context/AuthContext.jsx` before deploying.

## Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 18, Vite, Tailwind |
| Backend  | Google Apps Script       |
| Database | Google Sheets            |
| Agent    | Python 3.10+             |
| Hosting  | Vercel (free tier)       |

## License

MIT
