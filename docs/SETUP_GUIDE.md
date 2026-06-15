# Setup Guide — Smart Internship Attendance Tracker

This guide walks you through setting up the Google Sheet, Apps Script API, Python agent, and frontend.

---

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it: **Smart Attendance Tracker**
3. In the first tab, rename the sheet tab to: **`Attendance`**
4. Add the following headers in **Row 1** (columns A–H):

   | A    | B    | C      | D       | E        | F         | G     | H      |
   |------|------|--------|---------|----------|-----------|-------|--------|
   | Date | Name | Device | IN Time | OUT Time | Last Seen | Hours | Status |

5. **Bold** the header row and set background to a color (optional — the Apps Script will do this automatically too).

6. Note the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

---

## Step 2: Deploy the Google Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete all existing code in the editor.
3. Open `backend-appscript/Code.gs` from this project.
4. **Copy and paste** the entire contents into the Apps Script editor.
5. Click **Save** (Ctrl+S).
6. Click **Deploy → New Deployment**.
7. Under "Select type", choose **Web App**.
8. Configure:
   - **Description**: `Attendance API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` ← **Important!**
9. Click **Deploy**.
10. **Copy the Web App URL** — it looks like:
    ```
    https://script.google.com/macros/s/AKfycby.../exec
    ```
11. Save this URL — you'll need it for both the frontend and Python agent.

> ⚠️ Every time you change `Code.gs`, you must create a **New Deployment** (not update) to get a fresh URL, or update the existing deployment version.

---

## Step 3: Configure the Python Agent

1. Navigate to `python-agent/` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Open `config.py` and update:
   ```python
   COMPANY_WIFI = "Your_Office_WiFi_Name"   # Exact SSID (case-sensitive)
   USER_NAME = "Ganesh"                      # Your name (Ganesh or Friend)
   DEVICE_NAME = "Ganesh-Laptop"            # Any device label
   API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
   ```
4. **Test the agent**:
   ```bash
   python agent.py --test
   ```
   You should see:
   ```
   [1] Current WiFi SSID : "Your_Office_WiFi_Name"
       Result             : ✅ MATCH
   [2] API URL: https://...
       Sending test heartbeat...
       Result: ✅ API is reachable and working!
   ```
5. **Run the agent** (it runs every 60 seconds):
   ```bash
   python agent.py
   ```

### Auto-Start on Windows Login

Run `install.bat` as **Administrator**:
```
Right-click install.bat → Run as administrator
```

This registers a Windows Task Scheduler job that starts the agent at every login.

---

## Step 4: Configure the Frontend

1. Navigate to `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env`:
   ```
   VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:5173](http://localhost:5173)

---

## Step 5: Test End-to-End

1. Connect your laptop to the company WiFi.
2. Run `python agent.py` (or let it auto-start).
3. Wait up to 60 seconds.
4. Open the frontend dashboard.
5. You should see:
   - ✅ Green "Online" status banner
   - ✅ Today's IN time populated
   - ✅ Live attendance row in the table

---

## Changing Credentials

User credentials are in `frontend/src/context/AuthContext.jsx`:

```javascript
const USERS = {
  Ganesh: { password: 'password123', role: 'user',  displayName: 'Ganesh' },
  Friend: { password: 'password123', role: 'user',  displayName: 'Friend' },
  admin:  { password: 'admin123',    role: 'admin', displayName: 'Admin'  },
}
```

Change the passwords before deploying to production.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent says "WiFi not detected" | Run as Administrator; check if `netsh` is available |
| API returns 404 | Redeploy Apps Script as Web App with "Anyone" access |
| Frontend shows no data | Check `VITE_API_URL` in `.env`; check browser console |
| CORS errors | Apps Script automatically adds CORS headers — if still failing, re-deploy the script |
| "Script function not found" error | Make sure `doGet` and `doPost` are defined in `Code.gs` |
