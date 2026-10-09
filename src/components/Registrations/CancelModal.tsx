import React, { useState } from 'react'
import { Registration } from '../../types'
import { api } from '../../services/api'
import { X, AlertTriangle, AlertCircle } from 'lucide-react'

interface CancelModalProps {
  registration: Registration | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CancelModal: React.FC<CancelModalProps> = ({
  registration,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !registration) return null

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.registrations.cancel(registration.id, reason)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-base font-semibold text-gray-900">
              Cancel Attendee Registration
            </h3>
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

        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 space-y-1">
          <div>
            <span className="font-medium text-gray-700">Attendee:</span> {registration.attendee_name} ({registration.attendee_email})
          </div>
          {registration.workshop_title && (
            <div>
              <span className="font-medium text-gray-700">Workshop:</span> {registration.workshop_code} ({registration.workshop_title})
            </div>
          )}
          <p className="text-gray-500 pt-1">
            Cancelling will free up the seat for other attendees. The record will remain in the history log permanently.
          </p>
        </div>

        <form onSubmit={handleCancel} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Reason for Cancellation
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Schedule conflict, attendee requested"
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
              Keep Registration
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
