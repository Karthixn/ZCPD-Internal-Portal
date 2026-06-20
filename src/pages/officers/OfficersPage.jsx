import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Users, Search, Plus, Download, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, StatusBadge, Select, Modal, Field, Spinner, Empty } from '../../components/ui'

const RANKS = ['All','Chief Of Police','DGP','ADGP','Commissioner','DIG','IG','SP','DYSP','CI','SI','ASI','HC','CPO','PO']
const STATUSES = ['All','ACTIVE','INACTIVE','LEAVE','EXCEPTION','TERMINATED','RESIGNED']
const STATUS_OPTS = STATUSES.slice(1)

const PROMO_REQ = {
  PO:    { months: 0, hrs: 0,   next: 'CPO' },
  CPO:   { months: 2, hrs: 60,  next: 'SC' },
  SC:    { months: 3, hrs: 150, next: 'CPL' },
  CPL:   { months: 3, hrs: 150, next: 'SGT' },
  SGT:   { months: 3, hrs: 180, next: 'INSP' },
  INSP:  { months: 3, hrs: 200, next: 'LT' },
  LT:    { months: 4, hrs: 250, next: 'CPT' },
  CPT:   { months: 4, hrs: 250, next: 'MAJOR' },
  MAJOR: { months: 4, hrs: 280, next: 'SP' },
}

function calcEligibility(rank, totalHrs, monthsServed) {
  const req = PROMO_REQ[rank]
  if (!req) return 'N/A'
  return (totalHrs >= req.hrs && monthsServed >= req.months) ? 'ELIGIBLE' : 'NOT ELIGIBLE'
}

function getNextPromotion(rank) {
  const req = PROMO_REQ[rank]
  return req ? `${rank} TO ${req.next}` : ''
}

const BLANK = { name:'',rank:'CPO',designation:'',badge_no:'',discord_id:'',status:'ACTIVE',remarks:'',total_duty_hrs:0,months_served:0,last_promotion_date:'',next_promotion:'' }

