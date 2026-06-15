/**
 * StatCard.jsx — Reusable dashboard metric card
 *
 * Props:
 *   title       {string}    - Card label
 *   value       {string}    - Main value to display
 *   icon        {Component} - Lucide icon component
 *   color       {string}    - Tailwind color class for icon bg (e.g. 'blue', 'green')
 *   subtitle    {string}    - Optional small text below value
 *   loading     {boolean}   - Show skeleton if true
 */

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, loading = false }) {

  // Color map for icon background/text
  const colorMap = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    gray:   'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }

  const iconClass = colorMap[color] || colorMap.blue

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Title */}
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {title}
          </p>

          {/* Value */}
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value || '—'}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
