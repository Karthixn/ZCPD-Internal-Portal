import { useEffect, useState } from 'react'
import { useNavigate, useParams, Routes, Route } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Plus, ChevronRight, User, FileText, ClipboardList, BookOpen, Search, CheckCircle, Lock, Clock, Edit3, Save } from 'lucide-react'
import { PageHeader, StatusBadge, PhasePill, ScoreBar, Modal, Field, Select, Spinner, Empty } from '../../components/ui'

/* ─── helpers ─── */
const BATCH_STATUS = ['IN PROGRESS','GRADUATED','FAILED','RESIGNED','REMOVED','ZIMS TRANSFER']
const PHASE_OPTS   = ['NOT COMPLETED','IN PROGRESS','COMPLETED']
const PERF_OPTS    = ['EXCELLENT','GOOD','AVERAGE','POOR']
const CRITERIA = [
  { key:'equip_uniform',   label:"Equipment & uniform" },
  { key:'job_knowledge',   label:"Knowledge of job roles & responsibilities" },
  { key:'traffic_citizen', label:"Traffic control & citizen interaction" },
  { key:'radio_comms',     label:"Radio calls & communication skills" },
  { key:'discipline',      label:"Discipline & professional conduct" },
  { key:'case_handling',   label:"Case handling & problem-solving" },
  { key:'teamwork',        label:"Team collaboration" },
  { key:'initiative',      label:"Initiative and attitude" },
  { key:'adaptability',    label:"Adaptability to protocols" },
  { key:'time_mgmt',       label:"Time management" },
]

