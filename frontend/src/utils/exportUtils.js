/**
 * exportUtils.js — Excel and CSV export utilities
 *
 * Uses the 'xlsx' library for Excel generation (client-side, no server needed).
 */

import * as XLSX from 'xlsx'
import { formatDisplayDate, formatDisplayTime, formatHours } from './dateUtils.js'

/**
 * Format records for export (human-readable columns).
 * @param {Array} records - Raw attendance records from API
 * @returns {Array} Formatted rows
 */
function formatRecordsForExport(records) {
  return records.map((r, i) => ({
    'S.No':    i + 1,
    'Date':    formatDisplayDate(r.date),
    'Name':    r.name,
    'Device':  r.device || '—',
    'IN Time': formatDisplayTime(r.inTime),
    'OUT Time': formatDisplayTime(r.outTime),
    'Hours':   r.hours ? formatHours(r.hours) : '—',
    'Status':  r.status,
  }))
}

/**
 * Download attendance records as an Excel (.xlsx) file.
 *
 * @param {Array}  records  - Attendance records from the API
 * @param {string} label    - Label for the filename (e.g., "Today", "This Week")
 */
export function downloadExcel(records, label = 'Attendance') {
  if (!records || records.length === 0) {
    alert('No records to export.')
    return
  }

  const rows = formatRecordsForExport(records)

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Date
    { wch: 14 }, // Name
    { wch: 14 }, // Device
    { wch: 12 }, // IN Time
    { wch: 12 }, // OUT Time
    { wch: 10 }, // Hours
    { wch: 10 }, // Status
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Attendance')

  // Generate filename with today's date
  const dateTag = new Date().toISOString().slice(0, 10)
  const filename = `Attendance_${label.replace(/\s+/g, '_')}_${dateTag}.xlsx`

  XLSX.writeFile(wb, filename)
}

/**
 * Download attendance records as a CSV file.
 *
 * @param {Array}  records
 * @param {string} label
 */
export function downloadCSV(records, label = 'Attendance') {
  if (!records || records.length === 0) {
    alert('No records to export.')
    return
  }

  const rows = formatRecordsForExport(records)
  const headers = Object.keys(rows[0])

  const csvLines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '').replace(/"/g, '""')
        return `"${val}"`
      }).join(',')
    ),
  ]

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateTag = new Date().toISOString().slice(0, 10)
  link.download = `Attendance_${label.replace(/\s+/g, '_')}_${dateTag}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Print the attendance table (opens the browser print dialog).
 * We temporarily hide the sidebar and show only the main content.
 */
export function printAttendance() {
  window.print()
}
