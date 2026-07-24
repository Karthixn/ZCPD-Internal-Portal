import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import PublicLayout from './components/layout/PublicLayout'
import { Shield } from 'lucide-react'
import LoginPage    from './pages/auth/LoginPage'
import HomePage     from './pages/public/HomePage'
import TrainingPage from './pages/public/TrainingPage'
import Dashboard    from './pages/Dashboard'
import OfficersPage from './pages/officers/OfficersPage'
import SwatPage     from './pages/swat/SwatPage'
import FTOPortal    from './pages/fto/FTOPortal'
import RecordsPage  from './pages/records/RecordsPage'
import WeaponsPage  from './pages/weapons/WeaponsPage'
import SalaryPage   from './pages/salary/SalaryPage'
import AdminPage    from './pages/admin/AdminPage'
import SOPPage      from './pages/sop/SOPPage'
import PromotionHistoryPage from './pages/promotions/PromotionHistoryPage'

/* Protected portal route (sidebar shell + role gate) */
function L({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function Loader() {
  return (
    <div className="min-h-screen bg-n-900 flex items-center justify-center">
      <Shield className="w-8 h-8 text-a-500 animate-pulse"/>
    </div>
  )
}

/* Renders inside the portal shell when signed in, or the public shell when not.
   Used for pages that exist in both worlds (SOP, Training). */
function Auto({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader/>
  return user ? <AppLayout>{children}</AppLayout> : <PublicLayout>{children}</PublicLayout>
}

/* Root: signed-in users land on the dashboard, everyone else sees the public home. */
function Root() {
  const { user, loading } = useAuth()
  if (loading) return <Loader/>
  return user ? <Navigate to="/dashboard" replace/> : <PublicLayout><HomePage/></PublicLayout>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Root/>}/>
          <Route path="/login"   element={<LoginPage/>}/>

          {/* Public + internal (auth-aware layout) */}
          <Route path="/sop"      element={<Auto><SOPPage/></Auto>}/>
          <Route path="/training" element={<Auto><TrainingPage/></Auto>}/>

          {/* Internal-only */}
          <Route path="/dashboard" element={<L><Dashboard/></L>}/>

          <Route path="/promotions" element={<L roles={['ftc','fti','fto']}><PromotionHistoryPage/></L>}/>
          <Route path="/officers"  element={<L roles={['ftc','fti','fto']}><OfficersPage/></L>}/>
          <Route path="/swat"      element={<L roles={['ftc','fti','fto','swat']}><SwatPage/></L>}/>

          {/* FTO portal with nested routes */}
          <Route path="/fto/*"     element={<L roles={['ftc','fti','fto']}><FTOPortal/></L>}/>

          <Route path="/records"   element={<L roles={['ftc','fti']}><RecordsPage/></L>}/>
          <Route path="/weapons"   element={<L roles={['ftc','fti']}><WeaponsPage/></L>}/>
          <Route path="/salary"    element={<L roles={['ftc']}><SalaryPage/></L>}/>
          <Route path="/admin"     element={<L roles={['ftc']}><AdminPage/></L>}/>

          <Route path="*"          element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
