/**
 * AttendanceTable.jsx — Full-featured attendance data table
 *
 * Features:
 *   - Sortable columns
 *   - Search by name
 *   - Status filter (All / Online / Offline)
 *   - Pagination (10 rows per page)
 *   - Loading skeleton
 */

import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Wifi, WifiOff, Edit2 } from 'lucide-react'
import { formatDisplayDate, formatDisplayTime, formatHours } from '../utils/dateUtils.js'
import EditAttendanceModal from './EditAttendanceModal.jsx'

const PAGE_SIZE = 10

function StatusBadge({ status }) {
  if (status === 'Online') {
    return (
      <span className="badge-online">
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 pulse-dot" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
        </span>
        Online
      </span>
    )
  }
  return (
    <span className="badge-offline">
      <WifiOff className="w-3 h-3" />
      Offline
    </span>
  )
}

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
    : <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
}

export default function AttendanceTable({ records = [], loading = false, onRefresh = () => {} }) {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('All')
  const [sortKey, setSortKey]     = useState('date')
  const [sortDir, setSortDir]     = useState('desc')
  const [page, setPage]           = useState(1)

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // ── Filter + Sort ──────────────────────────
  const filtered = useMemo(() => {
    let rows = records

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.date?.includes(q) ||
        r.device?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'All') {
      rows = rows.filter(r => r.status === statusFilter)
    }

    rows = [...rows].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [records, search, statusFilter, sortKey, sortDir])

  // ── Pagination ─────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStart  = (page - 1) * PAGE_SIZE
  const pageRows   = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const TH = ({ label, sortable, col }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide
        ${sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
      onClick={sortable ? () => toggleSort(col) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable && <SortIcon column={col} sortKey={sortKey} sortDir={sortDir} />}
      </span>
    </th>
  )

  // Loading skeleton
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl w-64 animate-pulse" />
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* ── Filters ─────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, date, device…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {['All', 'Online', 'Offline'].map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150
                ${statusFilter === s
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Record count */}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ───────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <TH label="Date"     sortable col="date"    />
              <TH label="Name"     sortable col="name"    />
              <TH label="Device"   sortable={false}       />
              <TH label="IN Time"  sortable col="inTime"  />
              <TH label="OUT Time" sortable col="outTime" />
              <TH label="Hours"    sortable col="hours"   />
              <TH label="Status"   sortable col="status"  />
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={`${r.date}-${r.name}-${i}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-100"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                    {formatDisplayDate(r.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {r.device || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatDisplayTime(r.inTime)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatDisplayTime(r.outTime)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {r.hours ? formatHours(r.hours) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingRecord(r)
                        setIsEditModalOpen(true)
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────── */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700
                text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700
                text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────── */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingRecord(null)
        }}
        record={editingRecord}
        onSuccess={onRefresh}
      />
    </div>
  )
}
