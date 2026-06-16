/**
 * Smart Internship Attendance Tracker
 * Google Apps Script Backend
 *
 * Deploy as a Web App:
 *   - Execute as: Me
 *   - Who has access: Anyone
 *
 * Sheet columns (Row 1 = Headers):
 *   A: Date | B: Name | C: Device | D: IN Time | E: OUT Time | F: Last Seen | G: Hours | H: Status
 */

// ─────────────────────────────────────────────
// CONFIGURATION — Update these before deploying
// ─────────────────────────────────────────────
const CONFIG = {
  SHEET_NAME: "Attendance",         // Name of your sheet tab
  OFFLINE_THRESHOLD_MINUTES: 5,    // Minutes before marking user offline
  ADMIN_KEY: "admin123",           // Simple API key for admin-level reads (optional)
};

// Column index mapping (1-based for Apps Script)
const COL = {
  DATE: 1,
  NAME: 2,
  DEVICE: 3,
  IN_TIME: 4,
  OUT_TIME: 5,
  LAST_SEEN: 6,
  HOURS: 7,
  STATUS: 8,
};

// ─────────────────────────────────────────────
// ENTRY POINT — Routes all HTTP requests
// ─────────────────────────────────────────────

/**
 * Handles GET requests
 * Query params: action, name, startDate, endDate
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "attendance";
    const name = e.parameter.name || null;
    const startDate = e.parameter.startDate || null;
    const endDate = e.parameter.endDate || null;

    let result;

    switch (action) {
      case "attendance":
        result = getAttendance(name, startDate, endDate);
        break;
      case "today":
        result = getTodayAttendance(name);
        break;
      case "month":
        result = getMonthAttendance(name);
        break;
      case "summary":
        result = getMonthlySummary(name);
        break;
      default:
        result = { error: "Unknown action: " + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

/**
 * Handles POST requests
 * Body (JSON): { action, name, device, time }
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || "heartbeat";

    let result;

    switch (action) {
      case "heartbeat":
        result = recordHeartbeat(body.name, body.device, body.time);
        break;
      case "edit":
        result = editAttendance(body.date, body.name, body.inTime, body.outTime, body.hours);
        break;
      default:
        result = { error: "Unknown action: " + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

// ─────────────────────────────────────────────
// HEARTBEAT — Core attendance logic
// ─────────────────────────────────────────────

/**
 * Records a heartbeat from the Python agent.
 * Creates a new row (first heartbeat of the day) or updates Last Seen.
 *
 * @param {string} name - Employee name
 * @param {string} device - Device identifier
 * @param {string} timeStr - ISO time string from agent (optional, defaults to now)
 */
function recordHeartbeat(name, device, timeStr) {
  if (!name) return { success: false, error: "Name is required" };

  const sheet = getSheet();
  const now = timeStr ? new Date(timeStr) : new Date();
  const todayStr = formatDate(now);
  const timeFormatted = formatTime(now);

  // Search for existing row for today + name
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) { // Skip header row
    const rowDate = data[i][COL.DATE - 1];
    const rowName = data[i][COL.NAME - 1];

    if (formatDate(new Date(rowDate)) === todayStr && rowName === name) {
      rowIndex = i + 1; // 1-based row index in sheet
      break;
    }
  }

  if (rowIndex === -1) {
    // ── First heartbeat of the day: create new row ──
    sheet.appendRow([
      todayStr,       // Date
      name,           // Name
      device || "",   // Device
      timeFormatted,  // IN Time
      "",             // OUT Time (empty until offline)
      timeFormatted,  // Last Seen
      "",             // Hours (empty until offline)
      "Online",       // Status
    ]);

    return {
      success: true,
      action: "created",
      message: `Attendance started for ${name} at ${timeFormatted}`,
    };
  } else {
    // ── Subsequent heartbeat: update Last Seen + Status ──
    sheet.getRange(rowIndex, COL.LAST_SEEN).setValue(timeFormatted);
    sheet.getRange(rowIndex, COL.STATUS).setValue("Online");

    // Clear OUT Time and Hours if user came back online (re-connected)
    const currentOut = data[rowIndex - 1][COL.OUT_TIME - 1];
    if (currentOut) {
      sheet.getRange(rowIndex, COL.OUT_TIME).setValue("");
      sheet.getRange(rowIndex, COL.HOURS).setValue("");
    }

    return {
      success: true,
      action: "updated",
      message: `Heartbeat recorded for ${name} at ${timeFormatted}`,
    };
  }
}

// ─────────────────────────────────────────────
// EDIT ATTENDANCE
// ─────────────────────────────────────────────

function editAttendance(dateStr, name, inTime, outTime, hours) {
  if (!name || !dateStr) return { success: false, error: "Name and Date are required" };

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowDate = data[i][COL.DATE - 1];
    const rowName = data[i][COL.NAME - 1];

    if (formatDate(new Date(rowDate)) === dateStr && rowName === name) {
      const rowIndex = i + 1;
      sheet.getRange(rowIndex, COL.IN_TIME).setValue(inTime || "");
      sheet.getRange(rowIndex, COL.OUT_TIME).setValue(outTime || "");
      sheet.getRange(rowIndex, COL.HOURS).setValue(hours || "");
      return { success: true, message: `Record updated for ${name} on ${dateStr}` };
    }
  }

  return { success: false, error: "Record not found" };
}

