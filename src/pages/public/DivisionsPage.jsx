import { PageHeader } from '../../components/ui'
import { Network, Shield, Car, Target, GraduationCap, Search, Radio, Crown } from 'lucide-react'

const DIVISIONS = [
  { icon: Crown,         name: 'Command Staff',        color: 'text-amber-300',   desc: 'Senior leadership responsible for strategy, policy and overall command of the department.' },
  { icon: Shield,        name: 'Patrol Division',      color: 'text-blue-300',    desc: 'The backbone of ZCPD — uniformed officers responding to calls, patrolling zones and serving the public day and night.' },
  { icon: GraduationCap, name: 'Field Training (FTO)', color: 'text-teal-300',    desc: 'Trains and evaluates every new recruit through structured phases before they patrol independently.' },
  { icon: Target,        name: 'S.W.A.T',              color: 'text-purple-300',  desc: 'Special Weapons And Tactics — the elite unit deployed for high-risk situations, hostage rescue and heavily armed suspects.' },
  { icon: Car,           name: 'Traffic Division',     color: 'text-emerald-300', desc: 'Enforces road safety, manages pursuits and PIT operations, and responds to collisions across the city.' },
  { icon: Search,        name: 'Investigations (CID)', color: 'text-rose-300',    desc: 'Detectives who handle serious crimes, gather evidence, execute warrants and follow cases from scene to court.' },
  { icon: Radio,         name: 'Dispatch & ZIMS',      color: 'text-sky-300',     desc: 'Coordinates units over radio, prioritises calls and manages incidents through the Zephyr Incident Management System.' },
]

export default function DivisionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Network} title="Divisions & Units" sub="The specialised teams that make up the Zion City Police Department" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DIVISIONS.map(d => (
          <div key={d.name} className="card p-5 hover:border-a-500/40 transition-colors">
            <div className={`w-11 h-11 rounded-xl bg-current/10 flex items-center justify-center mb-3 ${d.color}`}>
              <d.icon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-g-text mb-1.5">{d.name}</h2>
            <p className="text-sm text-g-muted leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
