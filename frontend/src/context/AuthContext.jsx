/**
 * AuthContext.jsx — Authentication state management
 *
 * Stores the current user in sessionStorage.
 * Two regular users + one admin.
 * Credentials are stored in USERS config below.
 */

import { createContext, useContext, useState, useCallback } from 'react'

// ── USER CREDENTIALS ─────────────────────────────────────────────
// To change passwords or add users, update this object.
// In production you might move this to an .env file.
const USERS = {
  Ganesh: { password: 'password123', role: 'user',  displayName: 'Ganesh' },
  Friend: { password: 'password123', role: 'user',  displayName: 'Friend' },
  admin:  { password: 'admin123',    role: 'admin', displayName: 'Admin'  },
}

const SESSION_KEY = 'attendance_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Restore session from sessionStorage on mount
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  /**
   * Attempt login with name and password.
   * Returns { success, error }
   */
  const login = useCallback((name, password) => {
    const userRecord = USERS[name]

    if (!userRecord) {
      return { success: false, error: 'User not found.' }
    }
    if (userRecord.password !== password) {
      return { success: false, error: 'Incorrect password.' }
    }

    const userData = {
      name,
      displayName: userRecord.displayName,
      role: userRecord.role,
    }

    setUser(userData)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    return { success: true }
  }, [])

  /** Clear the current session */
  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  /** Returns true if the current user is the admin */
  const isAdmin = user?.role === 'admin'

  /** List of names the current user is allowed to view */
  const allowedNames = isAdmin ? Object.keys(USERS).filter(k => k !== 'admin') : [user?.name]

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, allowedNames }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
