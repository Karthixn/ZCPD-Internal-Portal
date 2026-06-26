import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Shield, Users, Target, BookOpen, FileText,
  DollarSign, Crosshair, Settings, LogOut,
  GraduationCap, TrendingUp, ChevronLeft, ChevronRight, Menu
} from 'lucide-react'
import { RoleBadge } from '../ui'

function NI({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
       ${isActive ? 'bg-a-500/15 text-a-400 border border-a-500/20' : 'text-g-muted hover:text-g-text hover:bg-white/5'}
       ${collapsed ? 'justify-center' : ''}`
    }>
      <Icon className="w-4 h-4 shrink-0"/>
      {!collapsed && <span className="font-medium">{label}</span>}
    </NavLink>
  )
}

export default function AppLayout({ children }) {
  const { profile, officer, role, signOut, isFTC, isFTI, isFTO } = useAuth()
  const navigate = useNavigate()
  const [col, setCol] = useState(false)
  const [mob, setMob] = useState(false)

  const nav = [
    { to:'/dashboard',  icon:Shield,        label:'Dashboard',    show:true },
    { to:'/officers',   icon:Users,         label:'Officers',     show:isFTO },
    { to:'/promotions', icon:TrendingUp,    label:'Promotions',   show:isFTO },
    { to:'/swat',       icon:Target,        label:'S.W.A.T',      show:isFTO },
    { to:'/fto',        icon:GraduationCap, label:'FTO Portal',   show:isFTO },
    { to:'/records',    icon:FileText,      label:'Records',      show:isFTI },
    { to:'/weapons',    icon:Crosshair,     label:'Weapon Log',   show:isFTI },
    { to:'/salary',     icon:DollarSign,    label:'Salary & Duty',show:isFTC },
    { to:'/sop',        icon:BookOpen,      label:'SOP Library',  show:true  },
    { to:'/admin',      icon:Settings,      label:'Admin',        show:isFTC },
  ].filter(n => n.show)

  const sidebar = (
    <div className={`relative flex flex-col h-full bg-n-800 border-r border-n-600 transition-all duration-200 ${col ? 'w-[60px]' : 'w-56'}`}>
      {/* Logo */}
      <div className={`flex items-center border-b border-n-600 p-4 ${col ? 'justify-center' : 'gap-3'}`}>
        <img src="/logo.png" alt="ZCPD" className="w-8 h-8 object-contain shrink-0"/>
        {!col && <div><p className="text-xs font-bold text-g-text tracking-wider">ZCPD</p><p className="text-[10px] text-g-muted">Internal Portal</p></div>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map(n => <NI key={n.to} {...n} collapsed={col}/>)}
      </nav>

      {/* Profile + signout */}
      <div className="border-t border-n-600 p-3 space-y-1">
        {!col && (
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-sm font-medium text-g-text truncate">{officer?.name ?? profile?.email ?? 'Officer'}</p>
              <RoleBadge v={role}/>
            </div>
            <p className="text-xs text-g-muted">{officer?.rank ?? ''} {officer?.badge_no ? `· ${officer.badge_no}` : ''}</p>
          </div>
        )}
        <button onClick={async () => { await signOut(); navigate('/login') }}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-g-muted hover:text-red-400 hover:bg-red-900/10 transition-colors text-sm ${col ? 'justify-center' : ''}`}>
          <LogOut className="w-4 h-4 shrink-0"/>
          {!col && 'Sign out'}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCol(c => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-n-800 border border-n-600 rounded-full hidden lg:flex items-center justify-center text-g-muted hover:text-g-text transition-colors z-10">
        {col ? <ChevronRight className="w-3 h-3"/> : <ChevronLeft className="w-3 h-3"/>}
      </button>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-n-900">
      <div className="relative hidden lg:block">{sidebar}</div>

      {/* Mobile overlay */}
      {mob && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMob(false)}/>
          <div className="absolute left-0 top-0 h-full z-10">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-n-600 bg-n-800">
          <button onClick={() => setMob(true)} className="text-g-muted"><Menu className="w-5 h-5"/></button>
          <div className="flex items-center gap-2"><img src="/logo.png" alt="ZCPD" className="w-6 h-6 object-contain"/><span className="text-sm font-semibold">ZCPD</span></div>
          <RoleBadge v={role}/>
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
