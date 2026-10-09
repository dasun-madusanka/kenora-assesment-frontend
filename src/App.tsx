import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Login } from './components/Login'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('workshops')

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      setActiveTab('users')
    } else {
      setActiveTab('workshops')
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm font-medium text-gray-500 animate-pulse">
          Loading workspace...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {activeTab === 'users' ? 'Staff Accounts Management' : activeTab === 'workshops' ? 'Workshop Catalogue' : 'Registrations & History'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Logged in as <span className="font-medium text-gray-700">{user.name}</span> ({user.role})
          </p>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
