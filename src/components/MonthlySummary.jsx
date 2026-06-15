/**
 * MonthlySummary.jsx — Summary stats card for a month
 *
 * Displays:
 *   - Present days count
 *   - Total hours worked
 *   - Average hours per day
 *   - Attendance percentage (vs working days in month)
 */

import { useMemo } from 'react'
import { CalendarCheck, Clock, TrendingUp, Percent } from 'lucide-react'
import { format, getDaysInMonth, getDay, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'

/** Count working days (Mon–Fri) in a given month */
function countWorkingDays(date) {
  const start = startOfMonth(date)
  const end   = endOfMonth(date)
  const days  = eachDayOfInterval({ start, end })
  return days.filter(d => {
    const dow = getDay(d)
    return dow !== 0 && dow !== 6 // Exclude Sunday (0) and Saturday (6)
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

  const stats = useMemo(() => {
    const workingDays = countWorkingDays(targetMonth)

    // Filter to the correct user if name is provided
    const userRecords = name
      ? records.filter(r => r.name === name)
      : records

    const presentDays  = userRecords.length
    const totalHours   = userRecords.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0)
    const avgHours     = presentDays > 0 ? totalHours / presentDays : 0
    const attendancePct = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0

    return {
      workingDays,
      presentDays,
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1),
      attendancePct,
    }
  }, [records, name, targetMonth])

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
