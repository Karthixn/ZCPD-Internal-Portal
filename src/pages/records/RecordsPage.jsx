import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FileText, Plus, Search, ExternalLink } from 'lucide-react'
import { PageHeader, Modal, Field, Select, Spinner, Empty } from '../../components/ui'

const TYPES = ['All','Incident Report','Case File','Confiscation Report','Notice','SOP Document','Other']
const BLANK = { title:'', type:'Incident Report', description:'', officer_name:'', incident_date:'', reference_no:'', tags:'' }

export default function RecordsPage() {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [typeF, setTypeF]       = useState('All')
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('records').select('*').order('created_at',{ascending:false})
    setRecords(data??[]); setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    await supabase.from('records').insert(form)
    setSaving(false); setModal(false); load()
  }

  const shown = records.filter(r =>
    (typeF==='All'||r.type===typeF) &&
    (!search||r.title?.toLowerCase().includes(search.toLowerCase())||r.officer_name?.toLowerCase().includes(search.toLowerCase()))
  )

  const TYPE_COLORS = { 'Incident Report':'text-red-400 bg-red-900/20 border-red-700/30', 'Case File':'text-purple-400 bg-purple-900/20 border-purple-700/30', 'Confiscation Report':'text-amber-400 bg-amber-900/20 border-amber-700/30', 'Notice':'text-blue-400 bg-blue-900/20 border-blue-700/30', 'SOP Document':'text-teal-400 bg-teal-900/20 border-teal-700/30', 'Other':'text-g-muted bg-n-700 border-n-600' }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader icon={FileText} title="Records" sub="Incident reports, case files & documents"
        action={<button onClick={()=>{ setForm(BLANK); setModal(true)}} className="btn-primary"><Plus className="w-4 h-4"/>New record</button>}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="inp pl-9" placeholder="Search records…"/>
        </div>
        <Select value={typeF} onChange={e=>setTypeF(e.target.value)} className="min-w-[160px]">
          {TYPES.map(t=><option key={t}>{t}</option>)}
        </Select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner className="w-6 h-6"/></div>
      : shown.length===0 ? <Empty icon={FileText} title="No records found" desc="Create the first record."/>
      : <div className="space-y-3">
          {shown.map(r => (
            <div key={r.id} className="card p-5 hover:border-n-500 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[r.type]??TYPE_COLORS['Other']}`}>{r.type}</span>
                    {r.reference_no && <span className="font-mono text-xs text-g-muted">#{r.reference_no}</span>}
                  </div>
                  <h3 className="font-semibold text-g-text mb-1">{r.title}</h3>
                  <p className="text-sm text-g-muted line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-g-muted">
                    {r.officer_name && <span>Filed by {r.officer_name}</span>}
                    {r.incident_date && <span>· {r.incident_date}</span>}
                    <span>· {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      <Modal open={modal} onClose={()=>setModal(false)} title="New record" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Title" required><input value={form.title} onChange={e=>f('title',e.target.value)} className="inp" placeholder="Brief title of this record"/></Field></div>
            <Field label="Type">
              <Select value={form.type} onChange={e=>f('type',e.target.value)}>
                {TYPES.slice(1).map(t=><option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Reference no"><input value={form.reference_no} onChange={e=>f('reference_no',e.target.value)} className="inp" placeholder="IR-2026-001"/></Field>
            <Field label="Filed by"><input value={form.officer_name} onChange={e=>f('officer_name',e.target.value)} className="inp" placeholder="Officer name"/></Field>
            <Field label="Incident date"><input type="date" value={form.incident_date} onChange={e=>f('incident_date',e.target.value)} className="inp"/></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={e=>f('description',e.target.value)} className="inp h-32 resize-none" placeholder="Detailed description of the incident, case or document…"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving?'Saving…':'Create record'}</button>
        </div>
      </Modal>
    </div>
  )
}
