# Google Sheet Template

This document describes the exact structure of the Google Sheet used as the database.

---

## Sheet Name

The sheet tab must be named exactly: **`Attendance`**

(The Apps Script will auto-create this sheet with headers on first run if it doesn't exist.)

---

## Column Structure

| Column | Letter | Header      | Format         | Example              | Notes                                  |
|--------|--------|-------------|----------------|----------------------|----------------------------------------|
| 1      | A      | `Date`      | YYYY-MM-DD     | `2026-06-15`         | Set on first heartbeat of day          |
| 2      | B      | `Name`      | Text           | `Ganesh`             | From Python agent config               |
| 3      | C      | `Device`    | Text           | `Laptop1`            | From Python agent config               |
| 4      | D      | `IN Time`   | HH:MM:SS       | `09:02:14`           | First heartbeat time                   |
| 5      | E      | `OUT Time`  | HH:MM:SS       | `18:47:33`           | Set when heartbeat stops for 5+ mins   |
| 6      | F      | `Last Seen` | HH:MM:SS       | `18:47:33`           | Updated every heartbeat                |
| 7      | G      | `Hours`     | Decimal number | `9.75`               | Calculated: (OUT - IN) in decimal hours |
| 8      | H      | `Status`    | Online/Offline | `Offline`            | Auto-managed by Apps Script            |

---

## Sample Data

| Date       | Name   | Device  | IN Time  | OUT Time | Last Seen | Hours | Status  |
|------------|--------|---------|----------|----------|-----------|-------|---------|
| 2026-06-15 | Ganesh | Laptop1 | 09:02:14 | 18:47:33 | 18:47:33  | 9.75  | Offline |
| 2026-06-15 | Friend | Laptop2 | 09:15:00 | 18:30:00 | 18:30:00  | 9.25  | Offline |
| 2026-06-14 | Ganesh | Laptop1 | 09:00:00 | 17:55:00 | 17:55:00  | 8.92  | Offline |

---

## How the Data Flows

```
09:02 — Python agent detects company WiFi
      → POST { name: "Ganesh", device: "Laptop1", time: "09:02:14" }
      → Apps Script: No row for today → CREATE ROW
        Date=today, Name=Ganesh, IN=09:02:14, LastSeen=09:02:14, Status=Online

09:03 — Next heartbeat (60s later)
      → POST heartbeat
      → Apps Script: Row exists → UPDATE LastSeen=09:03:14, Status=Online

... (every 60 seconds) ...

18:47 — Last heartbeat
      → Last Seen = 18:47:33

18:52 — No heartbeat for 5 minutes
      → Apps Script (on next GET request): detects stale row
      → Sets OUT=18:47:33, Hours=9.75, Status=Offline
```

---

## Important Notes

1. **One row per user per day** — the Apps Script enforces this. A second heartbeat from the same user on the same day updates `Last Seen`, not creates a new row.

2. **Auto-offline detection** happens on every `GET` request (not in real-time). When the dashboard loads or refreshes, it triggers the offline check.

3. **Hours calculation**: `Hours = (OUT Time - IN Time)` in decimal hours. Breaks are NOT deducted (continuous tracking).

4. **Re-connection**: If a user re-connects after being marked Offline, the `OUT Time` and `Hours` are cleared, and the original `IN Time` is preserved.

---

## Protecting the Sheet

To prevent accidental edits:

1. Right-click the "Attendance" tab → **Protect Sheet**
2. Allow editing only for yourself
3. The Apps Script can still write to it (it uses your credentials)

---

## Backing Up

To back up your data:
- **File → Download → Microsoft Excel (.xlsx)** — manual backup
- Or set up a Google Apps Script trigger to email you a weekly backup
