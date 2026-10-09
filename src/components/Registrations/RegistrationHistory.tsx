import React, { useState, useEffect, useCallback } from 'react'
import { Registration } from '../../types'
import { api } from '../../services/api'
import { CancelModal } from './CancelModal'
import { Search, RotateCcw, Ban, User, Calendar } from 'lucide-react'

export const RegistrationHistory: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  // Cancel modal
  const [selectedToCancel, setSelectedToCancel] = useState<Registration | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.registrations.history({
        search: search || undefined,
        status: status || undefined,
      })
      setRegistrations(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load registration history')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatus('')
  }

  const confirmedCount = registrations.filter((r) => r.status === 'CONFIRMED').length
  const cancelledCount = registrations.filter((r) => r.status === 'CANCELLED').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Registrations & History</h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete log of workshop registrations, seat cancellations, and staff audit trail.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Total Records</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{registrations.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-medium text-emerald-600">Active Bookings</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{confirmedCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-gray-500">Cancelled (Seats Freed)</span>
          <p className="text-2xl font-bold text-gray-700 mt-1">{cancelledCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendee, workshop title or code..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed only</option>
            <option value="CANCELLED">Cancelled only</option>
          </select>
        </div>

        {(search || status) && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center font-medium self-end sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear filters
          </button>
        )}
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Table / List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
          Loading registration history...
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-gray-200 p-8 space-y-2">
          <p className="text-base font-semibold text-gray-900">No registration records found</p>
          <p className="text-xs text-gray-500">
            {search || status
              ? 'Try modifying your search or status filter.'
              : 'Registrations booked by staff will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Attendee</th>
                  <th className="px-5 py-3">Workshop</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Registered By & When</th>
                  <th className="px-5 py-3">Cancellation Audit</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {registrations.map((reg) => {
                  const isConfirmed = reg.status === 'CONFIRMED'

                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{reg.attendee_name}</div>
                        <div className="text-xs text-gray-500">{reg.attendee_email}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded mr-1.5">
                          {reg.workshop_code}
                        </span>
                        <span className="text-gray-900 font-medium text-xs">
                          {reg.workshop_title}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {isConfirmed ? (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                            Cancelled
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                        <div className="flex items-center text-gray-900 font-medium">
                          <User className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {reg.registered_by_name || 'Staff Member'}
                        </div>
                        <div className="flex items-center text-gray-500 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {formatDate(reg.registered_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {reg.status === 'CANCELLED' ? (
                          <div className="space-y-0.5">
                            <div className="text-red-700 font-medium">
                              By {reg.cancelled_by_name || 'Staff'} on {formatDate(reg.cancelled_at)}
                            </div>
                            {reg.cancellation_reason && (
                              <div className="text-gray-500 italic">
                                Reason: "{reg.cancellation_reason}"
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Seat active</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        {isConfirmed && (
                          <button
                            onClick={() => setSelectedToCancel(reg)}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      <CancelModal
        registration={selectedToCancel}
        isOpen={Boolean(selectedToCancel)}
        onClose={() => setSelectedToCancel(null)}
        onSuccess={loadHistory}
      />
    </div>
  )
}
