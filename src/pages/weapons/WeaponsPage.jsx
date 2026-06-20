import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Crosshair, Plus } from 'lucide-react'
import { PageHeader, Modal, Field, Select, Spinner, Empty } from '../../components/ui'

const WEAPONS = ['ANI M4','AKM','Utopia','Utopia Glock','Kilo','LWRC M61C','Pistol MK2/Pistol','Automatic Pistol','Desert Eagle']
const LOCKERS = { 'ANI M4':'1','AKM':'2','Utopia':'3-8','Utopia Glock':'9-10','Kilo':'11-20','LWRC M61C':'21-25','Pistol MK2/Pistol':'26-30','Automatic Pistol':'31-40','Desert Eagle':'41-45' }
const BLANK = { log_date:new Date().toISOString().split('T')[0], weapon_type:'ANI M4', qty_transported:0, locker_number:'', confiscated_count:0, in_locker_count:0, logged_by:'', meeting_ref:'', notes:'' }

export default function WeaponsPage() {
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  // Inventory summary
  const INVENTORY = WEAPONS.map(w => ({
    weapon: w, locker: LOCKERS[w]||'—',
    confiscated: logs.filter(l=>l.weapon_type===w).reduce((a,l)=>a+(l.confiscated_count||0),0),
    inLocker: logs.filter(l=>l.weapon_type===w).reduce((a,l)=>a+(l.in_locker_count||0),0),
  }))

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('weapon_log').select('*').order('log_date',{ascending:false})
    setLogs(data??[]); setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    await supabase.from('weapon_log').insert({ ...form, qty_transported:parseInt(form.qty_transported)||0, confiscated_count:parseInt(form.confiscated_count)||0, in_locker_count:parseInt(form.in_locker_count)||0 })
    setSaving(false); setModal(false); load()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader icon={Crosshair} title="Weapon Log" sub="Transport log and locker inventory"
        action={<button onClick={()=>{ setForm(BLANK); setModal(true)}} className="btn-primary"><Plus className="w-4 h-4"/>Log entry</button>}
      />

      {/* Locker inventory */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-n-600 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-g-text">Guns in locker — inventory</h2>
        </div>
        <table className="tbl">
          <thead><tr><th>Weapon</th><th>Locker #</th><th>Confiscated total</th><th>In locker</th></tr></thead>
          <tbody>
            {INVENTORY.map(i => (
              <tr key={i.weapon}>
                <td className="font-medium text-g-text">{i.weapon}</td>
                <td className="font-mono text-xs text-a-400">{i.locker}</td>
                <td className="font-mono text-xs text-g-sub">{i.confiscated || '—'}</td>
                <td className="font-mono text-xs text-green-400">{i.inLocker || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transport log */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-n-600"><h2 className="text-sm font-semibold text-g-text">Transport log</h2></div>
        {loading ? <div className="p-12 flex justify-center"><Spinner className="w-6 h-6"/></div>
        : logs.length===0 ? <Empty icon={Crosshair} title="No log entries" desc="Log weapon transports using the button above."/>
        : <table className="tbl">
            <thead><tr><th>Date</th><th>Weapon</th><th>Qty transported</th><th>Locker</th><th>Confiscated</th><th>In locker</th><th>Logged by</th><th>Meeting ref</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td className="text-xs text-g-muted whitespace-nowrap">{l.log_date}</td>
                  <td className="font-medium text-g-text whitespace-nowrap">{l.weapon_type}</td>
                  <td className="font-mono text-xs text-g-sub">{l.qty_transported||'—'}</td>
                  <td className="font-mono text-xs text-a-400">{l.locker_number||'—'}</td>
                  <td className="font-mono text-xs text-g-sub">{l.confiscated_count||'—'}</td>
                  <td className="font-mono text-xs text-green-400">{l.in_locker_count||'—'}</td>
                  <td className="text-xs text-g-muted">{l.logged_by||'—'}</td>
                  <td className="text-xs text-g-muted">{l.meeting_ref||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="New weapon log entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" value={form.log_date} onChange={e=>f('log_date',e.target.value)} className="inp"/></Field>
            <Field label="Weapon type">
              <Select value={form.weapon_type} onChange={e=>f('weapon_type',e.target.value)}>
                {WEAPONS.map(w=><option key={w}>{w}</option>)}
              </Select>
            </Field>
            <Field label="Qty transported"><input type="number" value={form.qty_transported} onChange={e=>f('qty_transported',e.target.value)} className="inp"/></Field>
            <Field label="Locker number"><input value={form.locker_number} onChange={e=>f('locker_number',e.target.value)} className="inp" placeholder="e.g. 3-8"/></Field>
            <Field label="Confiscated count"><input type="number" value={form.confiscated_count} onChange={e=>f('confiscated_count',e.target.value)} className="inp"/></Field>
            <Field label="In locker count"><input type="number" value={form.in_locker_count} onChange={e=>f('in_locker_count',e.target.value)} className="inp"/></Field>
            <Field label="Logged by"><input value={form.logged_by} onChange={e=>f('logged_by',e.target.value)} className="inp" placeholder="Officer name"/></Field>
            <Field label="Meeting reference"><input value={form.meeting_ref} onChange={e=>f('meeting_ref',e.target.value)} className="inp" placeholder="Meeting with 11…"/></Field>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={e=>f('notes',e.target.value)} className="inp h-16 resize-none"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Saving…':'Log entry'}</button>
        </div>
      </Modal>
    </div>
  )
}