export default function OfficersPage() {
  const { isFTI, isFTC } = useAuth()
  const [officers, setOfficers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [rankF, setRankF]       = useState('All')
  const [statusF, setStatusF]   = useState('All')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)
  const [editId, setEditId]     = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('officers').select('*').order('id')
    setOfficers(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    let list = [...officers]
    if (search) list = list.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()) || o.badge_no?.toLowerCase().includes(search.toLowerCase()))
    if (rankF !== 'All') list = list.filter(o => o.rank === rankF)
    if (statusF !== 'All') list = list.filter(o => o.status === statusF)
    setFiltered(list)
  }, [search, rankF, statusF, officers])

  function openAdd() { setForm(BLANK); setEditId(null); setModal(true) }
  function openEdit(o) { setForm({ ...o, last_promotion_date: o.last_promotion_date??'', total_duty_hrs: o.total_duty_hrs??0 }); setEditId(o.id); setModal(true) }

  async function save() {
    setSaving(true)
    const hrs = parseFloat(form.total_duty_hrs) || 0
    const months = parseInt(form.months_served) || 0
    const eligibility = calcEligibility(form.rank, hrs, months)
    const next_promotion = form.next_promotion || getNextPromotion(form.rank)
    const payload = { ...form, total_duty_hrs: hrs, months_served: months, eligibility, next_promotion }
    if (editId) {
      await supabase.from('officers').update(payload).eq('id', editId)
    } else {
      await supabase.from('officers').insert(payload)
    }
    setSaving(false); setModal(false); load()
  }

  const [delModal, setDelModal] = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function deleteOfficer() {
    if (!delTarget) return
    await supabase.from('officers').delete().eq('id', delTarget.id)
    setDelModal(false); setDelTarget(null); load()
  }

  const counts = STATUS_OPTS.reduce((a,s) => { a[s]=officers.filter(o=>o.status===s).length; return a }, {})

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader icon={Users} title="All Officers" sub={`${filtered.length} of ${officers.length} officers`}
        action={isFTI && <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4"/>Add officer</button>}
      />

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTS.map(s => (
          <button key={s} onClick={() => setStatusF(statusF===s?'All':s)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${statusF===s?'bg-a-500/20 border-a-500/40 text-a-400':'bg-n-700 border-n-600 text-g-muted hover:text-g-text'}`}>
            {s} <span className="font-mono ml-1">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or badge…" className="inp pl-9"/>
        </div>
        <Select value={rankF} onChange={e=>setRankF(e.target.value)} className="min-w-[140px]">
          {RANKS.map(r => <option key={r}>{r === 'All' ? 'All ranks' : r}</option>)}
        </Select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner className="w-6 h-6"/></div>
        ) : filtered.length === 0 ? (
          <Empty icon={Users} title="No officers found" desc="Adjust filters to see results."/>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  {['#','Name','Rank','Badge','Status','Duty Hrs','Last Promo','Next Promo','Months','Eligibility','Remarks',''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id}>
                    <td className="text-g-muted text-xs font-mono w-8">{i+1}</td>
                    <td className="font-medium text-g-text whitespace-nowrap">{o.name}</td>
                    <td className="text-g-sub whitespace-nowrap">{o.rank}</td>
                    <td className="font-mono text-xs text-a-400">{o.badge_no}</td>
                    <td><StatusBadge v={o.status}/></td>
                    <td className="font-mono text-xs text-g-sub">{o.total_duty_hrs ?? '—'}</td>
                    <td className="text-xs text-g-muted whitespace-nowrap">{o.last_promotion_date ?? '—'}</td>
                    <td className="text-xs text-g-sub whitespace-nowrap">{o.next_promotion ?? '—'}</td>
                    <td className="font-mono text-xs text-g-sub text-center">{o.months_served ?? '—'}</td>
                    <td>
                      {o.eligibility && o.eligibility !== '#N/A' ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${o.eligibility==='ELIGIBLE'?'bg-green-900/30 text-green-300 border-green-700/40':'bg-red-900/20 text-red-400 border-red-700/30'}`}>
                          {o.eligibility}
                        </span>
                      ) : <span className="text-g-muted text-xs">—</span>}
                    </td>
                    <td className="text-xs text-g-muted max-w-[140px] truncate">{o.remarks ?? '—'}</td>
                    {isFTI && <td>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>openEdit(o)} className="text-xs px-2 py-1 rounded border border-n-600 text-a-400 hover:bg-a-500/10 transition-colors" title="Edit"><Pencil className="w-3 h-3"/></button>
                        {isFTC && <button onClick={()=>{setDelTarget(o);setDelModal(true)}} className="text-xs px-2 py-1 rounded border border-n-600 text-red-400 hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 className="w-3 h-3"/></button>}
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit officer':'Add officer'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name" required><input value={form.name} onChange={e=>f('name',e.target.value)} className="inp" placeholder="Officer name"/></Field>
          <Field label="Badge no" required><input value={form.badge_no} onChange={e=>f('badge_no',e.target.value)} className="inp" placeholder="CP-118"/></Field>
          <Field label="Rank" required>
            <Select value={form.rank} onChange={e=>f('rank',e.target.value)}>
              {RANKS.slice(1).map(r => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Designation"><input value={form.designation} onChange={e=>f('designation',e.target.value)} className="inp" placeholder="e.g. DIG-801"/></Field>
          <Field label="Discord ID"><input value={form.discord_id} onChange={e=>f('discord_id',e.target.value)} className="inp" placeholder="Discord user ID"/></Field>
          <Field label="Status">
            <Select value={form.status} onChange={e=>f('status',e.target.value)}>
              {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Total duty hrs"><input type="number" value={form.total_duty_hrs} onChange={e=>f('total_duty_hrs',e.target.value)} className="inp"/></Field>
          <Field label="Months served"><input type="number" value={form.months_served} onChange={e=>f('months_served',e.target.value)} className="inp"/></Field>
          <Field label="Last promotion date"><input type="date" value={form.last_promotion_date} onChange={e=>f('last_promotion_date',e.target.value)} className="inp"/></Field>
          <Field label="Next promotion"><input value={form.next_promotion} onChange={e=>f('next_promotion',e.target.value)} className="inp" placeholder="e.g. CPO TO HC"/></Field>
          <Field label="Eligibility (auto)">
            {(() => {
              const e = calcEligibility(form.rank, parseFloat(form.total_duty_hrs)||0, parseInt(form.months_served)||0)
              const req = PROMO_REQ[form.rank]
              return (
                <div className="flex flex-col gap-1">
                  <span className={`text-sm font-semibold px-2.5 py-1 rounded-full border w-fit ${e==='ELIGIBLE'?'bg-green-900/30 text-green-300 border-green-700/40':'bg-red-900/20 text-red-400 border-red-700/30'}`}>{e}</span>
                  {req && <span className="text-xs text-g-muted">Needs {req.hrs} hrs & {req.months} months</span>}
                </div>
              )
            })()}
          </Field>
          <Field label="Remarks"><input value={form.remarks} onChange={e=>f('remarks',e.target.value)} className="inp" placeholder="Optional remarks"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving?<><Spinner className="w-4 h-4"/>Saving…</>:'Save officer'}</button>
        </div>
      </Modal>

      <Modal open={delModal} onClose={()=>setDelModal(false)} title="Delete officer">
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
          <p className="text-sm text-red-300 font-medium mb-1">This action cannot be undone.</p>
          <p className="text-sm text-g-sub">Are you sure you want to delete <strong className="text-g-text">{delTarget?.name}</strong> ({delTarget?.badge_no})?</p>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setDelModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={deleteOfficer} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">Delete officer</button>
        </div>
      </Modal>
    </div>
  )
}
