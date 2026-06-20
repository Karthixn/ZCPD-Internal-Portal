import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield } from 'lucide-react'

export default function ProtectedRoute({ children, roles=[] }) {
  const { user, role, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-n-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Shield className="w-8 h-8 text-a-500 animate-pulse"/>
        <p className="text-g-muted text-sm">Verifying credentials…</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace/>
  if (roles.length && !roles.includes(role)) return (
    <div className="min-h-screen bg-n-900 flex items-center justify-center">
      <div className="card p-8 text-center max-w-sm">
        <Shield className="w-10 h-10 text-red-400 mx-auto mb-3"/>
        <h2 className="text-base font-semibold text-g-text mb-1">Access denied</h2>
        <p className="text-g-muted text-sm">Your role does not have permission to view this page.</p>
      </div>
    </div>
  )
  return children
}
