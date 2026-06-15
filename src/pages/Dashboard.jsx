/**
 * Dashboard.jsx — Main dashboard with stat cards and today's attendance
 *
 * Shows:
 *   - 6 stat cards (IN, OUT, Hours, Present Days, Status, Last Seen)
 *   - Live online indicator
 *   - Recent attendance table (last 7 days)
 *   - Manual refresh button
 *   - Admin: see all users; User: see only own data
 */

import { useState, useEffect, useCallback } from 'react'
import {
  LogIn, LogOut, Clock, CalendarCheck,
  Wifi, WifiOff, Eye, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { useAuth } from '../context/AuthContext.jsx'
import { useTodayAttendance, useMonthStats } from '../hooks/useAttendance.js'
import { fetchAttendance } from '../utils/api.js'
import { formatDisplayTime, formatHours, lastSeenLabel, todayStr, firstOfWeekStr } from '../utils/dateUtils.js'
import StatCard from '../components/StatCard.jsx'
import AttendanceTable from '../components/AttendanceTable.jsx'

// ── Live Clock ──────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
      {format(time, 'EEEE, dd MMM yyyy · HH:mm:ss')}
    </span>
  )
}

export default function Dashboard() {
  const { user, isAdmin, allowedNames } = useAuth()

  // For regular users, show their own name; admin selects which user
  const [selectedName, setSelectedName] = useState(isAdmin ? null : user.name)
  const [refreshKey, setRefreshKey]     = useState(0)

  // ── Data hooks (re-run when refreshKey changes) ──
  const { record: todayRecord, loading: todayLoading } = useTodayAttendance(
    selectedName,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  )
  const { stats: monthStats, loading: statsLoading } = useMonthStats(
    selectedName,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  )

  // Recent records (this week)
  const [recentRecords, setRecentRecords] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  const loadRecent = useCallback(async () => {
    setRecentLoading(true)
    try {
      const data = await fetchAttendance(selectedName, firstOfWeekStr(), todayStr())
      setRecentRecords(data.records || [])
    } catch (err) {
      // Silently fail for recent records
    } finally {
      setRecentLoading(false)
    }
  }, [selectedName, refreshKey])

  useEffect(() => { loadRecent() }, [loadRecent])

  function handleRefresh() {
    setRefreshKey(k => k + 1)
    toast.success('Refreshed!')
  }

  // ── Derived values ──────────────────────────
  const isOnline    = todayRecord?.status === 'Online'
  const presentDays = Array.isArray(monthStats)
    ? monthStats.reduce((s, m) => s + m.presentDays, 0)
    : (monthStats?.presentDays ?? 0)

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <LiveClock />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Admin: user switcher */}
          {isAdmin && (
            <select
              id="admin-user-select"
              value={selectedName || ''}
              onChange={e => setSelectedName(e.target.value || null)}
              className="input w-auto text-sm"
            >
              <option value="">All Users</option>
              {allowedNames.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}

          {/* Refresh button */}
          <button
            id="dashboard-refresh"
            onClick={handleRefresh}
            className="btn-secondary"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Online status banner (only for current user) ─── */}
      {!isAdmin && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
          ${isOnline
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400'
          }`}
        >
          {isOnline ? (
            <>
              <span className="relative flex w-3 h-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              You are <strong>Online</strong> — attendance is being recorded.
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              {todayRecord
                ? `You are Offline. Last seen at ${formatDisplayTime(todayRecord.lastSeen)}.`
                : "You haven't connected today. Connect to company WiFi to start attendance."}
            </>
          )}
        </div>
      )}

      {/* ── Stat cards ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's IN"
          value={formatDisplayTime(todayRecord?.inTime)}
          icon={LogIn}
          color="blue"
          subtitle="First connection today"
          loading={todayLoading}
        />
        <StatCard
          title="Today's OUT"
          value={formatDisplayTime(todayRecord?.outTime) || (isOnline ? 'Still Online' : '—')}
          icon={LogOut}
          color="orange"
          subtitle={isOnline ? 'Live session' : 'Last disconnection'}
          loading={todayLoading}
        />
        <StatCard
          title="Working Hours"
          value={todayRecord?.hours ? formatHours(todayRecord.hours) : (isOnline ? 'Active' : '—')}
          icon={Clock}
          color="purple"
          subtitle="Today's work duration"
          loading={todayLoading}
        />
        <StatCard
          title="Present Days"
          value={statsLoading ? null : String(presentDays)}
          icon={CalendarCheck}
          color="green"
          subtitle="This month"
          loading={statsLoading}
        />
        <StatCard
          title="Current Status"
          value={todayRecord ? todayRecord.status : 'No data'}
          icon={isOnline ? Wifi : WifiOff}
          color={isOnline ? 'green' : 'gray'}
          subtitle={isOnline ? 'Connected to office WiFi' : 'Not connected'}
          loading={todayLoading}
        />
        <StatCard
          title="Last Seen"
          value={todayRecord?.lastSeen ? lastSeenLabel(todayRecord.lastSeen) : '—'}
          icon={Eye}
          color="blue"
          subtitle={todayRecord?.lastSeen ? `At ${formatDisplayTime(todayRecord.lastSeen)}` : 'No activity today'}
          loading={todayLoading}
        />
      </div>

      {/* ── Recent attendance table ─────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          This Week's Attendance
        </h2>
        <AttendanceTable records={recentRecords} loading={recentLoading} />
      </div>
    </div>
  )
}
