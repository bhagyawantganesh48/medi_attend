# ─────────────────────────────────────────────────────────────────
# Smart Internship Attendance Tracker — Python Agent
# Configuration File
#
# Edit this file before running the agent.
# ─────────────────────────────────────────────────────────────────

# ── WiFi Settings ─────────────────────────────────────────────────
# The exact SSID of your company/office WiFi network.
# The agent will only send heartbeats when connected to this network.
COMPANY_WIFI = "GROWTH"        # ✅ Your office WiFi name

# ── User Identity ─────────────────────────────────────────────────
# Your name as it will appear in the attendance sheet.
USER_NAME = "Ganesh"           # Change to "Parth" on Parth's laptop

# The identifier for this laptop (useful if multiple devices exist).
DEVICE_NAME = "Ganesh-Laptop"  # e.g. "Ganesh-Laptop", "Parth-PC"

# ── Google Apps Script API ─────────────────────────────────────────
# Paste the deployed Web App URL from Google Apps Script here.
# Format: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"  # ← Paste your URL here

# ── Agent Behavior ────────────────────────────────────────────────
# How often (in seconds) the agent checks WiFi and sends a heartbeat.
HEARTBEAT_INTERVAL_SECONDS = 60

# ── Logging ──────────────────────────────────────────────────────
# Log file path. Logs are rotated daily.
LOG_FILE = "attendance_agent.log"

# ── Offline Threshold ─────────────────────────────────────────────
# This should match the Apps Script CONFIG.OFFLINE_THRESHOLD_MINUTES.
# It's informational only — the backend handles the offline detection.
OFFLINE_THRESHOLD_MINUTES = 5
