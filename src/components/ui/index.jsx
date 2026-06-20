import { ChevronDown, X, Loader2 } from 'lucide-react'

/* ── Status / Role badges ── */
const SC = { ACTIVE:'s-active', INACTIVE:'s-inactive', LEAVE:'s-leave', EXCEPTION:'s-exception', TERMINATED:'s-terminated', RESIGNED:'s-resigned' }
export function StatusBadge({ v }) {
  if (!v) return <span className="text-g-muted text-xs">—</span>
  return <span className={SC[v] ?? 's-inactive'}>{v}</span>
}
const RC = { ftc:'r-ftc', fti:'r-fti', fto:'r-fto', officer:'r-officer' }
export function RoleBadge({ v }) {
  return <span className={RC[v] ?? 'r-officer'}>{v?.toUpperCase()}</span>
}

/* ── Page header ── */
export function PageHeader({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && <div className="w-9 h-9 rounded-lg bg-a-500/15 border border-a-500/25 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-a-400"/>
        </div>}
        <div>
          <h1 className="page-title">{title}</h1>
          {sub && <p className="text-sm text-g-muted mt-0.5">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ── Spinner ── */
export function Spinner({ className='' }) {
  return <Loader2 className={`animate-spin text-a-400 ${className}`}/>
}

/* ── Empty state ── */
export function Empty({ icon: Icon, title, desc }) {
  return (
    <div className="py-16 text-center">
      {Icon && <div className="w-12 h-12 rounded-xl bg-a-500/10 border border-a-500/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-a-400"/>
      </div>}
      <p className="font-medium text-g-text mb-1">{title}</p>
      {desc && <p className="text-sm text-g-muted">{desc}</p>}
    </div>
  )
}

/* ── Select wrapper ── */
export function Select({ value, onChange, children, className='' }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={`inp pr-8 ${className}`}>{children}</select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-g-muted pointer-events-none"/>
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, wide=false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}/>
      <div className={`relative card p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-g-text">{title}</h2>
          <button onClick={onClose} className="text-g-muted hover:text-g-text transition-colors"><X className="w-4 h-4"/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Form field ── */
export function Field({ label, children, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

/* ── Stat card ── */
export function StatCard({ icon: Icon, label, value, color='text-a-400', onClick, sub }) {
  return (
    <div className={`card p-4 ${onClick ? 'cursor-pointer hover:border-a-500/40 transition-colors' : ''}`} onClick={onClick}>
      <div className={`w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4"/>
      </div>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-sm text-g-text mt-0.5">{label}</p>
      {sub && <p className="text-xs text-g-muted mt-1">{sub}</p>}
    </div>
  )
}

/* ── Phase pill ── */
const PP = { 'COMPLETED':'bg-green-900/40 text-green-300 border-green-700/40', 'IN PROGRESS':'bg-yellow-900/40 text-yellow-300 border-yellow-700/40', 'NOT COMPLETED':'bg-n-600/60 text-g-muted border-n-500/40' }
export function PhasePill({ v }) {
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PP[v] ?? PP['NOT COMPLETED']}`}>{v ?? 'NOT COMPLETED'}</span>
}

/* ── Score bar ── */
export function ScoreBar({ score, max=50 }) {
  const pct = Math.round((score/max)*100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-n-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width:`${pct}%` }}/>
      </div>
      <span className="text-xs font-mono text-g-sub">{score}/{max}</span>
    </div>
  )
}
