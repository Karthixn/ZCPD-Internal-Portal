import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Modal, Field, Select, Spinner, Empty } from '../../components/ui'
import { Megaphone, Plus, Pencil, Trash2, Pin, AlertCircle } from 'lucide-react'
import { logActivity } from '../../lib/activity'

const BLANK = { title: '', body: '', category: 'Update', pinned: false }
const fmtDate = (s) => new Date(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export default function NewsPage() {
  const { isFTI, officer: me } = useAuth()
  const canManage = isFTI

  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal]   = useState(false)
  const [target, setTarget] = useState(null)
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')
  const [delTarget, setDelTarget] = useState(null)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('news_posts').select('*')
      .order('pinned', { ascending: false }).order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew()  { setTarget(null); setForm(BLANK); setErr(''); setModal(true) }
  function openEdit(p){ setTarget(p); setForm({ title: p.title, body: p.body, category: p.category || 'Update', pinned: !!p.pinned }); setErr(''); setModal(true) }

  async function save() {
    setErr('')
    if (!form.title.trim() || !form.body.trim()) { setErr('Title and body are required.'); return }
    setSaving(true)
    const row = { title: form.title.trim(), body: form.body.trim(), category: form.category.trim() || 'Update', pinned: form.pinned }
    const res = target
      ? await supabase.from('news_posts').update(row).eq('id', target.id)
      : await supabase.from('news_posts').insert(row)
    setSaving(false)
    if (res.error) { setErr(res.error.message); return }
    if (!target) logActivity({ action: `Posted announcement: ${row.title}`, kind: 'news', actor: me?.name })
    setModal(false); load()
  }

  async function confirmDelete() {
    setSaving(true)
    await supabase.from('news_posts').delete().eq('id', delTarget.id)
    setDelTarget(null); setSaving(false); load()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Megaphone} title="News & Announcements" sub="Official updates from the Zion City Police Department"
        action={canManage && <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" />New post</button>}
      />

      {loading ? (
        <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>
      ) : posts.length === 0 ? (
        <Empty icon={Megaphone} title="No announcements yet" desc={canManage ? 'Use “New post” to publish the first one.' : 'Check back soon for department updates.'} />
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <article key={p.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.pinned && <Pin className="w-3.5 h-3.5 text-a-400" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-a-400 bg-a-500/10 border border-a-500/20 rounded px-1.5 py-0.5">{p.category}</span>
                  <span className="text-xs text-g-muted">{fmtDate(p.created_at)}</span>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 rounded border border-n-600 text-a-400 hover:bg-a-500/10 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDelTarget(p)} className="text-xs px-2 py-1 rounded border border-n-600 text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-g-text mb-1.5">{p.title}</h2>
              <p className="text-sm text-g-sub whitespace-pre-line leading-relaxed">{p.body}</p>
            </article>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={target ? 'Edit post' : 'New announcement'} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" required><input value={form.title} onChange={e => f('title', e.target.value)} className="inp" placeholder="Headline" /></Field>
            <Field label="Category">
              <Select value={form.category} onChange={e => f('category', e.target.value)}>
                {['Update', 'Press Release', 'Recruitment', 'Public Safety', 'Event'].map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Body" required><textarea value={form.body} onChange={e => f('body', e.target.value)} className="inp min-h-[140px] resize-y" placeholder="Write the announcement…" /></Field>
          <label className="flex items-center gap-2 text-sm text-g-sub cursor-pointer">
            <input type="checkbox" checked={form.pinned} onChange={e => f('pinned', e.target.checked)} className="accent-a-500" />
            Pin to top
          </label>
          {err && <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-red-400 text-sm">{err}</p></div>}
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : target ? 'Save changes' : 'Publish'}</button>
        </div>
      </Modal>

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Delete post">
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg mb-5">
          <p className="text-sm text-g-sub">Delete <strong className="text-g-text">{delTarget?.title}</strong>? This cannot be undone.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDelTarget(null)} className="btn-ghost">Cancel</button>
          <button onClick={confirmDelete} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50">{saving ? 'Deleting…' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  )
}
