import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Settings, Plus, Users, Shield, AlertCircle } from 'lucide-react'
import { PageHeader, RoleBadge, Modal, Field, Select, Spinner, Empty, StatCard } from '../../components/ui'

const ROLES = ['ftc','fti','fto','officer']
const BLANK_USER = { email:'', password:'', role:'officer', officer_id:'' }

export default function AdminPage() {
  const [profiles, setProfiles] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(BLANK_USER)
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState('')
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  async function load() {
    setLoading(true)
    const [{ data:p },{ data:o }] = await Promise.all([
      supabase.from('profiles').select('*, officers(name,rank,badge_no)').order('created_at',{ascending:false}),
      supabase.from('officers').select('id,name,rank,badge_no').order('name')
    ])
    setProfiles(p??[]); setOfficers(o??[]); setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function createUser() {
    setErr(''); setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await supabase.functions.invoke('create-user', {
      body: { email:form.email, password:form.password, role:form.role, officer_id:form.officer_id||null },
    })
    if (res.error || res.data?.error) {
      setErr(res.data?.error || res.error.message); setSaving(false); return
    }
    setSaving(false); setModal(false); setForm(BLANK_USER); load()
  }

  async function updateRole(profileId, newRole) {
    await supabase.from('profiles').update({ role:newRole }).eq('id',profileId)
    load()
  }

  async function toggleActive(profileId, current) {
    await supabase.from('profiles').update({ is_active:!current }).eq('id',profileId)
    load()
  }

  const roleCounts = ROLES.reduce((a,r)=>{ a[r]=profiles.filter(p=>p.role===r).length; return a },{})

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader icon={Settings} title="Admin Panel" sub="User management and access control"
        action={<button onClick={()=>{ setForm(BLANK_USER); setErr(''); setModal(true)}} className="btn-primary"><Plus className="w-4 h-4"/>Create user</button>}
      />

      {/* Role stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Shield}  label="FTC"     value={roleCounts.ftc}     color="text-rose-400"/>
        <StatCard icon={Shield}  label="FTI"     value={roleCounts.fti}     color="text-teal-400"/>
        <StatCard icon={Shield}  label="FTO"     value={roleCounts.fto}     color="text-amber-400"/>
        <StatCard icon={Users}   label="Officers" value={roleCounts.officer} color="text-blue-400"/>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-n-600">
          <h2 className="text-sm font-semibold text-g-text">{profiles.length} portal users</h2>
        </div>
        {loading ? <div className="p-12 flex justify-center"><Spinner className="w-6 h-6"/></div>
        : profiles.length===0 ? <Empty icon={Users} title="No users yet" desc="Create the first portal user."/>
        : <table className="tbl">
            <thead><tr><th>Officer</th><th>Rank</th><th>Badge</th><th>Role</th><th>Status</th><th>Change role</th><th>Active</th></tr></thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-g-text">{p.officers?.name ?? <span className="text-g-muted italic">No officer linked</span>}</td>
                  <td className="text-xs text-g-sub">{p.officers?.rank??'—'}</td>
                  <td className="font-mono text-xs text-a-400">{p.officers?.badge_no??'—'}</td>
                  <td><RoleBadge v={p.role}/></td>
                  <td>
                    <span className={p.is_active!==false?'s-active':'s-terminated'}>{p.is_active!==false?'Active':'Inactive'}</span>
                  </td>
                  <td>
                    <select value={p.role} onChange={e=>updateRole(p.id,e.target.value)}
                      className="bg-n-800 border border-n-600 rounded px-2 py-1 text-xs text-g-text cursor-pointer focus:outline-none focus:border-a-500">
                      {ROLES.map(r=><option key={r} value={r}>{r.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={()=>toggleActive(p.id,p.is_active!==false)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${p.is_active!==false?'text-red-400 border-red-700/40 hover:bg-red-900/20':'text-green-400 border-green-700/40 hover:bg-green-900/20'}`}>
                      {p.is_active!==false?'Deactivate':'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {/* Create user modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Create portal user">
        <div className="space-y-4">
          <Field label="Email address" required><input type="email" value={form.email} onChange={e=>f('email',e.target.value)} className="inp" placeholder="officer@zcpd.internal"/></Field>
          <Field label="Temporary password" required><input type="password" value={form.password} onChange={e=>f('password',e.target.value)} className="inp" placeholder="Min 6 characters"/></Field>
          <Field label="Role">
            <Select value={form.role} onChange={e=>f('role',e.target.value)}>
              {ROLES.map(r=><option key={r} value={r}>{r.toUpperCase()} — {r==='ftc'?'Full access':r==='fti'?'Monitors FTOs':r==='fto'?'Files cadet records':'Own profile only'}</option>)}
            </Select>
          </Field>
          <Field label="Link to officer">
            <Select value={form.officer_id} onChange={e=>f('officer_id',e.target.value)}>
              <option value="">No officer link</option>
              {officers.map(o=><option key={o.id} value={o.id}>{o.name} ({o.rank} · {o.badge_no})</option>)}
            </Select>
          </Field>
          {err && <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-red-400 shrink-0"/><p className="text-red-400 text-sm">{err}</p></div>}
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={createUser} disabled={saving} className="btn-primary">{saving?'Creating…':'Create user'}</button>
        </div>
      </Modal>
    </div>
  )
}
