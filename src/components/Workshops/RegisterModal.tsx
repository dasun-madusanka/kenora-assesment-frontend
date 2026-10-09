import React, { useState } from 'react'
import { Workshop } from '../../types'
import { api } from '../../services/api'
import { X, UserPlus, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface RegisterModalProps {
  workshop: Workshop | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  workshop,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen || !workshop) return null

  const isFull = workshop.available_seats <= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (isFull) {
        await api.waitlist.add(workshop.id, { attendeeName, attendeeEmail })
        setSuccessMsg(`Added ${attendeeName} to the waitlist queue.`)
      } else {
        await api.registrations.register(workshop.id, { attendeeName, attendeeEmail })
        setSuccessMsg(`Registered ${attendeeName} successfully. Seat confirmed.`)
      }

      setTimeout(() => {
        setAttendeeName('')
        setAttendeeEmail('')
        setSuccessMsg(null)
        onSuccess()
        onClose()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isFull ? 'Join Waitlist' : 'Register Attendee'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {workshop.code} - {workshop.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100 flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-500">Available Seats:</span>{' '}
            <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-emerald-700'}`}>
              {workshop.available_seats} / {workshop.capacity}
            </span>
          </div>
          {isFull ? (
            <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
              <Clock className="w-3 h-3 mr-1" /> Full (Waitlist Only)
            </span>
          ) : (
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              Seats Open
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Attendee Full Name *</label>
            <input
              type="text"
              required
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Attendee Email Address *</label>
            <input
              type="email"
              required
              value={attendeeEmail}
              onChange={(e) => setAttendeeEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white flex items-center disabled:opacity-50 ${
                isFull ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                'Processing...'
              ) : isFull ? (
                <>
                  <Clock className="w-4 h-4 mr-1.5" />
                  Add to Waitlist
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Confirm Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
