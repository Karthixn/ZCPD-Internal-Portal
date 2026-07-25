import { useState } from 'react'
import { PageHeader, Spinner, Field } from '../../components/ui'
import { useAllSiteContent, saveSiteContent, DEFAULTS } from '../../lib/siteContent'
import { SlidersHorizontal, Plus, Trash2, ArrowUp, ArrowDown, Save, CheckCircle2, RotateCcw } from 'lucide-react'

const TABS = [
  ['nav', 'Navigation'],
  ['join', 'Join / Recruitment'],
  ['divisions', 'Divisions'],
  ['services', 'Services'],
  ['faq', 'FAQ'],
]

/* Generic add / remove / reorder list editor. */
function ListEditor({ items, onChange, blank, children }) {
  const list = items || []
  const set  = (i, v) => onChange(list.map((it, idx) => idx === i ? v : it))
  const add  = () => onChange([...list, blank()])
  const del  = (i) => onChange(list.filter((_, idx) => idx !== i))
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= list.length) return; const c = [...list];[c[i], c[j]] = [c[j], c[i]]; onChange(c) }
  return (
    <div className="space-y-2">
      {list.map((it, i) => (
        <div key={i} className="flex gap-2 items-start bg-n-800 border border-n-600 rounded-lg p-2.5">
          <div className="flex-1 min-w-0 space-y-2">{children(it, v => set(i, v))}</div>
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded text-g-muted hover:text-g-text disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
            <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="p-1 rounded text-g-muted hover:text-g-text disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
            <button onClick={() => del(i)} className="p-1 rounded text-red-400 hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
      <button onClick={add} className="btn-ghost text-sm"><Plus className="w-4 h-4" />Add item</button>
    </div>
  )
}

const Sub = ({ children }) => <p className="text-xs font-semibold text-g-muted uppercase tracking-wider mt-5 mb-2">{children}</p>

export default function SiteEditorPage() {
  const { content, setContent, loading } = useAllSiteContent()
  const [tab, setTab] = useState('nav')
  const [busy, setBusy] = useState(null)
  const [saved, setSaved] = useState(null)

  const update = (key, data) => setContent(c => ({ ...c, [key]: data }))
  const setField = (key, field, val) => update(key, { ...content[key], [field]: val })

  async function save(key) {
    setBusy(key); setSaved(null)
    await saveSiteContent(key, content[key])
    setBusy(null); setSaved(key); setTimeout(() => setSaved(s => s === key ? null : s), 2500)
  }
  function reset(key) {
    update(key, JSON.parse(JSON.stringify(DEFAULTS[key])))
  }

  if (loading) return <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>

  const SaveBar = ({ k }) => (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-n-600">
      <button onClick={() => save(k)} disabled={busy === k} className="btn-primary"><Save className="w-4 h-4" />{busy === k ? 'Saving…' : 'Save changes'}</button>
      <button onClick={() => reset(k)} className="btn-ghost text-sm"><RotateCcw className="w-4 h-4" />Reset to default</button>
      {saved === k && <span className="text-sm text-green-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Saved & live</span>}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <PageHeader icon={SlidersHorizontal} title="Site Editor" sub="Edit the public navigation and citizen page content" />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${tab === k ? 'bg-a-500/15 border-a-500/30 text-a-400' : 'border-n-600 text-g-muted hover:text-g-text'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        {/* NAVIGATION */}
        {tab === 'nav' && (
          <>
            <p className="text-sm text-g-muted mb-4">Rename tabs, reorder them, or hide them from the public site. (Pages stay reachable by URL even when hidden.)</p>
            <div className="space-y-2">
              {(content.nav || []).map((item, i) => {
                const nav = content.nav
                const setItem = (v) => update('nav', nav.map((it, idx) => idx === i ? v : it))
                const move = (d) => { const j = i + d; if (j < 0 || j >= nav.length) return; const c = [...nav];[c[i], c[j]] = [c[j], c[i]]; update('nav', c) }
                return (
                  <div key={item.path} className="flex items-center gap-3 bg-n-800 border border-n-600 rounded-lg p-2.5">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0" title="Show on public site">
                      <input type="checkbox" checked={item.visible !== false} onChange={e => setItem({ ...item, visible: e.target.checked })} className="accent-a-500" />
                    </label>
                    <input value={item.label} onChange={e => setItem({ ...item, label: e.target.value })} className="inp flex-1 min-w-0" />
                    <code className="text-xs text-g-muted font-mono shrink-0 w-24 truncate">{item.path}</code>
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => move(-1)} disabled={i === 0} className="p-0.5 text-g-muted hover:text-g-text disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => move(1)} disabled={i === content.nav.length - 1} className="p-0.5 text-g-muted hover:text-g-text disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
            <SaveBar k="nav" />
          </>
        )}

        {/* JOIN */}
        {tab === 'join' && (
          <>
            <Field label="Intro paragraph"><textarea value={content.join.intro} onChange={e => setField('join', 'intro', e.target.value)} className="inp min-h-[100px] resize-y" /></Field>
            <Sub>Requirements</Sub>
            <ListEditor items={content.join.requirements} onChange={v => setField('join', 'requirements', v)} blank={() => ''}>
              {(it, set) => <input value={it} onChange={e => set(e.target.value)} className="inp" placeholder="Requirement" />}
            </ListEditor>
            <Sub>Recruitment steps</Sub>
            <ListEditor items={content.join.steps} onChange={v => setField('join', 'steps', v)} blank={() => ({ title: '', desc: '' })}>
              {(it, set) => (<>
                <input value={it.title} onChange={e => set({ ...it, title: e.target.value })} className="inp" placeholder="Step title" />
                <textarea value={it.desc} onChange={e => set({ ...it, desc: e.target.value })} className="inp min-h-[52px] resize-y" placeholder="Description" />
              </>)}
            </ListEditor>
            <Sub>Rank ladder (short codes)</Sub>
            <ListEditor items={content.join.ladder} onChange={v => setField('join', 'ladder', v)} blank={() => ''}>
              {(it, set) => <input value={it} onChange={e => set(e.target.value)} className="inp" placeholder="e.g. CPO" />}
            </ListEditor>
            <Sub>Apply note (bottom CTA)</Sub>
            <textarea value={content.join.applyNote} onChange={e => setField('join', 'applyNote', e.target.value)} className="inp min-h-[70px] resize-y w-full" placeholder="Paste your Discord invite / how to apply" />
            <SaveBar k="join" />
          </>
        )}

        {/* DIVISIONS */}
        {tab === 'divisions' && (
          <>
            <p className="text-sm text-g-muted mb-4">Icons are assigned automatically by position.</p>
            <ListEditor items={content.divisions} onChange={v => update('divisions', v)} blank={() => ({ name: '', desc: '' })}>
              {(it, set) => (<>
                <input value={it.name} onChange={e => set({ ...it, name: e.target.value })} className="inp" placeholder="Division name" />
                <textarea value={it.desc} onChange={e => set({ ...it, desc: e.target.value })} className="inp min-h-[52px] resize-y" placeholder="Description" />
              </>)}
            </ListEditor>
            <SaveBar k="divisions" />
          </>
        )}

        {/* SERVICES */}
        {tab === 'services' && (
          <>
            <Field label="Emergency banner text"><textarea value={content.services.emergency} onChange={e => setField('services', 'emergency', e.target.value)} className="inp min-h-[60px] resize-y" /></Field>
            <Sub>Licenses & IDs</Sub>
            <ListEditor items={content.services.licenses} onChange={v => setField('services', 'licenses', v)} blank={() => ({ name: '', desc: '' })}>
              {(it, set) => (<>
                <input value={it.name} onChange={e => set({ ...it, name: e.target.value })} className="inp" placeholder="License name" />
                <textarea value={it.desc} onChange={e => set({ ...it, desc: e.target.value })} className="inp min-h-[52px] resize-y" placeholder="Description" />
              </>)}
            </ListEditor>
            <Sub>Reports & requests</Sub>
            <ListEditor items={content.services.reports} onChange={v => setField('services', 'reports', v)} blank={() => ({ title: '', desc: '' })}>
              {(it, set) => (<>
                <input value={it.title} onChange={e => set({ ...it, title: e.target.value })} className="inp" placeholder="Title" />
                <textarea value={it.desc} onChange={e => set({ ...it, desc: e.target.value })} className="inp min-h-[52px] resize-y" placeholder="Description" />
              </>)}
            </ListEditor>
            <SaveBar k="services" />
          </>
        )}

        {/* FAQ */}
        {tab === 'faq' && (
          <>
            <ListEditor items={content.faq} onChange={v => update('faq', v)} blank={() => ({ q: '', a: '' })}>
              {(it, set) => (<>
                <input value={it.q} onChange={e => set({ ...it, q: e.target.value })} className="inp" placeholder="Question" />
                <textarea value={it.a} onChange={e => set({ ...it, a: e.target.value })} className="inp min-h-[70px] resize-y" placeholder="Answer" />
              </>)}
            </ListEditor>
            <SaveBar k="faq" />
          </>
        )}
      </div>
    </div>
  )
}
