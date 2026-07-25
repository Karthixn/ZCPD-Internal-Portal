import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Users, Shield, Clock, Target, GraduationCap, TrendingUp, ChevronRight,
  Network, Award, UserPlus, FileText, Megaphone, XCircle, Calendar
} from 'lucide-react'
import { StatCard, RoleBadge } from '../components/ui'
import Avatar from '../components/ui/Avatar'

const RANK_ORDER = ['Chief Of Police','DGP','ADGP','Commissioner','DIG','IG','SP','DYSP','CI','SI','ASI','HC','CPO','PO']
const rankIndex = (r) => { const i = RANK_ORDER.indexOf(r); return i === -1 ? RANK_ORDER.length : i }

const STATUS_META = [
  ['ACTIVE',    'Active',    'bg-green-500'],
  ['LEAVE',     'On leave',  'bg-blue-500'],
  ['EXCEPTION', 'Exception', 'bg-purple-500'],
  ['INACTIVE',  'Inactive',  'bg-yellow-500'],
  ['TERMINATED','Terminated','bg-red-500'],
  ['RESIGNED',  'Resigned',  'bg-gray-500'],
]

export default function Dashboard() {
  const { officer, role, isFTO } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]       = useState({})
  const [chain, setChain]       = useState([])
  const [promos, setPromos]     = useState([])
  const [cadets, setCadets]     = useState([])
  const [cadetCount, setCadetCount] = useState(0)
  const [loading, setLoading]   = useState(true)

  const now = new Date()
  const hour = now.getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })

  useEffect(() => {
    async function load() {
      const [{ data: offs }, { data: cads }, { data: pr }] = await Promise.all([
        supabase.from('officers').select('id,name,rank,badge_no,designation,status,avatar_path'),
        supabase.from('cadet_applications').select('name,badge_no,status,batch_no').order('created_at', { ascending: false }).limit(5),
        supabase.from('promotion_history').select('*, officers(name,rank,badge_no,avatar_path)').order('promoted_date', { ascending: false }).limit(5),
      ])
      if (offs) {
        const c = offs.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a }, {})
        setStats({ total: offs.length, ...c })
        setChain([...offs].sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank)).slice(0, 5))
      }
      setCadets(cads ?? [])
      setPromos(pr ?? [])
      const { count } = await supabase.from('cadet_applications').select('*', { count: 'exact', head: true })
      setCadetCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const QUICK = [
    { label: 'Recruit new cadet',   path: '/fto/new-cadet',    icon: UserPlus },
    { label: 'File weekly report',  path: '/fto/new-report',   icon: FileText },
    { label: 'View all officers',   path: '/officers',         icon: Users },
    { label: 'Promotions',          path: '/promotions',       icon: TrendingUp },
    { label: 'Post an announcement',path: '/news',             icon: Megaphone },
  ]

  const v = (n) => loading ? '…' : (n ?? 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-g-text">{greet}, {officer?.name?.split(' ')[0] ?? 'Officer'} <span className="inline-block">👋</span></h1>
          <p className="text-sm text-g-muted mt-0.5">Here's what's happening in ZCPD today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 text-sm text-g-muted bg-n-800 border border-n-600 rounded-lg px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5"/>{dateStr}
          </span>
          <RoleBadge v={role}/>
        </div>
      </div>

      {!isFTO ? (
        <div className="card p-8 text-center">
          <Shield className="w-10 h-10 text-a-400 mx-auto mb-3"/>
          <h2 className="text-base font-semibold text-g-text mb-1">Welcome, {officer?.name ?? 'Officer'}</h2>
          <p className="text-g-muted text-sm">Use the sidebar to access the SOP library, training and your profile.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Users}        label="Total Officers" value={v(stats.total)}     color="text-a-400"       onClick={()=>navigate('/officers')}/>
            <StatCard icon={Shield}       label="Active"         value={v(stats.ACTIVE)}    color="text-green-400"   sub="On duty"/>
            <StatCard icon={Clock}        label="On Leave"       value={v(stats.LEAVE)}     color="text-blue-400"/>
            <StatCard icon={XCircle}      label="Inactive"       value={v(stats.INACTIVE)}  color="text-yellow-400"/>
            <StatCard icon={Award}        label="Exception"      value={v(stats.EXCEPTION)} color="text-purple-400"/>
            <StatCard icon={GraduationCap}label="Cadets"         value={v(cadetCount)}      color="text-teal-400"    sub="In training" onClick={()=>navigate('/fto')}/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chain of command preview */}
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-g-text flex items-center gap-2"><Network className="w-4 h-4 text-a-400"/>Chain of Command</h3>
                <button onClick={()=>navigate('/roster')} className="text-xs text-a-400 hover:underline flex items-center gap-1">View full hierarchy<ChevronRight className="w-3 h-3"/></button>
              </div>
              {loading ? <p className="text-sm text-g-muted">Loading…</p>
              : chain.length === 0 ? <p className="text-sm text-g-muted">No officers yet.</p>
              : <div className="space-y-2">
                  {chain.map((o, i) => (
                    <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-n-800 border border-n-600">
                      <span className="text-xs font-mono text-g-muted w-4 shrink-0">{i+1}</span>
                      <Avatar name={o.name} path={o.avatar_path} size={38} className="ring-2 ring-n-600 shrink-0"/>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-g-text truncate">{o.name}</p>
                        <p className="text-xs text-g-muted truncate">{o.rank}{o.designation ? ` · ${o.designation}` : ''}</p>
                      </div>
                      <span className="font-mono text-xs text-a-400 shrink-0">{o.badge_no}</span>
                    </div>
                  ))}
                </div>
              }
            </div>

            {/* Quick actions */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-g-text flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-a-400"/>Quick Actions</h3>
              <div className="space-y-2">
                {QUICK.map(a => (
                  <button key={a.path} onClick={()=>navigate(a.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-n-800 border border-n-600 hover:border-a-500/40 text-sm text-g-text hover:text-a-400 transition-colors group">
                    <a.icon className="w-4 h-4 text-a-400 shrink-0"/>
                    <span className="flex-1 text-left">{a.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-g-muted group-hover:translate-x-0.5 transition-transform"/>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Force status breakdown */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-g-text flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-a-400"/>Force Status</h3>
              <div className="space-y-3">
                {STATUS_META.map(([key, label, bar]) => {
                  const n = stats[key] ?? 0
                  const pct = stats.total ? Math.round((n / stats.total) * 100) : 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-g-sub">{label}</span>
                        <span className="font-mono text-g-muted">{loading ? '…' : n}</span>
                      </div>
                      <div className="h-1.5 bg-n-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent promotions */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-g-text flex items-center gap-2"><Award className="w-4 h-4 text-a-400"/>Recent Promotions</h3>
                <button onClick={()=>navigate('/promotions')} className="text-xs text-a-400 hover:underline">View all</button>
              </div>
              {loading ? <p className="text-sm text-g-muted">Loading…</p>
              : promos.length === 0 ? <p className="text-sm text-g-muted">No promotions logged yet.</p>
              : <div className="space-y-3">
                  {promos.map(p => (
                    <div key={p.id} className="flex items-center gap-3">
                      <Avatar name={p.officers?.name} path={p.officers?.avatar_path} size={34} className="ring-2 ring-n-600 shrink-0"/>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-g-text truncate">{p.officers?.name ?? '—'}</p>
                        <p className="text-xs text-g-muted truncate">{p.from_rank ? `${p.from_rank} → ` : ''}<span className="text-a-400">{p.to_rank}</span></p>
                      </div>
                      <span className="text-xs text-g-muted shrink-0">{p.promoted_date}</span>
                    </div>
                  ))}
                </div>
              }
            </div>

            {/* Recent cadets */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-g-text flex items-center gap-2"><GraduationCap className="w-4 h-4 text-a-400"/>Recent Cadets</h3>
                <button onClick={()=>navigate('/fto')} className="text-xs text-a-400 hover:underline">View all</button>
              </div>
              {loading ? <p className="text-sm text-g-muted">Loading…</p>
              : cadets.length === 0 ? <p className="text-sm text-g-muted">No cadets yet.</p>
              : <div className="space-y-2.5">
                  {cadets.map(c => (
                    <div key={c.badge_no ?? c.name} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-g-text truncate">{c.name}</p>
                        <p className="text-xs text-g-muted truncate">{c.badge_no} · Batch {c.batch_no}</p>
                      </div>
                      <span className="text-xs text-g-muted shrink-0">{c.status}</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </>
      )}
    </div>
  )
}
