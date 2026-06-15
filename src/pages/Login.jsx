/**
 * Login.jsx — Authentication page
 *
 * Clean centered card with logo and form.
 * Users: Ganesh, Friend, admin
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Eye, EyeOff, Wifi } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Login() {
  const [name, setName]         = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !password) {
      toast.error('Please enter your name and password.')
      return
    }

    setLoading(true)

    // Simulate a short delay for UX feel
    await new Promise(r => setTimeout(r, 300))

    const result = login(name.trim(), password)

    if (result.success) {
      toast.success(`Welcome back, ${name}!`)
      navigate('/dashboard')
    } else {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* ── Logo / Header ─────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-brand-600 items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Smart Attendance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Internship Attendance Tracker
          </p>
        </div>

        {/* ── Login card ────────────────────── */}
        <div className="card p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div>
              <label
                htmlFor="login-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Name
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ganesh or Parth"
                autoComplete="username"
                className="input"
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="input pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* ── Footer note ───────────────────── */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600">
            <Wifi className="w-3.5 h-3.5" />
            <span>Attendance auto-tracked via company WiFi</span>
          </div>
        </div>
      </div>
    </div>
  )
}
