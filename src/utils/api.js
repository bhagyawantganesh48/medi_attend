/**
 * api.js — All API calls to the Google Apps Script backend
 *
 * The Apps Script URL is read from the VITE_API_URL environment variable.
 * Set it in your .env file:
 *   VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 *
 * All GET requests use URL query params.
 * All POST requests use JSON body.
 */

/** Returns the current API URL — prefers user-saved value from Settings */
function getApiUrl() {
  return localStorage.getItem('medi_api_url') || import.meta.env.VITE_API_URL || ''
}

if (!getApiUrl()) {
  console.warn('[API] No API URL configured. Go to Settings to set your Google Apps Script URL.')
}

/**
 * Internal helper — GET request with query params
 * @param {Object} params - Query parameters
 */
async function apiGet(params = {}) {
  const url = new URL(getApiUrl())
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.append(k, v)
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data
}

/**
 * Internal helper — POST request with JSON body
 * @param {Object} body - Request body
 */
async function apiPost(body = {}) {
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow', // Apps Script redirects — must follow
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data
}

// ─────────────────────────────────────────────
// PUBLIC API FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Get all attendance records.
 * @param {string|null} name    - Filter by employee name (null = all)
 * @param {string|null} startDate - YYYY-MM-DD
 * @param {string|null} endDate   - YYYY-MM-DD
 */
export async function fetchAttendance(name = null, startDate = null, endDate = null) {
  return apiGet({ action: 'attendance', name, startDate, endDate })
}

/**
 * Get today's attendance for a user (or all users if name is null).
 * @param {string|null} name
 */
export async function fetchTodayAttendance(name = null) {
  return apiGet({ action: 'today', name })
}

/**
 * Get this month's attendance records.
 * @param {string|null} name
 */
export async function fetchMonthAttendance(name = null) {
  return apiGet({ action: 'month', name })
}

/**
 * Get monthly summary (present days + total hours per user).
 * @param {string|null} name
 */
export async function fetchMonthlySummary(name = null) {
  return apiGet({ action: 'summary', name })
}

/**
 * Send a manual heartbeat (for testing / demo purposes).
 * @param {string} name
 * @param {string} device
 */
export async function sendManualHeartbeat(name, device = 'Manual') {
  return apiPost({
    action: 'heartbeat',
    name,
    device,
    time: new Date().toISOString(),
  })
}
