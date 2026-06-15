/**
 * Sidebar.jsx — Navigation sidebar with links and user info
 */

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Download,
  LogOut,
  Clock,
  Sun,
  Moon,
  Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarDays },
  { to: '/reports',    label: 'Reports',    icon: BarChart3 },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const { isDark, toggleTheme }   = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">

      {/* ── Logo ────────────────────────────────── */}
      <div className="px-5 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              Smart Attendance
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tracker</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Download link — scrolls to Reports page */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? '' : ''}`
          }
          end={false}
        >
          <Download className="w-4 h-4 flex-shrink-0" />
          <span>Download Excel</span>
        </NavLink>
      </nav>

      {/* ── Bottom section: user info + controls ── */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0">
            {isAdmin
              ? <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              : <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {user?.displayName?.charAt(0)}
                </span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost w-full justify-start"
          aria-label="Toggle dark mode"
        >
          {isDark
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4" />
          }
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn-ghost w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
