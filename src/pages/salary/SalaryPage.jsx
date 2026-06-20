import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DollarSign, Plus, ChevronDown, Pencil, Trash2, Settings } from 'lucide-react'
import { PageHeader, Modal, Field, Select, Spinner, Empty } from '../../components/ui'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const BLANK = { officer_id:'', month:1, year:2026, duty_hrs:0, base_amount:0, auction_amount:0, bonus:0, notes:'' }
const DEFAULT_RATE = 1000000

function fmt(n) {
  if (!n) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function SalaryPage() {
  const [entries, setEntries]   = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editId, setEditId]     = useState(null)
  const [delModal, setDelModal] = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [rateModal, setRateModal] = useState(false)
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_RATE)
  const [rateInput, setRateInput] = useState(DEFAULT_RATE)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)
  const [monthF, setMonthF]     = useState(new Date().getMonth()+1)
  const [yearF, setYearF]       = useState(2026)
  const f = (k,v) => {
    const next = {...form,[k]:v}
    if (k === 'duty_hrs') next.base_amount = Math.round((parseFloat(v)||0) * hourlyRate)
    setForm(next)
  }

  async function loadRate() {
    const { data } = await supabase.from('portal_settings').select('value').eq('key','salary_hourly_rate').single()
    if (data?.value) { setHourlyRate(parseInt(data.value)); setRateInput(parseInt(data.value)) }
  }

  async function load() {
    setLoading(true)
    const [{ data:e },{ data:o }] = await Promise.all([
      supabase.from('monthly_salary').select('*, officers(name,rank,badge_no)').eq('month',monthF).eq('year',yearF).order('id'),
      supabase.from('officers').select('id,name,rank,badge_no').order('name')
    ])
    setEntries(e??[]); setOfficers(o??[]); setLoading(false)
  }
  useEffect(() => { loadRate() }, [])
  useEffect(() => { load() }, [monthF, yearF])

  function openAdd() { setForm({...BLANK,month:monthF,year:yearF}); setEditId(null); setModal(true) }
  function openEdit(e) { setForm({...e,officer_id:e.officer_id}); setEditId(e.id); setModal(true) }

  async function save() {
    setSaving(true)
    const payload = { ...form, officer_id:parseInt(form.officer_id), month:parseInt(form.month), year:parseInt(form.year), duty_hrs:parseFloat(form.duty_hrs)||0, base_amount:parseInt(form.base_amount)||0, auction_amount:parseInt(form.auction_amount)||0, bonus:parseInt(form.bonus)||0 }
    if (editId) {
      const { id, created_at, officers, ...rest } = payload
      await supabase.from('monthly_salary').update(rest).eq('id', editId)
    } else {
      await supabase.from('monthly_salary').upsert(payload)
    }
    setSaving(false); setModal(false); load()
  }

  async function deleteEntry() {
    if (!delTarget) return
    await supabase.from('monthly_salary').delete().eq('id', delTarget.id)
    setDelModal(false); setDelTarget(null); load()
  }

  async function saveRate() {
    setSaving(true)
    await supabase.from('portal_settings').upsert({ key:'salary_hourly_rate', value: String(rateInput) })
    setHourlyRate(rateInput)
    setSaving(false); setRateModal(false)
  }

  const totalPay = entries.reduce((a,e)=>(a+(e.base_amount||0)+(e.auction_amount||0)+(e.bonus||0)),0)
  const totalHrs = entries.reduce((a,e)=>a+(parseFloat(e.duty_hrs)||0),0)

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader icon={DollarSign} title="Salary & Duty" sub="Monthly officer financials"
        action={<div className="flex gap-2">
          <button onClick={()=>{setRateInput(hourlyRate);setRateModal(true)}} className="btn-ghost"><Settings className="w-4 h-4"/>Rate: {fmt(hourlyRate)}/hr</button>
          <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4"/>Add entry</button>
        </div>}
      />

      {/* Month selector */}
      <div className="flex gap-3 flex-wrap items-center">
        <Select value={monthF} onChange={e=>setMonthF(parseInt(e.target.value))} className="min-w-[140px]">
          {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
        </Select>
        <Select value={yearF} onChange={e=>setYearF(parseInt(e.target.value))} className="min-w-[90px]">
          {[2025,2026,2027].map(y=><option key={y}>{y}</option>)}
        </Select>
        <span className="text-sm text-g-muted">{entries.length} entries</span>
      </div>

      {/* Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4"><p className="text-xs text-g-muted mb-1">Total payout</p><p className="text-xl font-bold font-mono text-green-400">{fmt(totalPay)}</p></div>
          <div className="card p-4"><p className="text-xs text-g-muted mb-1">Total duty hrs</p><p className="text-xl font-bold font-mono text-a-400">{totalHrs.toFixed(2)}</p></div>
          <div className="card p-4"><p className="text-xs text-g-muted mb-1">Officers logged</p><p className="text-xl font-bold font-mono text-g-text">{entries.length}</p></div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? <div className="p-12 flex justify-center"><Spinner className="w-6 h-6"/></div>
        : entries.length===0 ? <Empty icon={DollarSign} title={`No entries for ${MONTHS[monthF-1]} ${yearF}`} desc="Add salary entries using the button above."/>
        : <table className="tbl">
            <thead><tr><th>#</th><th>Officer</th><th>Rank</th><th>Duty Hrs</th><th>Base Amount</th><th>Auction</th><th>Bonus</th><th>Total</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {entries.map((e,i) => (
                <tr key={e.id}>
                  <td className="text-g-muted text-xs font-mono">{i+1}</td>
                  <td className="font-medium text-g-text whitespace-nowrap">{e.officers?.name??'—'}</td>
                  <td className="text-xs text-g-sub">{e.officers?.rank??'—'}</td>
                  <td className="font-mono text-xs text-g-sub">{e.duty_hrs||'—'}</td>
                  <td className="font-mono text-xs text-g-sub">{fmt(e.base_amount)}</td>
                  <td className="font-mono text-xs text-g-sub">{fmt(e.auction_amount)}</td>
                  <td className="font-mono text-xs text-yellow-400">{fmt(e.bonus)}</td>
                  <td className="font-mono text-xs text-green-400 font-semibold">{fmt((e.base_amount||0)+(e.auction_amount||0)+(e.bonus||0))}</td>
                  <td className="text-xs text-g-muted max-w-[120px] truncate">{e.notes||'—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>openEdit(e)} className="text-xs px-2 py-1 rounded border border-n-600 text-a-400 hover:bg-a-500/10 transition-colors" title="Edit"><Pencil className="w-3 h-3"/></button>
                      <button onClick={()=>{setDelTarget(e);setDelModal(true)}} className="text-xs px-2 py-1 rounded border border-n-600 text-red-400 hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId ? 'Edit salary entry' : 'Salary entry'}>
        <div className="space-y-4">
          <Field label="Officer" required>
            <Select value={form.officer_id} onChange={e=>f('officer_id',e.target.value)}>
              <option value="">Select officer…</option>
              {officers.map(o=><option key={o.id} value={o.id}>{o.name} ({o.rank})</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Month">
              <Select value={form.month} onChange={e=>f('month',e.target.value)}>
                {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Year"><input type="number" value={form.year} onChange={e=>f('year',e.target.value)} className="inp"/></Field>
            <Field label="Duty hours"><input type="number" step="0.01" value={form.duty_hrs} onChange={e=>f('duty_hrs',e.target.value)} className="inp"/></Field>
            <Field label="Base amount (₹) — auto">
              <div className="inp bg-n-900/50 flex items-center text-g-sub">{fmt(parseInt(form.base_amount)||0)}</div>
              <p className="text-xs text-g-muted mt-1">{form.duty_hrs||0} hrs × {fmt(hourlyRate)}/hr</p>
            </Field>
            <Field label="Auction amount (₹)"><input type="number" value={form.auction_amount} onChange={e=>f('auction_amount',e.target.value)} className="inp"/></Field>
            <Field label="Bonus (₹)"><input type="number" value={form.bonus} onChange={e=>f('bonus',e.target.value)} className="inp"/></Field>
          </div>
          <div className="p-3 bg-n-800 rounded-lg flex items-center justify-between">
            <span className="text-sm text-g-muted">Total</span>
            <span className="font-mono font-bold text-green-400">{fmt((parseInt(form.base_amount)||0)+(parseInt(form.auction_amount)||0)+(parseInt(form.bonus)||0))}</span>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={e=>f('notes',e.target.value)} className="inp h-16 resize-none"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Saving…':'Save entry'}</button>
        </div>
      </Modal>

      <Modal open={delModal} onClose={()=>setDelModal(false)} title="Delete salary entry">
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
          <p className="text-sm text-red-300 font-medium mb-1">This action cannot be undone.</p>
          <p className="text-sm text-g-sub">Delete the salary entry for <strong className="text-g-text">{delTarget?.officers?.name}</strong>?</p>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setDelModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={deleteEntry} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">Delete</button>
        </div>
      </Modal>

      <Modal open={rateModal} onClose={()=>setRateModal(false)} title="Salary rate settings">
        <div className="space-y-4">
          <Field label="Hourly rate (₹)">
            <input type="number" value={rateInput} onChange={e=>setRateInput(parseInt(e.target.value)||0)} className="inp"/>
          </Field>
          <div className="p-3 bg-n-800 rounded-lg">
            <p className="text-xs text-g-muted mb-1">Preview</p>
            <p className="text-sm text-g-text">1 hr = <strong className="text-green-400">{fmt(rateInput)}</strong></p>
            <p className="text-sm text-g-text">39 hrs = <strong className="text-green-400">{fmt(rateInput * 39)}</strong></p>
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setRateModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={saveRate} disabled={saving} className="btn-primary">{saving?'Saving…':'Save rate'}</button>
        </div>
      </Modal>
    </div>
  )
}
