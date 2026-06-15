/**
 * CalendarView.jsx — Monthly attendance calendar heatmap
 *
 * Shows all days of the current month as a grid.
 * Each day is colored by attendance status:
 *   - Green  = Present (Offline, hours recorded)
 *   - Blue   = Currently Online
 *   - Gray   = No record / weekend
 *   - Today  = Highlighted border
 */

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { formatDisplayDate } from '../utils/dateUtils.js'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDayStatus(dateStr, records) {
  const record = records.find(r => r.date === dateStr)
  if (!record) return null
  if (record.status === 'Online') return 'online'
  if (record.hours && parseFloat(record.hours) > 0) return 'present'
  return 'partial' // logged in but no hours yet
}

function DayCell({ date, status, isToday, record }) {
  const dayNum = format(date, 'd')

  const bgClass = {
    online:  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    present: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    partial: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  }[status] || 'bg-gray-50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600'

  const todayClass = isToday ? 'ring-2 ring-brand-500 ring-offset-1' : ''

  return (
    <div
      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium
        transition-all duration-100 ${bgClass} ${todayClass} group cursor-default`}
      title={record
        ? `${formatDisplayDate(record.date)}\nIN: ${record.inTime || '—'} | OUT: ${record.outTime || '—'} | ${record.hours || '—'}h`
        : format(date, 'dd MMM yyyy')}
    >
      <span className="text-sm font-semibold">{dayNum}</span>
      {status === 'online' && (
        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
      {status === 'present' && (
        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      )}
    </div>
  )
}

export default function CalendarView({ records = [], month }) {
  const targetMonth = month ? new Date(month) : new Date()

  const { days, startPad } = useMemo(() => {
    const start = startOfMonth(targetMonth)
    const end   = endOfMonth(targetMonth)
    const days  = eachDayOfInterval({ start, end })
    const startPad = getDay(start) // 0 = Sunday offset
    return { days, startPad }
  }, [targetMonth])

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const recordMap = useMemo(() => {
    const map = {}
    records.forEach(r => { map[r.date] = r })
    return map
  }, [records])

  return (
    <div className="card p-5">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        {format(targetMonth, 'MMMM yyyy')}
      </h3>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { color: 'bg-emerald-400', label: 'Present' },
          { color: 'bg-blue-400',    label: 'Online now' },
          { color: 'bg-amber-400',   label: 'Partial' },
          { color: 'bg-gray-200 dark:bg-gray-700', label: 'Absent' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Day cells */}
        {days.map(date => {
          const dateStr  = format(date, 'yyyy-MM-dd')
          const status   = getDayStatus(dateStr, records)
          const record   = recordMap[dateStr]
          const isToday  = dateStr === todayStr

          return (
            <DayCell
              key={dateStr}
              date={date}
              status={status}
              isToday={isToday}
              record={record}
            />
          )
        })}
      </div>
    </div>
  )
}
