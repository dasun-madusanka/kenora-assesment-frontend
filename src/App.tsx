import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Login } from './components/Login'
import { WorkshopList } from './components/Workshops/WorkshopList'
import { RegistrationHistory } from './components/Registrations/RegistrationHistory'

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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'workshops' && <WorkshopList />}
        {activeTab === 'registrations' && <RegistrationHistory />}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Staff Accounts & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">
              Admin controls to create staff accounts and set roles.
            </p>
          </div>
        )}
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