/* ═══════════════════════════════
   CADET LIST
═══════════════════════════════ */
function CadetList() {
  const navigate = useNavigate()
  const { isFTO } = useAuth()
  const [cadets, setCadets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('All')

  useEffect(() => {
    supabase.from('cadet_applications').select('*').order('created_at',{ascending:false})
      .then(({ data }) => { setCadets(data??[]); setLoading(false) })
  }, [])

  const shown = cadets.filter(c =>
    (statusF==='All' || c.status===statusF) &&
    (!search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.badge_no?.includes(search))
  )

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader icon={GraduationCap} title="FTO Portal" sub="Cadet pipeline management"
        action={isFTO && <button onClick={()=>navigate('/fto/new-cadet')} className="btn-primary"><Plus className="w-4 h-4"/>Add cadet</button>}
      />

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All',...BATCH_STATUS].map(s => (
          <button key={s} onClick={()=>setStatusF(s)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${statusF===s?'bg-a-500/20 border-a-500/40 text-a-400':'bg-n-700 border-n-600 text-g-muted hover:text-g-text'}`}>
            {s} <span className="font-mono">{s==='All'?cadets.length:cadets.filter(c=>c.status===s).length}</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} className="inp pl-9" placeholder="Search cadet name or badge…"/>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-12 flex justify-center"><Spinner className="w-6 h-6"/></div>
        : shown.length===0 ? <Empty icon={GraduationCap} title="No cadets found" desc="Add a new cadet application to get started."/>
        : <table className="tbl">
            <thead><tr><th>Name</th><th>Badge</th><th>Batch</th><th>FTO</th><th>Phase 1</th><th>Phase 2</th><th>Phase 3</th><th>PO Test</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {shown.map(c => (
                <tr key={c.id} className="cursor-pointer" onClick={()=>navigate(`/fto/cadet/${c.id}`)}>
                  <td className="font-medium text-g-text">{c.name}</td>
                  <td className="font-mono text-xs text-a-400">{c.badge_no||'—'}</td>
                  <td className="text-xs text-g-muted">{c.batch_no ? `Batch ${c.batch_no}` : '—'}</td>
                  <td className="text-xs text-g-sub">{c.assigned_fto||'—'}</td>
                  <td><PhasePill v={c.phase1_status}/></td>
                  <td><PhasePill v={c.phase2_status}/></td>
                  <td><PhasePill v={c.phase3_status}/></td>
                  <td><PhasePill v={c.po_test_status}/></td>
                  <td><StatusBadge v={c.status}/></td>
                  <td><ChevronRight className="w-4 h-4 text-g-muted"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   NEW CADET FORM
═══════════════════════════════ */
function NewCadetForm() {
  const navigate = useNavigate()
  const { officer } = useAuth()
  const [form, setForm] = useState({
    name:'', discord_username:'', badge_no:'', batch_no:'', joining_date:'', assigned_fto: officer?.name??'', referred_by:'',
  })
  const [saving, setSaving] = useState(false)
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  async function save() {
    setSaving(true)
    const { data } = await supabase.from('cadet_applications').insert({
      ...form, status:'IN PROGRESS',
      discord_interview_done:false, discord_interview_pass:null,
      ingame_interview_done:false, ingame_interview_pass:null,
      phase1_status:'NOT COMPLETED', phase2_status:'NOT COMPLETED', phase3_status:'NOT COMPLETED', po_test_status:'NOT COMPLETED',
    }).select().single()
    setSaving(false)
    if (data) navigate(`/fto/cadet/${data.id}`)
    else navigate('/fto')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader icon={Plus} title="New cadet application" sub="Enter basic cadet details to start the pipeline"/>
      <div className="card p-6 space-y-5">
        <p className="section-title">Basic information</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name" required><input value={form.name} onChange={e=>f('name',e.target.value)} className="inp" placeholder="Cadet name"/></Field>
          <Field label="Discord username"><input value={form.discord_username} onChange={e=>f('discord_username',e.target.value)} className="inp" placeholder="username#1234"/></Field>
          <Field label="Badge no"><input value={form.badge_no} onChange={e=>f('badge_no',e.target.value)} className="inp" placeholder="P61"/></Field>
          <Field label="Batch no"><input type="number" value={form.batch_no} onChange={e=>f('batch_no',e.target.value)} className="inp" placeholder="4"/></Field>
          <Field label="Joining date"><input type="date" value={form.joining_date} onChange={e=>f('joining_date',e.target.value)} className="inp"/></Field>
          <Field label="Assigned FTO"><input value={form.assigned_fto} onChange={e=>f('assigned_fto',e.target.value)} className="inp" placeholder="FTO name"/></Field>
          <Field label="Referred by"><input value={form.referred_by} onChange={e=>f('referred_by',e.target.value)} className="inp" placeholder="Officer who referred"/></Field>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={()=>navigate('/fto')} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving||!form.name.trim()} className="btn-primary">{saving?'Saving…':'Create cadet record'}</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   CADET DETAIL VIEW
═══════════════════════════════ */
function CadetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { officer } = useAuth()
  const [cadet, setCadet] = useState(null)
  const [reports, setReports] = useState([])
  const [potests, setPotests] = useState([])
  const [trainings, setTrainings] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [reportModal, setReportModal] = useState(false)
  const [potestModal, setPotestModal] = useState(false)
  const [trainingModal, setTrainingModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Weekly report form
  const [repForm, setRepForm] = useState({ fto_name:officer?.name??'', week_number:1, duty_hrs:'', activities:'', performance:'GOOD', remarks:'' })
  // PO test form
  const [potForm, setPotForm] = useState({ fto_name:officer?.name??'', fto_badge:officer?.badge_no??'', fto_designation:officer?.rank??'', test_date:'', equip_uniform:5, job_knowledge:5, traffic_citizen:5, radio_comms:5, discipline:5, case_handling:5, teamwork:5, initiative:5, adaptability:5, time_mgmt:5, recommendation:'PASSED', overall_remarks:'' })
  // Training form
  const [trnForm, setTrnForm] = useState({ phase_number:1, batch_no:'', venue:'', training_date:'', time_start:'', time_end:'', training_given:'', summary:'' })

  async function load() {
    setLoading(true)
    const [{ data:c },{ data:r },{ data:p },{ data:t }] = await Promise.all([
      supabase.from('cadet_applications').select('*').eq('id',id).single(),
      supabase.from('fto_weekly_reports').select('*').eq('cadet_id',id).order('week_number'),
      supabase.from('po_test_results').select('*').eq('cadet_id',id).order('created_at'),
      supabase.from('phase_training_logs').select('*').order('training_date',{ascending:false}).limit(20),
    ])
    setCadet(c); setReports(r??[]); setPotests(p??[]); setTrainings(t??[]); setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function saveReport() {
    setSaving(true)
    await supabase.from('fto_weekly_reports').insert({ ...repForm, cadet_id:parseInt(id), report_date:new Date().toISOString().split('T')[0] })
    setSaving(false); setReportModal(false); load()
  }

  async function savePOTest() {
    setSaving(true)
    const total = CRITERIA.reduce((a,c) => a+(parseInt(potForm[c.key])||0), 0)
    await supabase.from('po_test_results').insert({ ...potForm, cadet_id:parseInt(id) })
    // Update cadet po_test_status
    await supabase.from('cadet_applications').update({ po_test_status:'COMPLETED', po_test_date:potForm.test_date, po_test_score:total }).eq('id',id)
    setSaving(false); setPotestModal(false); load()
  }

  async function saveTraining() {
    setSaving(true)
    const cadets = cadet ? [cadet.name] : []
    await supabase.from('phase_training_logs').insert({
      ...trnForm, phase_number:parseInt(trnForm.phase_number),
      cadets_present:cadets,
      training_given: trnForm.training_given.split('\n').filter(Boolean),
      instructors:[officer?.name??'Unknown'],
    })
    // Update phase status on cadet
    const phaseKey = `phase${trnForm.phase_number}_status`
    await supabase.from('cadet_applications').update({ [phaseKey]:'COMPLETED', [`phase${trnForm.phase_number}_date`]:trnForm.training_date }).eq('id',id)
    setSaving(false); setTrainingModal(false); load()
  }

  async function updatePhase(num, status) {
    const phaseKey = `phase${num}_status`
    await supabase.from('cadet_applications').update({ [phaseKey]:status }).eq('id',id)
    load()
  }

  const rf = (k,v) => setRepForm(p=>({...p,[k]:v}))
  const pf = (k,v) => setPotForm(p=>({...p,[k]:v}))
  const tf = (k,v) => setTrnForm(p=>({...p,[k]:v}))

  const [stageEdit, setStageEdit] = useState(null)
  const [stageForm, setStageForm] = useState({})
  const [stageSaving, setStageSaving] = useState(false)
  const sf = (k,v) => setStageForm(p=>({...p,[k]:v}))

  function currentStage() {
    if (!cadet.discord_interview_done) return 'discord'
    if (!cadet.ingame_interview_done) return 'ingame'
    if (!cadet.roles_given_date) return 'onboarding'
    return 'complete'
  }

  function openStageEdit(stage) {
    if (stage === 'discord') {
      setStageForm({ discord_interview_date: cadet.discord_interview_date||'', discord_interviewer: cadet.discord_interviewer||'', discord_interview_pass: cadet.discord_interview_pass, discord_interview_notes: cadet.discord_interview_notes||'' })
    } else if (stage === 'ingame') {
      setStageForm({ ingame_interview_date: cadet.ingame_interview_date||'', ingame_interviewer: cadet.ingame_interviewer||'', ingame_interview_pass: cadet.ingame_interview_pass, ingame_interview_notes: cadet.ingame_interview_notes||'' })
    } else if (stage === 'onboarding') {
      setStageForm({ roles_given_date: cadet.roles_given_date||'', charge_taken_by: cadet.charge_taken_by||'' })
    }
    setStageEdit(stage)
  }

  async function saveStage() {
    setStageSaving(true)
    let update = {}
    if (stageEdit === 'discord') {
      update = { ...stageForm, discord_interview_done: stageForm.discord_interview_pass !== null }
    } else if (stageEdit === 'ingame') {
      update = { ...stageForm, ingame_interview_done: stageForm.ingame_interview_pass !== null }
    } else if (stageEdit === 'onboarding') {
      update = { ...stageForm }
    }
    await supabase.from('cadet_applications').update(update).eq('id', id)
    setStageSaving(false); setStageEdit(null); load()
  }

  const TABS = ['pipeline','phases','weekly reports','po test','training logs']

  if (loading) return <div className="flex justify-center py-16"><Spinner className="w-6 h-6"/></div>
  if (!cadet) return <Empty icon={User} title="Cadet not found" desc="This record does not exist."/>

  const stage = currentStage()
  const STAGES = [
    { key:'application', label:'Application', icon: FileText, desc:'Basic cadet details' },
    { key:'discord',     label:'Discord Interview', icon: ClipboardList, desc:'Voice interview on Discord' },
    { key:'ingame',      label:'In-game Interview', icon: User, desc:'In-game evaluation by FTI' },
    { key:'onboarding',  label:'Onboarding', icon: CheckCircle, desc:'Roles assigned & charge taken' },
  ]

  function stageStatus(key) {
    if (key === 'application') return 'done'
    if (key === 'discord') return cadet.discord_interview_done ? 'done' : stage === 'discord' ? 'current' : 'locked'
    if (key === 'ingame') {
      if (cadet.ingame_interview_done) return 'done'
      if (stage === 'ingame') return cadet.discord_interview_pass === false ? 'failed' : 'current'
      return 'locked'
    }
    if (key === 'onboarding') {
      if (cadet.roles_given_date) return 'done'
      if (stage === 'onboarding') return cadet.ingame_interview_pass === false ? 'failed' : 'current'
      return 'locked'
    }
    return 'locked'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={()=>navigate('/fto')} className="text-xs text-g-muted hover:text-g-sub mb-2 flex items-center gap-1">← Back to FTO portal</button>
          <h1 className="page-title">{cadet.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="font-mono text-xs text-a-400">{cadet.badge_no||'—'}</span>
            {cadet.batch_no && <span className="text-xs text-g-muted">· Batch {cadet.batch_no}</span>}
            <StatusBadge v={cadet.status}/>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-g-muted">Assigned FTO</p>
          <p className="text-sm font-medium text-g-text">{cadet.assigned_fto||'—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-n-600 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap capitalize transition-colors border-b-2 -mb-px ${tab===t?'border-a-500 text-a-400':'border-transparent text-g-muted hover:text-g-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Pipeline tab */}
      {tab==='pipeline' && (
        <div className="space-y-4">
          {/* Stage progress bar */}
          <div className="card p-4">
            <div className="flex items-center gap-2">
              {STAGES.map((s, i) => {
                const st = stageStatus(s.key)
                return (
                  <div key={s.key} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 ${st==='done'?'bg-green-900/20 border border-green-700/30':st==='current'?'bg-a-500/10 border border-a-500/30':st==='failed'?'bg-red-900/20 border border-red-700/30':'bg-n-800 border border-n-600 opacity-50'}`}>
                      {st==='done' ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0"/> : st==='current' ? <Clock className="w-4 h-4 text-a-400 shrink-0"/> : st==='failed' ? <CheckCircle className="w-4 h-4 text-red-400 shrink-0"/> : <Lock className="w-3.5 h-3.5 text-g-muted shrink-0"/>}
                      <span className={`text-xs font-medium ${st==='done'?'text-green-300':st==='current'?'text-a-400':st==='failed'?'text-red-400':'text-g-muted'}`}>{s.label}</span>
                    </div>
                    {i < STAGES.length-1 && <ChevronRight className="w-4 h-4 text-n-600 shrink-0 mx-1"/>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stage 1: Application (always visible, read-only summary) */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400"/>
                <h3 className="font-semibold text-g-text">Stage 1 — Application</h3>
              </div>
              <span className="s-active text-xs">COMPLETED</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ['Name', cadet.name], ['Badge', cadet.badge_no], ['Batch', cadet.batch_no ? `Batch ${cadet.batch_no}` : '—'],
                ['Discord', cadet.discord_username], ['Joining date', cadet.joining_date], ['FTO', cadet.assigned_fto],
                ['Referred by', cadet.referred_by],
              ].map(([l,v]) => (
                <div key={l}>
                  <p className="text-xs text-g-muted">{l}</p>
                  <p className="text-sm text-g-text font-medium">{v||'—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 2: Discord Interview */}
          {(() => {
            const st = stageStatus('discord')
            return (
              <div className={`card p-5 ${st==='locked'?'opacity-50':''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {st==='done' ? <CheckCircle className="w-5 h-5 text-green-400"/> : st==='current' ? <Clock className="w-5 h-5 text-a-400"/> : <Lock className="w-5 h-5 text-g-muted"/>}
                    <h3 className="font-semibold text-g-text">Stage 2 — Discord Interview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {st==='done' && cadet.discord_interview_pass === true && <span className="s-active text-xs">PASSED</span>}
                    {st==='done' && cadet.discord_interview_pass === false && <span className="s-terminated text-xs">FAILED</span>}
                    {st==='current' && <span className="text-xs text-a-400 font-medium">PENDING</span>}
                    {(st==='current'||st==='done') && stageEdit !== 'discord' && (
                      <button onClick={()=>openStageEdit('discord')} className="btn-ghost text-xs px-2 py-1"><Edit3 className="w-3 h-3"/>Fill details</button>
                    )}
                  </div>
                </div>
                {stageEdit === 'discord' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Interview date"><input type="date" value={stageForm.discord_interview_date} onChange={e=>sf('discord_interview_date',e.target.value)} className="inp"/></Field>
                      <Field label="Interviewer"><input value={stageForm.discord_interviewer} onChange={e=>sf('discord_interviewer',e.target.value)} className="inp" placeholder="FTO/FTC name"/></Field>
                      <Field label="Result">
                        <Select value={stageForm.discord_interview_pass===null?'':stageForm.discord_interview_pass?'pass':'fail'} onChange={e=>sf('discord_interview_pass',e.target.value===''?null:e.target.value==='pass')}>
                          <option value="">Select…</option><option value="pass">PASSED</option><option value="fail">FAILED</option>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Notes"><textarea value={stageForm.discord_interview_notes} onChange={e=>sf('discord_interview_notes',e.target.value)} className="inp h-20 resize-none" placeholder="Interview remarks…"/></Field>
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>setStageEdit(null)} className="btn-ghost text-xs">Cancel</button>
                      <button onClick={saveStage} disabled={stageSaving} className="btn-primary text-xs"><Save className="w-3 h-3"/>{stageSaving?'Saving…':'Save'}</button>
                    </div>
                  </div>
                ) : st==='done' ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[['Date', cadet.discord_interview_date], ['Interviewer', cadet.discord_interviewer], ['Notes', cadet.discord_interview_notes]].map(([l,v]) => (
                      <div key={l}><p className="text-xs text-g-muted">{l}</p><p className="text-sm text-g-text">{v||'—'}</p></div>
                    ))}
                  </div>
                ) : st==='locked' ? (
                  <p className="text-xs text-g-muted">Complete the previous stage first.</p>
                ) : null}
              </div>
            )
          })()}

          {/* Stage 3: In-game Interview */}
          {(() => {
            const st = stageStatus('ingame')
            return (
              <div className={`card p-5 ${st==='locked'?'opacity-50':''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {st==='done' ? <CheckCircle className="w-5 h-5 text-green-400"/> : st==='current' ? <Clock className="w-5 h-5 text-a-400"/> : st==='failed' ? <CheckCircle className="w-5 h-5 text-red-400"/> : <Lock className="w-5 h-5 text-g-muted"/>}
                    <h3 className="font-semibold text-g-text">Stage 3 — In-game Interview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {st==='done' && cadet.ingame_interview_pass === true && <span className="s-active text-xs">PASSED</span>}
                    {st==='done' && cadet.ingame_interview_pass === false && <span className="s-terminated text-xs">FAILED</span>}
                    {st==='current' && <span className="text-xs text-a-400 font-medium">PENDING</span>}
                    {st==='failed' && <span className="text-xs text-red-400 font-medium">BLOCKED — Discord interview failed</span>}
                    {(st==='current'||st==='done') && stageEdit !== 'ingame' && (
                      <button onClick={()=>openStageEdit('ingame')} className="btn-ghost text-xs px-2 py-1"><Edit3 className="w-3 h-3"/>Fill details</button>
                    )}
                  </div>
                </div>
                {stageEdit === 'ingame' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Interview date"><input type="date" value={stageForm.ingame_interview_date} onChange={e=>sf('ingame_interview_date',e.target.value)} className="inp"/></Field>
                      <Field label="Interviewer (FTI)"><input value={stageForm.ingame_interviewer} onChange={e=>sf('ingame_interviewer',e.target.value)} className="inp" placeholder="FTI name"/></Field>
                      <Field label="Result">
                        <Select value={stageForm.ingame_interview_pass===null?'':stageForm.ingame_interview_pass?'pass':'fail'} onChange={e=>sf('ingame_interview_pass',e.target.value===''?null:e.target.value==='pass')}>
                          <option value="">Select…</option><option value="pass">PASSED</option><option value="fail">FAILED</option>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Notes"><textarea value={stageForm.ingame_interview_notes} onChange={e=>sf('ingame_interview_notes',e.target.value)} className="inp h-20 resize-none" placeholder="Interview remarks…"/></Field>
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>setStageEdit(null)} className="btn-ghost text-xs">Cancel</button>
                      <button onClick={saveStage} disabled={stageSaving} className="btn-primary text-xs"><Save className="w-3 h-3"/>{stageSaving?'Saving…':'Save'}</button>
                    </div>
                  </div>
                ) : st==='done' ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[['Date', cadet.ingame_interview_date], ['Interviewer', cadet.ingame_interviewer], ['Notes', cadet.ingame_interview_notes]].map(([l,v]) => (
                      <div key={l}><p className="text-xs text-g-muted">{l}</p><p className="text-sm text-g-text">{v||'—'}</p></div>
                    ))}
                  </div>
                ) : st==='locked' ? (
                  <p className="text-xs text-g-muted">Complete the previous stage first.</p>
                ) : null}
              </div>
            )
          })()}

          {/* Stage 4: Onboarding */}
          {(() => {
            const st = stageStatus('onboarding')
            return (
              <div className={`card p-5 ${st==='locked'?'opacity-50':''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {st==='done' ? <CheckCircle className="w-5 h-5 text-green-400"/> : st==='current' ? <Clock className="w-5 h-5 text-a-400"/> : st==='failed' ? <CheckCircle className="w-5 h-5 text-red-400"/> : <Lock className="w-5 h-5 text-g-muted"/>}
                    <h3 className="font-semibold text-g-text">Stage 4 — Onboarding</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {st==='done' && <span className="s-active text-xs">COMPLETED</span>}
                    {st==='current' && <span className="text-xs text-a-400 font-medium">PENDING</span>}
                    {st==='failed' && <span className="text-xs text-red-400 font-medium">BLOCKED — In-game interview failed</span>}
                    {(st==='current'||st==='done') && stageEdit !== 'onboarding' && (
                      <button onClick={()=>openStageEdit('onboarding')} className="btn-ghost text-xs px-2 py-1"><Edit3 className="w-3 h-3"/>Fill details</button>
                    )}
                  </div>
                </div>
                {stageEdit === 'onboarding' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Roles given date"><input type="date" value={stageForm.roles_given_date} onChange={e=>sf('roles_given_date',e.target.value)} className="inp"/></Field>
                      <Field label="Charge taken by"><input value={stageForm.charge_taken_by} onChange={e=>sf('charge_taken_by',e.target.value)} className="inp" placeholder="FTO who took charge"/></Field>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>setStageEdit(null)} className="btn-ghost text-xs">Cancel</button>
                      <button onClick={saveStage} disabled={stageSaving} className="btn-primary text-xs"><Save className="w-3 h-3"/>{stageSaving?'Saving…':'Save'}</button>
                    </div>
                  </div>
                ) : st==='done' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[['Roles given', cadet.roles_given_date], ['Charge taken by', cadet.charge_taken_by]].map(([l,v]) => (
                      <div key={l}><p className="text-xs text-g-muted">{l}</p><p className="text-sm text-g-text">{v||'—'}</p></div>
                    ))}
                  </div>
                ) : st==='locked' ? (
                  <p className="text-xs text-g-muted">Complete the previous stage first.</p>
                ) : null}
              </div>
            )
          })()}

          {cadet.exit_reason && (
            <div className="card p-4 bg-red-900/10 border-red-700/30">
              <p className="text-xs text-red-400 font-medium mb-1">Exit reason</p>
              <p className="text-sm text-g-text">{cadet.exit_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Phases tab */}
      {tab==='phases' && (
        <div className="space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-g-text">Phase {n} Training</h3>
                  <p className="text-xs text-g-muted mt-0.5">FTO: {cadet[`phase${n}_fto`]||'—'} · Date: {cadet[`phase${n}_date`]||'Not set'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PhasePill v={cadet[`phase${n}_status`]}/>
                  <button onClick={()=>{ setTrnForm(p=>({...p,phase_number:n})); setTrainingModal(true)}} className="btn-primary text-xs px-3 py-1.5">Log training</button>
                </div>
              </div>
              <div className="flex gap-2">
                {PHASE_OPTS.map(opt => (
                  <button key={opt} onClick={()=>updatePhase(n,opt)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${cadet[`phase${n}_status`]===opt?'bg-a-500/20 border-a-500/40 text-a-400':'bg-n-800 border-n-600 text-g-muted hover:text-g-text'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly reports tab */}
      {tab==='weekly reports' && (
        <div className="space-y-4">
          <button onClick={()=>setReportModal(true)} className="btn-primary"><Plus className="w-4 h-4"/>Add weekly report</button>
          {reports.length===0 ? <Empty icon={FileText} title="No reports yet" desc="File the first weekly FTO report."/>
          : reports.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-g-text">Week {r.week_number}</h3>
                  <p className="text-xs text-g-muted">{r.report_date} · FTO: {r.fto_name}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  r.performance==='EXCELLENT'?'bg-green-900/40 text-green-300 border-green-700/40':
                  r.performance==='GOOD'?'bg-blue-900/40 text-blue-300 border-blue-700/40':
                  r.performance==='AVERAGE'?'bg-yellow-900/40 text-yellow-300 border-yellow-700/40':
                  'bg-red-900/40 text-red-300 border-red-700/40'}`}>{r.performance}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-g-muted">Duty hours</span><p className="font-mono text-g-text">{r.duty_hrs||'—'}</p></div>
                <div><span className="text-xs text-g-muted">Activities</span><p className="text-g-sub">{r.activities||'—'}</p></div>
                {r.remarks && <div className="col-span-2"><span className="text-xs text-g-muted">Remarks</span><p className="text-g-sub">{r.remarks}</p></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PO Test tab */}
      {tab==='po test' && (
        <div className="space-y-4">
          <button onClick={()=>setPotestModal(true)} className="btn-primary"><Plus className="w-4 h-4"/>Submit PO test result</button>
          {potests.length===0 ? <Empty icon={ClipboardList} title="No PO test yet" desc="Submit the formal PO evaluation."/>
          : potests.map(p => {
            const total = CRITERIA.reduce((a,c)=>a+(p[c.key]||0),0)
            return (
              <div key={p.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-g-text">PO Test Result</h3>
                    <p className="text-xs text-g-muted">{p.test_date} · Evaluated by {p.fto_name} ({p.fto_badge})</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${p.recommendation==='PASSED'?'bg-green-900/40 text-green-300 border-green-700/40':'bg-red-900/40 text-red-300 border-red-700/40'}`}>{p.recommendation}</span>
                    <p className="text-2xl font-bold font-mono text-a-400 mt-1">{total}<span className="text-sm text-g-muted">/50</span></p>
                  </div>
                </div>
                <ScoreBar score={total} max={50}/>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {CRITERIA.map(c => (
                    <div key={c.key} className="flex items-center justify-between py-1">
                      <span className="text-xs text-g-muted">{c.label}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${n<=(p[c.key]||0)?'bg-a-500':'bg-n-600'}`}/>)}
                      </div>
                    </div>
                  ))}
                </div>
                {p.overall_remarks && <div className="mt-4 p-3 bg-n-800 rounded-lg"><p className="text-xs text-g-muted mb-1">Overall remarks</p><p className="text-sm text-g-sub">{p.overall_remarks}</p></div>}
              </div>
            )
          })}
        </div>
      )}

      {/* Training logs tab */}
      {tab==='training logs' && (
        <div className="space-y-4">
          <button onClick={()=>setTrainingModal(true)} className="btn-primary"><Plus className="w-4 h-4"/>Log training session</button>
          {trainings.length===0 ? <Empty icon={BookOpen} title="No training logs" desc="Log phase training sessions here."/>
          : trainings.map(t => (
            <div key={t.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-g-text">Phase {t.phase_number} — {t.venue||'Unknown venue'}</h3>
                  <p className="text-xs text-g-muted">{t.training_date} {t.time_start&&`· ${t.time_start}`} {t.time_end&&`to ${t.time_end}`}</p>
                </div>
              </div>
              {t.training_given?.length > 0 && <ul className="text-xs text-g-sub space-y-0.5 mt-2">{t.training_given.map((item,i)=><li key={i}>• {item}</li>)}</ul>}
            </div>
          ))}
        </div>
      )}

      {/* Weekly report modal */}
      <Modal open={reportModal} onClose={()=>setReportModal(false)} title="Weekly FTO Report">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="FTO name"><input value={repForm.fto_name} onChange={e=>rf('fto_name',e.target.value)} className="inp"/></Field>
            <Field label="Week number"><input type="number" value={repForm.week_number} onChange={e=>rf('week_number',e.target.value)} className="inp"/></Field>
            <Field label="Duty hours"><input type="number" value={repForm.duty_hrs} onChange={e=>rf('duty_hrs',e.target.value)} className="inp" placeholder="approx hrs"/></Field>
            <Field label="Performance">
              <Select value={repForm.performance} onChange={e=>rf('performance',e.target.value)}>
                {PERF_OPTS.map(p=><option key={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Activities / cases"><textarea value={repForm.activities} onChange={e=>rf('activities',e.target.value)} className="inp h-20 resize-none" placeholder="What did the cadet do this week?"/></Field>
          <Field label="Remarks"><textarea value={repForm.remarks} onChange={e=>rf('remarks',e.target.value)} className="inp h-20 resize-none" placeholder="FTO observations…"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setReportModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={saveReport} disabled={saving} className="btn-primary">{saving?'Saving…':'Submit report'}</button>
        </div>
      </Modal>

      {/* PO Test modal */}
      <Modal open={potestModal} onClose={()=>setPotestModal(false)} title="PO Test Evaluation" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="FTO name"><input value={potForm.fto_name} onChange={e=>pf('fto_name',e.target.value)} className="inp"/></Field>
            <Field label="Badge no"><input value={potForm.fto_badge} onChange={e=>pf('fto_badge',e.target.value)} className="inp"/></Field>
            <Field label="Test date"><input type="date" value={potForm.test_date} onChange={e=>pf('test_date',e.target.value)} className="inp"/></Field>
          </div>
          <p className="section-title">Criteria rating (1 = Poor, 5 = Excellent)</p>
          <div className="grid grid-cols-1 gap-2">
            {CRITERIA.map(c => (
              <div key={c.key} className="flex items-center justify-between">
                <span className="text-sm text-g-sub flex-1">{c.label}</span>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={()=>pf(c.key,n)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${parseInt(potForm[c.key])===n?'bg-a-500 text-white':'bg-n-800 border border-n-600 text-g-muted hover:border-a-500/40'}`}>{n}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 bg-n-800 rounded-lg">
            <span className="font-medium text-g-text">Total score</span>
            <span className="text-xl font-bold font-mono text-a-400">{CRITERIA.reduce((a,c)=>a+(parseInt(potForm[c.key])||0),0)}/50</span>
          </div>
          <Field label="Recommendation">
            <Select value={potForm.recommendation} onChange={e=>pf('recommendation',e.target.value)}>
              <option>PASSED</option><option>NEEDS IMPROVEMENT</option><option>UNSATISFACTORY</option>
            </Select>
          </Field>
          <Field label="Overall remarks"><textarea value={potForm.overall_remarks} onChange={e=>pf('overall_remarks',e.target.value)} className="inp h-20 resize-none"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setPotestModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={savePOTest} disabled={saving} className="btn-primary">{saving?'Saving…':'Submit PO test'}</button>
        </div>
      </Modal>

      {/* Training log modal */}
      <Modal open={trainingModal} onClose={()=>setTrainingModal(false)} title="Log training session">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phase number">
              <Select value={trnForm.phase_number} onChange={e=>tf('phase_number',e.target.value)}>
                <option value={1}>Phase 1</option><option value={2}>Phase 2</option><option value={3}>Phase 3</option>
              </Select>
            </Field>
            <Field label="Batch no"><input value={trnForm.batch_no} onChange={e=>tf('batch_no',e.target.value)} className="inp" placeholder="4"/></Field>
            <Field label="Venue"><input value={trnForm.venue} onChange={e=>tf('venue',e.target.value)} className="inp" placeholder="PD HQ and Military Base"/></Field>
            <Field label="Date"><input type="date" value={trnForm.training_date} onChange={e=>tf('training_date',e.target.value)} className="inp"/></Field>
            <Field label="Time start"><input type="time" value={trnForm.time_start} onChange={e=>tf('time_start',e.target.value)} className="inp"/></Field>
            <Field label="Time end"><input type="time" value={trnForm.time_end} onChange={e=>tf('time_end',e.target.value)} className="inp"/></Field>
          </div>
          <Field label="Training given (one per line)"><textarea value={trnForm.training_given} onChange={e=>tf('training_given',e.target.value)} className="inp h-28 resize-none" placeholder={"Live experience on hostage handling\nTraining to withstand extreme triggering\nHow to properly attempt a 38 and 80"}/></Field>
          <Field label="Summary"><textarea value={trnForm.summary} onChange={e=>tf('summary',e.target.value)} className="inp h-16 resize-none" placeholder="Cadets expressed strong understanding…"/></Field>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={()=>setTrainingModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={saveTraining} disabled={saving} className="btn-primary">{saving?'Saving…':'Save training log'}</button>
        </div>
      </Modal>
    </div>
  )
}

/* ─── Router ─── */
export default function FTOPortal() {
  return (
    <Routes>
      <Route index element={<CadetList/>}/>
      <Route path="new-cadet" element={<NewCadetForm/>}/>
      <Route path="cadet/:id" element={<CadetDetail/>}/>
      <Route path="new-report" element={<NewCadetForm/>}/>
      <Route path="new-training" element={<CadetList/>}/>
      <Route path="new-potest" element={<CadetList/>}/>
    </Routes>
  )
}
