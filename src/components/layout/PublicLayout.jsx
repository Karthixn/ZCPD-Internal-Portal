import { NavLink, Link } from 'react-router-dom'
import { useSiteContent } from '../../lib/siteContent'

function Tab({ to, label }) {
  return (
    <NavLink to={to} end className={({ isActive }) =>
      `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
       ${isActive ? 'bg-a-500/15 text-a-400' : 'text-g-muted hover:text-g-text hover:bg-white/5'}`
    }>
      {label}
    </NavLink>
  )
}

export default function PublicLayout({ children }) {
  const nav = useSiteContent('nav')
  return (
    <div className="min-h-screen flex flex-col bg-n-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-n-600 bg-n-800/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 sm:px-6 h-14">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="ZCPD" className="w-8 h-8 object-contain" />
            <div className="leading-tight hidden sm:block">
              <p className="text-xs font-bold text-g-text tracking-wider">ZCPD</p>
              <p className="text-[10px] text-g-muted">Officer Resources</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 ml-2 overflow-x-auto no-scrollbar">
            {(nav || []).filter(t => t.visible !== false).map(t => <Tab key={t.path} to={t.path} label={t.label} />)}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-n-600 py-4">
        <p className="text-center text-xs text-g-muted">© Zion City Police Department · Internal Systems</p>
      </footer>
    </div>
  )
}
