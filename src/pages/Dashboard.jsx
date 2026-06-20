import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, Shield, Target, GraduationCap, TrendingUp, ChevronRight, Bell, Clock } from 'lucide-react'
import { StatCard, RoleBadge, StatusBadge } from '../components/ui'

export default function Dashboard() {
  const { officer, role, isFTO, isFTC } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState({})
  const [cadets, setCadets]   = useState([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    async function load() {
      const [{ data: offs }, { data: cads }] = await Promise.all([
        supabase.from('officers').select('status'),
        supabase.from('cadet_applications').select('name,badge_no,status,batch_no').order('created_at',{ascending:false}).limit(6)
      ])
      if (offs) {
        const c = offs.reduce((a,o) => { a[o.status] = (a[o.status]||0)+1; return a }, {})
        setStats({ total: offs.length, ...c })
      }
      setCadets(cads ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const QUICK = [
    { label:'Add cadet application', path:'/fto/new-cadet' },
    { label:'File weekly FTO report', path:'/fto/new-report' },
    { label:'Log phase training session', path:'/fto/new-training' },
    { label:'Submit PO test result', path:'/fto/new-potest' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-g-muted text-sm">{greet},</p>
          <h1 className="text-2xl font-bold text-g-text mt-0.5">
            {officer?.name ?? 'Officer'}
            {officer?.rank && <span className="text-g-muted font-normal text-lg ml-2">— {officer.rank}</span>}
          </h1>
        </div>
        <RoleBadge v={role}/>
      </div>

      {/* Announcement */}
      <div className="card border-l-4 border-l-a-500 p-4 flex items-center gap-3">
        <Bell className="w-4 h-4 text-a-400 shrink-0"/>
        <p className="text-sm text-g-sub">Welcome to the ZCPD Internal Portal. All activity is logged. Contact your FTC for any access issues.</p>
      </div>

      {/* Stats */}
      {isFTO && (
        <>
          <p className="section-title">Department overview</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}  label="Total officers" value={loading?'…':stats.total??0}      color="text-a-400" onClick={()=>navigate('/officers')}/>
            <StatCard icon={Shield} label="Active"         value={loading?'…':stats.ACTIVE??0}     color="text-green-400" sub="On duty"/>
            <StatCard icon={Clock}  label="Leave / exception" value={loading?'…':((stats.LEAVE??0)+(stats.EXCEPTION??0))} color="text-yellow-400"/>
            <StatCard icon={Target} label="S.W.A.T"        value="View" color="text-blue-400"      sub="Roster" onClick={()=>navigate('/swat')}/>
          </div>
        </>
      )}

      {/* FTO actions + recent cadets */}
      {isFTO && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-g-text flex items-center gap-2"><GraduationCap className="w-4 h-4 text-a-400"/>Recent cadets</h3>
              <button onClick={()=>navigate('/fto')} className="text-xs text-a-400 hover:underline">View all</button>
            </div>
            {loading ? <p className="text-sm text-g-muted">Loading…</p>
            : cadets.length === 0 ? <p className="text-sm text-g-muted">No cadets yet.</p>
            : <div className="space-y-0">
                {cadets.map(c => (
                  <div key={c.badge_no??c.name} className="flex items-center justify-between py-2.5 border-b border-n-600/50 last:border-0">
                    <div><p className="text-sm font-medium text-g-text">{c.name}</p><p className="text-xs text-g-muted">{c.badge_no} · Batch {c.batch_no}</p></div>
                    <StatusBadge v={c.status}/>
                  </div>
                ))}
              </div>
            }
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-g-text flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-a-400"/>Quick actions</h3>
            <div className="space-y-2">
              {QUICK.map(a => (
                <button key={a.path} onClick={()=>navigate(a.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-n-800 border border-n-600 hover:border-a-500/40 text-sm text-g-text hover:text-a-400 transition-colors">
                  {a.label}<ChevronRight className="w-3.5 h-3.5 text-g-muted"/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Officer-only view */}
      {!isFTO && (
        <div className="card p-8 text-center">
          <Shield className="w-10 h-10 text-a-400 mx-auto mb-3"/>
          <h2 className="text-base font-semibold text-g-text mb-1">Welcome, {officer?.name ?? 'Officer'}</h2>
          <p className="text-g-muted text-sm">Use the sidebar to access the SOP library and your profile.</p>
        </div>
      )}
    </div>
  )
}