// ─────────────────────────────────────────────
// GET ENDPOINTS
// ─────────────────────────────────────────────

/**
 * Get all attendance records, optionally filtered by name and date range.
 * Also auto-calculates offline status for stale rows.
 */
function getAttendance(name, startDate, endDate) {
  const sheet = getSheet();
  processOfflineRows(sheet); // Auto-mark stale rows as offline

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const records = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const record = rowToObject(row);

    // Filter by name
    if (name && record.name !== name) continue;

    // Filter by date range
    if (startDate && record.date < startDate) continue;
    if (endDate && record.date > endDate) continue;

    records.push(record);
  }

  // Sort by date descending
  records.sort((a, b) => (a.date > b.date ? -1 : 1));

  return { success: true, count: records.length, records };
}

/**
 * Get today's attendance records.
 */
function getTodayAttendance(name) {
  const sheet = getSheet();
  processOfflineRows(sheet);

  const today = formatDate(new Date());
  return getAttendance(name, today, today);
}

/**
 * Get this month's attendance records.
 */
function getMonthAttendance(name) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const startDate = `${year}-${month}-01`;
  const endDate = formatDate(now);

  return getAttendance(name, startDate, endDate);
}

/**
 * Get monthly summary — count of present days and total hours per user.
 */
function getMonthlySummary(name) {
  const monthData = getMonthAttendance(name);
  const records = monthData.records;

  const summary = {};

  records.forEach((r) => {
    if (!summary[r.name]) {
      summary[r.name] = { name: r.name, presentDays: 0, totalHours: 0 };
    }
    summary[r.name].presentDays++;
    summary[r.name].totalHours += parseFloat(r.hours) || 0;
  });

  return {
    success: true,
    summary: Object.values(summary),
  };
}

// ─────────────────────────────────────────────
// OFFLINE DETECTION — Auto-mark stale rows
// ─────────────────────────────────────────────

/**
 * Scans all "Online" rows and marks them Offline if Last Seen is stale.
 * Also calculates Hours = OUT - IN.
 */
function processOfflineRows(sheet) {
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const thresholdMs = CONFIG.OFFLINE_THRESHOLD_MINUTES * 60 * 1000;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[COL.STATUS - 1];
    const lastSeenStr = row[COL.LAST_SEEN - 1];
    const inTimeStr = row[COL.IN_TIME - 1];
    const dateStr = row[COL.DATE - 1];
    const outTimeStr = row[COL.OUT_TIME - 1];

    if (status !== "Online" || !lastSeenStr) continue;

    // Parse Last Seen — combine with date for accuracy
    const lastSeenFull = parseDateTime(dateStr, lastSeenStr);
    if (!lastSeenFull) continue;

    const diffMs = now - lastSeenFull;

    if (diffMs > thresholdMs) {
      // Mark offline
      const sheetRow = i + 1;
      sheet.getRange(sheetRow, COL.STATUS).setValue("Offline");

      // Set OUT Time to Last Seen (if not already set)
      if (!outTimeStr) {
        sheet.getRange(sheetRow, COL.OUT_TIME).setValue(lastSeenStr);

        // Calculate hours worked
        const inFull = parseDateTime(dateStr, inTimeStr);
        if (inFull && lastSeenFull > inFull) {
          const hrs = (lastSeenFull - inFull) / (1000 * 60 * 60);
          sheet.getRange(sheetRow, COL.HOURS).setValue(hrs.toFixed(2));
        }
      }
    }
  }
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

/** Get or create the Attendance sheet */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // Add headers
    sheet.appendRow(["Date", "Name", "Device", "IN Time", "OUT Time", "Last Seen", "Hours", "Status"]);
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setBackground("#1E40AF");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
  }

  return sheet;
}

/** Convert a sheet row array to a clean object */
function rowToObject(row) {
  return {
    date: row[COL.DATE - 1] ? formatDate(new Date(row[COL.DATE - 1])) : "",
    name: row[COL.NAME - 1] || "",
    device: row[COL.DEVICE - 1] || "",
    inTime: row[COL.IN_TIME - 1] || "",
    outTime: row[COL.OUT_TIME - 1] || "",
    lastSeen: row[COL.LAST_SEEN - 1] || "",
    hours: row[COL.HOURS - 1] || "",
    status: row[COL.STATUS - 1] || "",
  };
}

/** Format a Date object as YYYY-MM-DD in IST */
function formatDate(date) {
  if (!date || isNaN(date)) return "";
  return Utilities.formatDate(date, "Asia/Kolkata", "yyyy-MM-dd");
}

/** Format a Date object as HH:MM:SS in IST */
function formatTime(date) {
  if (!date || isNaN(date)) return "";
  return Utilities.formatDate(date, "Asia/Kolkata", "HH:mm:ss");
}

/**
 * Parse a combined date + time string into a Date object.
 * dateStr: "YYYY-MM-DD", timeStr: "HH:MM:SS"
 */
function parseDateTime(dateStr, timeStr) {
  try {
    if (!dateStr || !timeStr) return null;
    const dateFormatted = formatDate(new Date(dateStr));
    const dt = new Date(`${dateFormatted}T${timeStr}`);
    return isNaN(dt) ? null : dt;
  } catch (e) {
    return null;
  }
}

/** Return a JSON ContentService response */
function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
