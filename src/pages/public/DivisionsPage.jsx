import { PageHeader } from '../../components/ui'
import { useSiteContent } from '../../lib/siteContent'
import { Network, Shield, Car, Target, GraduationCap, Search, Radio, Crown } from 'lucide-react'

/* Icons/colours are cycled by position so any custom divisions list still looks good. */
const STYLES = [
  { icon: Crown,         color: 'text-amber-300' },
  { icon: Shield,        color: 'text-blue-300' },
  { icon: GraduationCap, color: 'text-teal-300' },
  { icon: Target,        color: 'text-purple-300' },
  { icon: Car,           color: 'text-emerald-300' },
  { icon: Search,        color: 'text-rose-300' },
  { icon: Radio,         color: 'text-sky-300' },
]

export default function DivisionsPage() {
  const divisions = useSiteContent('divisions')
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Network} title="Divisions & Units" sub="The specialised teams that make up the Zion City Police Department" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(divisions || []).map((d, i) => {
          const s = STYLES[i % STYLES.length]
          return (
            <div key={d.name + i} className="card p-5 hover:border-a-500/40 transition-colors">
              <div className={`w-11 h-11 rounded-xl bg-current/10 flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-g-text mb-1.5">{d.name}</h2>
              <p className="text-sm text-g-muted leading-relaxed">{d.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
