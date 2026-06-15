# Python Agent — README

## What It Does

The Python agent runs silently in the background on your Windows laptop.

Every **60 seconds**, it:
1. Checks which WiFi network you're connected to
2. If the SSID matches `COMPANY_WIFI` in `config.py`, it sends a "heartbeat" to the Google Apps Script API
3. The API creates or updates your attendance record in Google Sheets

## Files

| File             | Purpose                                |
|------------------|----------------------------------------|
| `agent.py`       | Main agent script                      |
| `config.py`      | Configuration (WiFi name, API URL, etc.) |
| `requirements.txt` | Python dependencies                  |
| `install.bat`    | Windows auto-start setup               |

## Setup

### 1. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure

Edit `config.py`:

```python
COMPANY_WIFI = "Office_Wifi"    # ← Your exact WiFi SSID (case-sensitive)
USER_NAME = "Ganesh"            # ← Your name (must match the dashboard)
DEVICE_NAME = "Laptop1"         # ← Any label for your device
API_URL = "https://..."         # ← Your Apps Script URL
```

### 3. Test

```bash
python agent.py --test
```

### 4. Run

```bash
python agent.py
```

Press `Ctrl+C` to stop.

### 5. Auto-start (Windows)

Right-click `install.bat` → **Run as Administrator**

This creates a Task Scheduler job that runs the agent at every Windows login.

## Finding Your WiFi SSID

On Windows, open Command Prompt and run:

```cmd
netsh wlan show interfaces
```

Look for the `SSID` line (not BSSID). Copy the exact value into `config.py`.

## Log File

The agent writes to `attendance_agent.log` in the same folder.
Old logs are automatically rotated daily (keeps 7 days).

Example log output:
```
2026-06-15 09:02:14 [INFO] 📶 Connected to 'Office_Wifi' — sending heartbeat...
2026-06-15 09:02:15 [INFO] ✅ Heartbeat OK [created]: Attendance started for Ganesh at 09:02:14
2026-06-15 09:03:15 [INFO] 📶 Connected to 'Office_Wifi' — sending heartbeat...
2026-06-15 09:03:15 [INFO] ✅ Heartbeat OK [updated]: Heartbeat recorded for Ganesh at 09:03:15
```

## Stopping the Agent

- **Running manually**: Press `Ctrl+C` in the terminal
- **Running via Task Scheduler**: Open Task Scheduler → Find "SmartAttendanceAgent" → Right-click → End

## Uninstalling Auto-Start

```cmd
schtasks /delete /tn "SmartAttendanceAgent" /f
```
