/**
 * MonthlySummary.jsx — Summary stats card for a month
 *
 * Displays:
 *   - Present days count  (only Mon–Fri, non-holiday records, up to today)
 *   - Total hours worked
 *   - Average hours per day
 *   - Attendance % (present / working days from first record to today)
 */

import { useMemo } from 'react'
import { CalendarCheck, Clock, TrendingUp, Percent } from 'lucide-react'
import { format, getDay, eachDayOfInterval, parseISO, min, max, startOfDay } from 'date-fns'

/**
 * Count Mon–Fri working days in an interval [from, to].
 * Excludes dates that are custom holidays (status === 'Holiday').
 */
function countWorkingDays(fromDate, toDate, holidayDates = new Set()) {
  if (!fromDate || !toDate || fromDate > toDate) return 0
  const days = eachDayOfInterval({ start: fromDate, end: toDate })
  return days.filter(d => {
    const dow = getDay(d) // 0=Sun, 6=Sat
    if (dow === 0 || dow === 6) return false // weekend
    const ds = format(d, 'yyyy-MM-dd')
    if (holidayDates.has(ds)) return false // custom holiday
    return true
  }).length
}

function SummaryItem({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue:   'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    green:  'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30',
  }
  const cls = colorMap[color] || colorMap.blue

  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

export default function MonthlySummary({ records = [], name, month }) {
  const targetMonth = month ? new Date(month) : new Date()
  const today = startOfDay(new Date())

  const stats = useMemo(() => {
    // Filter to the correct user if name is provided
    const userRecords = name
      ? records.filter(r => r.name === name)
      : records

    // Separate holidays from actual attendance
    const holidayRecords = userRecords.filter(r => r.status === 'Holiday')
    const presentRecords = userRecords.filter(r => {
      if (r.status === 'Holiday') return false
      // Exclude weekend records (backfilled on Sat/Sun shouldn't count)
      if (r.date) {
        const d = parseISO(r.date)
        const dow = getDay(d)
        if (dow === 0 || dow === 6) return false
      }
      return true
    })

    // Build set of custom holiday dates
    const holidayDates = new Set(holidayRecords.map(r => r.date))

    // Determine "from" date: earliest attendance record date (excluding holidays/weekends)
    // This handles the internship start date automatically
    let fromDate = null
    if (presentRecords.length > 0) {
      const sorted = [...presentRecords].sort((a, b) => a.date.localeCompare(b.date))
      fromDate = parseISO(sorted[0].date)
    }

    // Working days = Mon–Fri from first-record-date to TODAY (not end of month)
    const workingDays = fromDate ? countWorkingDays(fromDate, today, holidayDates) : 0

    const presentDays  = presentRecords.length
    const totalHours   = presentRecords.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0)
    const avgHours     = presentDays > 0 ? totalHours / presentDays : 0
    const attendancePct = workingDays > 0 ? Math.min(100, Math.round((presentDays / workingDays) * 100)) : 0

    return {
      workingDays,
      presentDays,
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1),
      attendancePct,
    }
  }, [records, name, targetMonth, today])

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Monthly Summary — {format(targetMonth, 'MMMM yyyy')}
        {name && <span className="text-gray-500 font-normal"> · {name}</span>}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <SummaryItem
          icon={CalendarCheck}
          label="Present Days"
          value={`${stats.presentDays} / ${stats.workingDays}`}
          color="blue"
        />
        <SummaryItem
          icon={Clock}
          label="Total Hours"
          value={`${stats.totalHours}h`}
          color="green"
        />
        <SummaryItem
          icon={TrendingUp}
          label="Avg Hours / Day"
          value={`${stats.avgHours}h`}
          color="purple"
        />
        <SummaryItem
          icon={Percent}
          label="Attendance %"
          value={`${stats.attendancePct}%`}
          color="orange"
        />
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Attendance Rate</span>
          <span>{stats.attendancePct}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${stats.attendancePct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
