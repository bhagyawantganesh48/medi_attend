/**
 * Attendance.jsx — Full attendance table page with date range filtering
 */

import { useState } from 'react'
import { Filter, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { useAttendance } from '../hooks/useAttendance.js'
import { todayStr, firstOfMonthStr, firstOfWeekStr } from '../utils/dateUtils.js'
import AttendanceTable from '../components/AttendanceTable.jsx'

const QUICK_FILTERS = [
  { label: 'Today',      getRange: () => ({ start: todayStr(),        end: todayStr() }) },
  { label: 'This Week',  getRange: () => ({ start: firstOfWeekStr(),  end: todayStr() }) },
  { label: 'This Month', getRange: () => ({ start: firstOfMonthStr(), end: todayStr() }) },
  { label: 'All Time',   getRange: () => ({ start: null,              end: null       }) },
]

export default function Attendance() {
  const { user, isAdmin, allowedNames } = useAuth()

  const [selectedName, setSelectedName] = useState(isAdmin ? null : user.name)
  const [startDate, setStartDate]       = useState(firstOfMonthStr())
  const [endDate, setEndDate]           = useState(todayStr())
  const [activeFilter, setActiveFilter] = useState('This Month')

  const { records, loading, error, refresh } = useAttendance(selectedName, startDate, endDate)

  function applyQuickFilter(filter) {
    setActiveFilter(filter.label)
    const { start, end } = filter.getRange()
    setStartDate(start)
    setEndDate(end)
  }

  function handleRefresh() {
    refresh()
    toast.success('Refreshed!')
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            View and filter all attendance records
          </p>
        </div>

        <button
          id="attendance-refresh"
          onClick={handleRefresh}
          className="btn-secondary"
          aria-label="Refresh attendance"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Filters ─────────────────────────── */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">

        {/* Quick filters */}
        <div className="flex-1 min-w-fit">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Quick Filter
          </label>
          <div className="flex gap-1 flex-wrap">
            {QUICK_FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => applyQuickFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${activeFilter === f.label
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range */}
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label
              htmlFor="att-start-date"
              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide"
            >
              From
            </label>
            <input
              id="att-start-date"
              type="date"
              value={startDate || ''}
              onChange={e => { setStartDate(e.target.value || null); setActiveFilter('Custom') }}
              className="input w-auto"
            />
          </div>
          <div>
            <label
              htmlFor="att-end-date"
              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide"
            >
              To
            </label>
            <input
              id="att-end-date"
              type="date"
              value={endDate || ''}
              onChange={e => { setEndDate(e.target.value || null); setActiveFilter('Custom') }}
              className="input w-auto"
            />
          </div>
        </div>

        {/* Admin: user filter */}
        {isAdmin && (
          <div>
            <label
              htmlFor="att-name-filter"
              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide"
            >
              Employee
            </label>
            <select
              id="att-name-filter"
              value={selectedName || ''}
              onChange={e => setSelectedName(e.target.value || null)}
              className="input w-auto"
            >
              <option value="">All Employees</option>
              {allowedNames.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Error ───────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          ⚠ Failed to load attendance: {error}
        </div>
      )}

      {/* ── Table ───────────────────────────── */}
      <AttendanceTable records={records} loading={loading} onRefresh={refresh} />
    </div>
  )
}
