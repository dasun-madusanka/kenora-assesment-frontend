import React from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, Calendar, Users, ClipboardList } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth()

  if (!user) return null

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'STAFF':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                W
              </div>
              <span className="font-semibold text-gray-900 text-base sm:text-lg">
                Workshop Service
              </span>
            </div>

            <nav className="flex space-x-2">
              {user.role === 'ADMIN' ? (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  Staff Accounts
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('workshops')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'workshops'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Workshops
                  </button>

                  <button
                    onClick={() => setActiveTab('registrations')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'registrations'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 mr-1.5" />
                    Registrations & History
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getRoleBadgeClass(user.role)}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
