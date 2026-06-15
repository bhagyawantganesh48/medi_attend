/**
 * dateUtils.js — Date formatting and calculation helpers
 */

import { format, parseISO, isValid, differenceInMinutes } from 'date-fns'

/**
 * Format a date string to a readable format.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} [fmt='dd MMM yyyy'] - date-fns format string
 * @returns {string}
 */
export function formatDisplayDate(dateStr, fmt = 'dd MMM yyyy') {
  if (!dateStr) return '—'
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, fmt) : dateStr
  } catch {
    return dateStr
  }
}

/**
 * Format time string for display.
 * @param {string} timeStr - HH:MM:SS
 * @returns {string} HH:MM AM/PM
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr) return '—'
  try {
    // Parse HH:MM:SS and convert to 12-hour format
    const [hours, minutes] = timeStr.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`
  } catch {
    return timeStr
  }
}

/**
 * Format decimal hours to "Xh Ym" display string.
 * @param {number|string} hours
 * @returns {string}
 */
export function formatHours(hours) {
  const h = parseFloat(hours)
  if (isNaN(h) || h <= 0) return '—'
  const wholeH = Math.floor(h)
  const minutes = Math.round((h - wholeH) * 60)
  if (wholeH === 0) return `${minutes}m`
  if (minutes === 0) return `${wholeH}h`
  return `${wholeH}h ${minutes}m`
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get first day of current month as YYYY-MM-DD string.
 */
export function firstOfMonthStr() {
  const now = new Date()
  return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd')
}

/**
 * Get first day of current week (Monday) as YYYY-MM-DD string.
 */
export function firstOfWeekStr() {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
  return format(new Date(now.setDate(diff)), 'yyyy-MM-dd')
}

/**
 * Calculate minutes since a time string (HH:MM:SS).
 * Assumes the time is from today.
 * @param {string} timeStr
 * @returns {number} minutes elapsed
 */
export function minutesSince(timeStr) {
  if (!timeStr) return Infinity
  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    const dt = new Date(`${today}T${timeStr}`)
    return differenceInMinutes(new Date(), dt)
  } catch {
    return Infinity
  }
}

/**
 * Returns human-readable "last seen" string.
 * @param {string} timeStr - HH:MM:SS
 * @returns {string}
 */
export function lastSeenLabel(timeStr) {
  const mins = minutesSince(timeStr)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}
