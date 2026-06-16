import { useState, useEffect } from 'react'
import { X, Clock, Save, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'
import { editAttendanceRecord } from '../utils/api.js'

export default function EditAttendanceModal({ isOpen, onClose, record, onSuccess }) {
  const [inTime, setInTime] = useState('')
  const [outTime, setOutTime] = useState('')
  const [hours, setHours] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize fields when modal opens
  useEffect(() => {
    if (isOpen && record) {
      setInTime(record.inTime || '')
      setOutTime(record.outTime || '')
      setHours(record.hours || '')
    }
  }, [isOpen, record])

  // Helper to convert "HH:MM:SS" to "HH:MM" for HTML time inputs
  const toInputTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : ''
  // Helper to convert "HH:MM" to "HH:MM:00" for backend
  const toBackendTime = (timeStr) => timeStr && timeStr.length === 5 ? `${timeStr}:00` : timeStr

  const handleCalculateHours = () => {
    if (!inTime || !outTime) {
      toast.error('Both IN and OUT times are required to calculate hours')
      return
    }

    try {
      const start = new Date(`2000-01-01T${toBackendTime(inTime)}`)
      const end = new Date(`2000-01-01T${toBackendTime(outTime)}`)
      
      let diff = (end - start) / (1000 * 60 * 60)
      if (diff < 0) diff += 24 // Handle overnight shifts
      
      setHours(diff.toFixed(2))
      toast.success('Hours calculated automatically')
    } catch (e) {
      toast.error('Failed to calculate hours')
    }
  }

  const handleSave = async () => {
    if (!record) return
    setLoading(true)

    try {
      await editAttendanceRecord({
        date: record.date,
        name: record.name,
        inTime: toBackendTime(inTime),
        outTime: toBackendTime(outTime),
        hours: hours,
      })
      toast.success('Attendance updated successfully!')
      onSuccess() // Refresh table
      onClose()
    } catch (error) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Edit Attendance
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
              {record.name} — {record.date}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IN Time</label>
              <input
                type="time"
                className="input w-full"
                value={toInputTime(inTime)}
                onChange={(e) => setInTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">OUT Time</label>
              <input
                type="time"
                className="input w-full"
                value={toInputTime(outTime)}
                onChange={(e) => setOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Total Hours</span>
              <button 
                onClick={handleCalculateHours}
                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 font-medium"
              >
                <Calculator className="w-3.5 h-3.5" />
                Auto-calculate
              </button>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input w-full"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 8.5"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
