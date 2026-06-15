/**
 * App.jsx — Root component with routing
 *
 * Route structure:
 *   /           → Login (if not authenticated) or redirect to /dashboard
 *   /dashboard  → Dashboard page
 *   /attendance → Attendance table
 *   /reports    → Reports & export
 *   *           → Redirect to /dashboard
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Attendance from './pages/Attendance.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Layout from './components/Layout.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected routes inside the sidebar layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="reports"    element={<Reports />} />
        <Route path="settings"   element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
