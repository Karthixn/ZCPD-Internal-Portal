import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage    from './pages/auth/LoginPage'
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

function L({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/login"   element={<LoginPage/>}/>

          <Route path="/dashboard" element={<L><Dashboard/></L>}/>
          <Route path="/sop"       element={<L><SOPPage/></L>}/>

          <Route path="/promotions" element={<L roles={['ftc','fti','fto']}><PromotionHistoryPage/></L>}/>
          <Route path="/officers"  element={<L roles={['ftc','fti','fto']}><OfficersPage/></L>}/>
          <Route path="/swat"      element={<L roles={['ftc','fti','fto']}><SwatPage/></L>}/>

          {/* FTO portal with nested routes */}
          <Route path="/fto/*"     element={<L roles={['ftc','fti','fto']}><FTOPortal/></L>}/>

          <Route path="/records"   element={<L roles={['ftc','fti']}><RecordsPage/></L>}/>
          <Route path="/weapons"   element={<L roles={['ftc','fti']}><WeaponsPage/></L>}/>
          <Route path="/salary"    element={<L roles={['ftc']}><SalaryPage/></L>}/>
          <Route path="/admin"     element={<L roles={['ftc']}><AdminPage/></L>}/>

          <Route path="*"          element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
