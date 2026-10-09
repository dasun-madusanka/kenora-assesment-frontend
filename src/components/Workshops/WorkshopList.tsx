import React, { useState, useEffect, useCallback } from 'react'
import { Workshop } from '../../types'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { WorkshopModal, WorkshopFormData } from './WorkshopModal'
import { RegisterModal } from './RegisterModal'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  User,
  Users,
  RotateCcw,
} from 'lucide-react'

export const WorkshopList: React.FC = () => {
  const { user } = useAuth()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [seatsAvailable, setSeatsAvailable] = useState(false)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [registeringWorkshop, setRegisteringWorkshop] = useState<Workshop | null>(null)

  const isManager = user?.role === 'MANAGER'

  const loadWorkshops = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.workshops.list({
        search: search || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        seatsAvailable: seatsAvailable || undefined,
      })
      setWorkshops(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workshops')
    } finally {
      setLoading(false)
    }
  }, [search, status, from, to, seatsAvailable])

  useEffect(() => {
    loadWorkshops()
  }, [loadWorkshops])

  const handleResetFilters = () => {
    setSearch('')
    setStatus('')
    setFrom('')
    setTo('')
    setSeatsAvailable(false)
  }

  const handleSaveWorkshop = async (formData: WorkshopFormData) => {
    if (editingWorkshop) {
      await api.workshops.update(editingWorkshop.id, formData)
    } else {
      await api.workshops.create(formData)
    }
    await loadWorkshops()
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const getStatusBadge = (wStatus: string) => {
    switch (wStatus) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Workshop Catalogue</h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse upcoming workshops, verify available seats, and register attendees.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              setEditingWorkshop(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Workshop
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, code, instructor..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              title="From date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date to */}
          <div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              title="To date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick filters row */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 gap-2">
          <label className="inline-flex items-center text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={seatsAvailable}
              onChange={(e) => setSeatsAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
            />
            Show only workshops with available seats
          </label>

          {(search || status || from || to || seatsAvailable) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Workshop Cards / Table */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
          Loading workshops...
        </div>
      ) : workshops.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-gray-200 p-8 space-y-3">
          <Filter className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900">No workshops found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            No workshops match your current search filters. Try clearing filters or scheduling a new workshop.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workshops.map((w) => {
            const isFull = w.available_seats <= 0
            const canBook = w.status !== 'CANCELLED' && w.status !== 'COMPLETED'

            return (
              <div
                key={w.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {w.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusBadge(w.status)}`}>
                      {w.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mt-2 line-clamp-1" title={w.title}>
                    {w.title}
                  </h3>

                  {w.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {w.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{w.instructor}</span>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{w.location}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{formatDate(w.start_time)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {w.active_registrations} / {w.capacity} seats booked
                      </span>
                    </div>

                    {isFull ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        Full
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        {w.available_seats} left
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    {canBook && (
                      <button
                        onClick={() => setRegisteringWorkshop(w)}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium text-white transition-colors ${
                          isFull
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isFull ? 'Waitlist' : 'Register'}
                      </button>
                    )}

                    {isManager && (
                      <button
                        onClick={() => {
                          setEditingWorkshop(w)
                          setIsModalOpen(true)
                        }}
                        className="py-1.5 px-3 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <WorkshopModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingWorkshop(null)
        }}
        onSubmit={handleSaveWorkshop}
        initialData={editingWorkshop}
      />

      <RegisterModal
        workshop={registeringWorkshop}
        isOpen={Boolean(registeringWorkshop)}
        onClose={() => setRegisteringWorkshop(null)}
        onSuccess={loadWorkshops}
      />
    </div>
  )
}
