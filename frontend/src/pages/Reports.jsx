/**
 * Reports.jsx — Reports and export page
 *
 * Features:
 *   - Monthly summary card
 *   - Calendar heatmap view
 *   - Excel download (Today / This Week / This Month / Custom Range)
 *   - CSV export
 *   - Print button
 *   - Admin: per-user summary
 */

import { useState, useCallback } from 'react'
import { FileSpreadsheet, FileText, Printer, RefreshCw, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchAttendance, fetchMonthAttendance } from '../utils/api.js'
import { useAttendance } from '../hooks/useAttendance.js'
import { todayStr, firstOfMonthStr, firstOfWeekStr } from '../utils/dateUtils.js'
import { downloadExcel, downloadCSV, printAttendance } from '../utils/exportUtils.js'
import CalendarView from '../components/CalendarView.jsx'
import MonthlySummary from '../components/MonthlySummary.jsx'

const EXPORT_RANGES = [
  { label: 'Today',        id: 'today' },
  { label: 'This Week',    id: 'week'  },
  { label: 'This Month',   id: 'month' },
  { label: 'Custom Range', id: 'custom' },
]

export default function Reports() {
  const { user, isAdmin, allowedNames } = useAuth()

  const [selectedName, setSelectedName] = useState(isAdmin ? null : user.name)
  const [exportRange, setExportRange]   = useState('month')
  const [customStart, setCustomStart]   = useState(firstOfMonthStr())
  const [customEnd, setCustomEnd]       = useState(todayStr())
  const [exporting, setExporting]       = useState(false)

  // Month attendance for calendar + summary
  const { records: monthRecords, loading: monthLoading, refresh } = useAttendance(
    selectedName,
    firstOfMonthStr(),
    todayStr()
  )

  function handleRefresh() {
    refresh()
    toast.success('Refreshed!')
  }

  // ── Export handlers ────────────────────────
  async function handleExcel() {
    setExporting(true)
    try {
      const { records, label } = await getExportData()
      downloadExcel(records, label)
      toast.success(`Excel downloaded: ${label}`)
    } catch (err) {
      toast.error(`Export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  async function handleCSV() {
    setExporting(true)
    try {
      const { records, label } = await getExportData()
      downloadCSV(records, label)
      toast.success(`CSV downloaded: ${label}`)
    } catch (err) {
      toast.error(`Export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  async function getExportData() {
    let startDate, endDate, label

    switch (exportRange) {
      case 'today':
        startDate = todayStr(); endDate = todayStr(); label = 'Today'; break
      case 'week':
        startDate = firstOfWeekStr(); endDate = todayStr(); label = 'This_Week'; break
      case 'month':
        startDate = firstOfMonthStr(); endDate = todayStr(); label = 'This_Month'; break
      case 'custom':
        startDate = customStart; endDate = customEnd; label = `${customStart}_to_${customEnd}`; break
      default:
        startDate = null; endDate = null; label = 'All'
    }

    const data = await fetchAttendance(selectedName, startDate, endDate)
    return { records: data.records || [], label }
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monthly overview and attendance exports
          </p>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          {/* Admin user selector */}
          {isAdmin && (
            <select
              id="reports-name-select"
              value={selectedName || ''}
              onChange={e => setSelectedName(e.target.value || null)}
              className="input w-auto text-sm"
            >
              <option value="">All Employees</option>
              {allowedNames.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}

          <button onClick={handleRefresh} className="btn-secondary" aria-label="Refresh">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Summary + Calendar ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySummary
          records={monthRecords}
          name={selectedName}
          loading={monthLoading}
        />
        <CalendarView
          records={monthRecords}
          loading={monthLoading}
        />
      </div>

      {/* ── Admin: Per-user summary ─────────── */}
      {isAdmin && Array.isArray(monthRecords) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            All Employees — This Month
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allowedNames.map(n => (
              <MonthlySummary
                key={n}
                records={monthRecords.filter(r => r.name === n)}
                name={n}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Export section ──────────────────── */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-brand-600" />
          Download Attendance
        </h2>

        {/* Range selector */}
        <div className="flex gap-2 flex-wrap mb-4">
          {EXPORT_RANGES.map(r => (
            <button
              key={r.id}
              onClick={() => setExportRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${exportRange === r.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Custom date range (shown only when Custom is selected) */}
        {exportRange === 'custom' && (
          <div className="flex gap-3 flex-wrap mb-4">
            <div>
              <label htmlFor="exp-start" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <input
                id="exp-start"
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="input w-auto"
              />
            </div>
            <div>
              <label htmlFor="exp-end" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <input
                id="exp-end"
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="input w-auto"
              />
            </div>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            id="btn-download-excel"
            onClick={handleExcel}
            disabled={exporting}
            className="btn-primary"
            aria-label="Download Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? 'Downloading…' : 'Download Excel'}
          </button>

          <button
            id="btn-download-csv"
            onClick={handleCSV}
            disabled={exporting}
            className="btn-secondary"
            aria-label="Export CSV"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </button>

          <button
            id="btn-print"
            onClick={printAttendance}
            className="btn-secondary"
            aria-label="Print attendance"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  )
}
