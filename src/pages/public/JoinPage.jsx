import { PageHeader } from '../../components/ui'
import { GraduationCap, CheckCircle2, ClipboardList, TrendingUp, Users } from 'lucide-react'

const REQUIREMENTS = [
  'Be an active, verified member of the Zion City community',
  'Maintain a clean record (no serious active charges)',
  'A working microphone and clear communication',
  'Commitment to professional, fair role-play at all times',
  'Willingness to learn and follow the ZCPD SOP',
]

const STEPS = [
  ['Apply', 'Submit a recruitment application through the ZCPD Discord.'],
  ['Interview', 'Attend a short interview with a Field Training Instructor (FTI).'],
  ['Academy', 'Complete basic training on laws, procedure and radio protocol.'],
  ['Field Training', 'Ride along with an FTO across the training phases until signed off.'],
  ['Sworn In', 'Pass your final evaluation and be sworn in as a Constable.'],
]

const LADDER = ['PO', 'CPO', 'HC', 'ASI', 'SI', 'CI', 'DYSP', 'SP', '…']

export default function JoinPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={GraduationCap} title="Join ZCPD" sub="Serve Zion City — become a police officer" />

      {/* Intro */}
      <div className="card p-6 mb-6">
        <p className="text-sm text-g-sub leading-relaxed">
          The Zion City Police Department is always looking for dedicated recruits who want to protect the
          community and uphold the law. No prior experience is required — our Field Training program will
          teach you everything from patrol procedure to radio communication. If you're ready to earn the
          badge, here's how to get started.
        </p>
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
        <p className="text-sm text-g-muted mb-4">Applications are handled through the official ZCPD Discord server.</p>
        <p className="text-xs text-g-muted">Ask a staff member for the current recruitment link.</p>
      </div>
    </div>
  )
}
