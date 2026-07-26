import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, Network, Megaphone, Scale, HelpCircle, ShieldCheck } from 'lucide-react'

const CARDS = [
  {
    to: '/news',
    icon: Megaphone,
    title: 'News & Announcements',
    desc: 'The latest press releases and official updates from the Zion City Police Department.',
  },
  {
    to: '/join',
    icon: GraduationCap,
    title: 'Join ZCPD',
    desc: 'Ready to serve? See the requirements and how to become a Zion City police officer.',
  },
  {
    to: '/roster',
    icon: Network,
    title: 'Chain of Command',
    desc: 'The ZCPD rank structure and the officers who serve at each level of the department.',
  },
  {
    to: '/divisions',
    icon: Network,
    title: 'Divisions & Units',
    desc: 'Meet the specialised teams — Patrol, SWAT, Traffic, Investigations and more.',
  },
  {
    to: '/services',
    icon: Scale,
    title: 'Citizen Services',
    desc: 'Licenses, how to report a crime, request records or file a complaint.',
  },
  {
    to: '/faq',
    icon: HelpCircle,
    title: 'FAQ',
    desc: 'Know your rights and how to work with the ZCPD in common situations.',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-10 sm:py-16 text-center">
        <img src="/logo.png" alt="ZCPD" className="w-20 h-20 object-contain mx-auto mb-5" />
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-a-300 bg-a-500/15 border border-a-400/30 rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" /> Serving & Protecting Zion City
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-g-text leading-tight mb-4">
          Zion City Police Department
        </h1>
        <p className="text-g-muted text-sm sm:text-base max-w-xl mx-auto mb-7">
          Official information for the citizens of Zion City — news, services and how to reach us.
          Looking to serve? Learn how to join the force.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/join" className="btn-primary"><GraduationCap className="w-4 h-4" />Join ZCPD</Link>
          <Link to="/news" className="btn-ghost"><Megaphone className="w-4 h-4" />Latest news</Link>
        </div>
      </section>

      {/* Resource cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
        {CARDS.map(c => (
          <Link key={c.to} to={c.to}
            className="card p-6 group hover:border-a-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-150">
            <div className="w-11 h-11 rounded-xl bg-a-500/15 border border-a-500/25 flex items-center justify-center mb-4 group-hover:bg-a-500/25 transition-colors">
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

    </div>
  )
}
