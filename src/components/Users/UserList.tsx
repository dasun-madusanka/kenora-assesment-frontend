import React, { useState, useEffect, useCallback } from 'react'
import { User, UserRole } from '../../types'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { UserModal } from './UserModal'
import { Plus, Search, CheckCircle, AlertCircle } from 'lucide-react'

export const UserList: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.users.list()
      setUsers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load staff accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setUpdatingId(userId)
    setError(null)
    setSuccessMsg(null)

    try {
      await api.users.updateRole(userId, newRole)
      setSuccessMsg(`Role updated to ${newRole}`)
      await loadUsers()
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'MANAGER':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'STAFF':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Accounts & Permissions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Create user accounts and set roles across the community centre team.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Staff Account
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, or role..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
          Loading accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-base font-semibold text-gray-900">No accounts found</p>
          <p className="text-xs text-gray-500 mt-1">
            {search ? 'No staff member matches your query.' : 'Click Create Staff Account to add a team member.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Access Capabilities</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Update Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 flex items-center">
                          {u.name}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-normal">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-600">
                        {u.role === 'ADMIN' && (
                          <span className="text-purple-700">Account management & role assignment</span>
                        )}
                        {u.role === 'MANAGER' && (
                          <span className="text-blue-700">Add/edit workshops, registrations, and history</span>
                        )}
                        {u.role === 'STAFF' && (
                          <span className="text-emerald-700">Register & cancel attendees, view catalogue</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <select
                          disabled={updatingId === u.id || isCurrent}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="STAFF">Staff</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Account Creation Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadUsers}
      />
    </div>
  )
}
