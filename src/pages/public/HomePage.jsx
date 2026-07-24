import { Link } from 'react-router-dom'
import { BookOpen, PlayCircle, ArrowRight, Shield, GraduationCap } from 'lucide-react'

const CARDS = [
  {
    to: '/sop',
    icon: BookOpen,
    title: 'SOP Library',
    desc: 'Standard Operating Procedures, guidelines and field protocols every officer should know.',
  },
  {
    to: '/training',
    icon: PlayCircle,
    title: 'Training Videos',
    desc: 'Watch official ZCPD training material — patrol, procedure and tactics — at your own pace.',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 sm:py-24 text-center">
        <img src="/logo.png" alt="ZCPD" className="w-20 h-20 object-contain mx-auto mb-6" />
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-a-400 bg-a-500/10 border border-a-500/20 rounded-full px-3 py-1 mb-5">
          <GraduationCap className="w-3.5 h-3.5" /> Probationary Officer Resources
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-g-text leading-tight mb-4">
          Zion City Police Department
        </h1>
        <p className="text-g-muted text-sm sm:text-base max-w-xl mx-auto mb-8">
          Everything a probationary officer needs to get started — standard procedures and
          training videos, freely available. No login required.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/sop" className="btn-primary"><BookOpen className="w-4 h-4" />Read the SOP</Link>
          <Link to="/training" className="btn-ghost"><PlayCircle className="w-4 h-4" />Watch training</Link>
        </div>
      </section>

      {/* Resource cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-16">
        {CARDS.map(c => (
          <Link key={c.to} to={c.to}
            className="card p-6 group hover:border-a-500/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-a-500/15 border border-a-500/25 flex items-center justify-center mb-4">
              <c.icon className="w-5 h-5 text-a-400" />
            </div>
            <h2 className="text-lg font-semibold text-g-text mb-1.5 flex items-center gap-2">
              {c.title}
              <ArrowRight className="w-4 h-4 text-a-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h2>
            <p className="text-sm text-g-muted">{c.desc}</p>
          </Link>
        ))}
      </section>

      {/* Staff note */}
      <section className="pb-20">
        <div className="card p-5 flex items-center gap-4">
          <Shield className="w-6 h-6 text-a-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-g-text">Are you FTO / FTI / FTC staff?</p>
            <p className="text-xs text-g-muted">Sign in to access officer records, the FTO portal and administration.</p>
          </div>
          <Link to="/login" className="btn-primary py-1.5 shrink-0">Login</Link>
        </div>
      </section>
    </div>
  )
}
