import { PageHeader } from '../../components/ui'
import { useSiteContent } from '../../lib/siteContent'
import { GraduationCap, CheckCircle2, ClipboardList, TrendingUp, Users } from 'lucide-react'

export default function JoinPage() {
  const c = useSiteContent('join')
  const REQUIREMENTS = c.requirements || []
  const STEPS = (c.steps || []).map(s => [s.title, s.desc])
  const LADDER = c.ladder || []
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={GraduationCap} title="Join ZCPD" sub="Serve Zion City — become a police officer" />

      {/* Intro */}
      <div className="card p-6 mb-6">
        <p className="text-sm text-g-sub leading-relaxed whitespace-pre-line">{c.intro}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Requirements */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-a-400" /><h2 className="text-base font-semibold text-g-text">Requirements</h2></div>
          <ul className="space-y-2.5">
            {REQUIREMENTS.map(r => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-g-sub">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{r}
              </li>
            ))}
          </ul>
        </div>

        {/* Rank progression */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-a-400" /><h2 className="text-base font-semibold text-g-text">Grow Your Career</h2></div>
          <p className="text-sm text-g-sub mb-4">Every officer starts as a Probationary Officer and earns promotions through service, duty hours and merit.</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {LADDER.map((r, i) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-semibold text-a-400 bg-a-500/10 border border-a-500/20 rounded px-2 py-1">{r}</span>
                {i < LADDER.length - 1 && <span className="text-g-muted">→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5"><Users className="w-4 h-4 text-a-400" /><h2 className="text-base font-semibold text-g-text">The Recruitment Process</h2></div>
        <div className="space-y-3">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-a-500/15 border border-a-500/25 text-a-400 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-g-text">{t}</p>
                <p className="text-sm text-g-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card p-6 text-center bg-a-500/5 border-a-500/20">
        <h2 className="text-lg font-semibold text-g-text mb-1.5">Ready to apply?</h2>
        <p className="text-sm text-g-muted whitespace-pre-line">{c.applyNote}</p>
      </div>
    </div>
  )
}
