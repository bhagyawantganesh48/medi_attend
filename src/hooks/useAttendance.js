/**
 * useAttendance.js — Custom hook for fetching attendance data
 *
 * Manages loading, error, and data state.
 * Accepts filter params and re-fetches when they change.
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchAttendance, fetchTodayAttendance, fetchMonthAttendance, fetchMonthlySummary } from '../utils/api.js'

/**
 * Fetch attendance records with optional filters.
 *
 * @param {string|null} name      - Filter by name
 * @param {string|null} startDate - YYYY-MM-DD
 * @param {string|null} endDate   - YYYY-MM-DD
 */
export function useAttendance(name, startDate, endDate) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAttendance(name, startDate, endDate)
      setRecords(data.records || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [name, startDate, endDate])

  useEffect(() => { load() }, [load])

  return { records, loading, error, refresh: load }
}

/**
 * Fetch today's attendance record(s).
 *
 * @param {string|null} name
 */
export function useTodayAttendance(name) {
  const [record, setRecord]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTodayAttendance(name)
      const records = data.records || []
      // For a single user, take the first record for today
      setRecord(records.length > 0 ? records[0] : null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => { load() }, [load])

  return { record, loading, error, refresh: load }
}

/**
 * Fetch this month's records and compute summary stats.
 *
 * @param {string|null} name
 */
export function useMonthStats(name) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMonthlySummary(name)
      const summaryArr = data.summary || []
      // If viewing a single user, pull their entry
      const entry = name
        ? summaryArr.find(s => s.name === name) || { name, presentDays: 0, totalHours: 0 }
        : null
      setStats(name ? entry : summaryArr)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => { load() }, [load])

  return { stats, loading, error, refresh: load }
}
