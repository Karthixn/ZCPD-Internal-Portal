import { NavLink, Link } from 'react-router-dom'

function Tab({ to, label }) {
  return (
    <NavLink to={to} end className={({ isActive }) =>
      `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
       ${isActive ? 'bg-a-500/15 text-a-400' : 'text-g-muted hover:text-g-text hover:bg-white/5'}`
    }>
      {label}
    </NavLink>
  )
}

export default function PublicLayout({ children }) {
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
            <Tab to="/" label="Home" />
            <Tab to="/news" label="News" />
            <Tab to="/join" label="Join" />
            <Tab to="/roster" label="Command" />
            <Tab to="/divisions" label="Divisions" />
            <Tab to="/services" label="Services" />
            <Tab to="/faq" label="FAQ" />
            <Tab to="/sop" label="SOP" />
            <Tab to="/training" label="Training" />
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
