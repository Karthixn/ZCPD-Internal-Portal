import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Target, Plus } from 'lucide-react'
import { PageHeader, StatusBadge, Modal, Field, Select, Spinner, Empty } from '../../components/ui'

const SQUADS = ['ALPHA','DELTA','BRAVO','CHARLIE']
const SQUAD_COLORS = { ALPHA:'text-blue-400 bg-blue-900/20 border-blue-700/30', DELTA:'text-purple-400 bg-purple-900/20 border-purple-700/30', BRAVO:'text-green-400 bg-green-900/20 border-green-700/30', CHARLIE:'text-amber-400 bg-amber-900/20 border-amber-700/30' }
const BLANK = { name:'', squad:'ALPHA', badge_no:'', role:'member', discord_id:'', status:'ACTIVE' }

export default function SwatPage() {
  const { isFTI, isSWAT } = useAuth()
  const canEdit = isFTI || isSWAT
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(BLANK)
  const [saving, setSaving]   = useState(false)
  const [editId, setEditId]   = useState(null)
  const [officers, setOfficers] = useState([])

  async function load() {
    setLoading(true)
    const [{ data: m }, { data: o }] = await Promise.all([
      supabase.from('swat_members').select('*').order('squad').order('badge_no'),
      supabase.from('officers').select('id,name,badge_no,rank').order('name')
    ])
    setMembers(m ?? []); setOfficers(o ?? []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const bySquad = SQUADS.reduce((a,s) => { a[s] = members.filter(m => m.squad === s); return a }, {})
  const f = (k,v) => setForm(p => ({ ...p, [k]:v }))

  function openAdd() { setForm(BLANK); setEditId(null); setModal(true) }
  function openEdit(m) { setForm({ ...m }); setEditId(m.id); setModal(true) }

  async function save() {
    setSaving(true)
    if (editId) await supabase.from('swat_members').update(form).eq('id',editId)
    else await supabase.from('swat_members').insert(form)
    setSaving(false); setModal(false); load()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader icon={Target} title="S.W.A.T Roster"
        sub={`${members.length} members across ${SQUADS.length} squads`}
        action={canEdit && <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4"/>Add member</button>}
      />

      {/* Squad summary pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SQUADS.map(sq => {
          const ms = bySquad[sq]; const active = ms.filter(m=>m.status==='ACTIVE').length
          return (
            <div key={sq} className={`card-sm p-4 border ${SQUAD_COLORS[sq]}`}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">{sq}</p>
              <p className="text-2xl font-bold font-mono">{ms.length}</p>
              <p className="text-xs mt-1 opacity-70">{active} active</p>
            </div>
          )
        })}
      </div>

      {/* Squad tables */}
      {loading ? <div className="flex justify-center py-12"><Spinner className="w-6 h-6"/></div>
      : SQUADS.map(sq => {
        const ms = bySquad[sq]
        return (
          <div key={sq} className="card overflow-hidden">
            <div className={`px-5 py-3 border-b border-n-600 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${SQUAD_COLORS[sq]}`}>SQUAD {sq}</span>
                <span className="text-xs text-g-muted">{ms.length} members</span>
              </div>
            </div>
            {ms.length === 0 ? (
              <div className="px-5 py-8 text-center text-g-muted text-sm">No members in this squad yet.</div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Badge</th><th>Name</th><th>Role</th><th>Discord ID</th><th>Status</th>{canEdit&&<th></th>}</tr></thead>
                <tbody>
                  {ms.map(m => (
                    <tr key={m.id}>
                      <td className="font-mono text-xs text-a-400">{m.badge_no}</td>
                      <td className="font-medium text-g-text">{m.name || '—'}</td>
                      <td>{m.role === 'squad_leader' ? <span className="text-xs font-semibold text-yellow-300 bg-yellow-900/30 border border-yellow-700/30 px-2 py-0.5 rounded-full">Squad Leader</span> : <span className="text-xs text-g-muted">Member</span>}</td>
                      <td className="font-mono text-xs text-g-muted">{m.discord_id || '—'}</td>
                      <td><StatusBadge v={m.status}/></td>
                      {canEdit && <td><button onClick={()=>openEdit(m)} className="text-xs text-a-400 hover:underline">Edit</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit SWAT member':'Add SWAT member'}>
        <div className="space-y-4">
          <Field label="Name" required><input value={form.name} onChange={e=>f('name',e.target.value)} className="inp" placeholder="Officer name"/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Squad">
              <Select value={form.squad} onChange={e=>f('squad',e.target.value)}>
                {SQUADS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Badge no" required><input value={form.badge_no} onChange={e=>f('badge_no',e.target.value)} className="inp" placeholder="A-01"/></Field>
            <Field label="Role">
              <Select value={form.role} onChange={e=>f('role',e.target.value)}>
                <option value="member">Member</option>
                <option value="squad_leader">Squad Leader</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={e=>f('status',e.target.value)}>
                <option>ACTIVE</option><option>INACTIVE</option>
              </Select>
            </Field>
          </div>
          <Field label="Discord ID"><input value={form.discord_id} onChange={e=>f('discord_id',e.target.value)} className="inp" placeholder="Discord user ID"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Saving…':'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
