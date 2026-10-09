import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface HealthResponse {
  status: string
  timestamp: string
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkBackendHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/health`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setHealth(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkBackendHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Frontend Setup
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-3">
            Workshop Registration Service
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            React + Vite + TypeScript + Tailwind CSS
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-sm font-medium text-slate-700">React & TypeScript</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-sm font-medium text-slate-700">Tailwind CSS</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-sm font-medium text-slate-700">Backend API Connection</span>
            {loading ? (
              <span className="inline-flex items-center text-xs font-medium text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Checking...
              </span>
            ) : health ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> {error || 'Offline'}
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
          <span>Target: {API_BASE}</span>
          <button
            onClick={checkBackendHealth}
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </button>
        </div>
      </div>
    </div>
  )
}
