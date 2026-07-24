import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import VideoPlayer from '../../components/ui/VideoPlayer'
import { PageHeader, Modal, Field, Select, Spinner, Empty } from '../../components/ui'
import { PlayCircle, Plus, Pencil, Trash2, AlertCircle, Film } from 'lucide-react'

const BUCKET = 'training-videos'
const BLANK = { title: '', description: '', category: 'General', file: null }

const publicUrl = (path) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

export default function TrainingPage() {
  const { isFTI } = useAuth()          // isFTI is true for FTI and FTC
  const canManage = isFTI

  const [videos, setVideos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive]   = useState(null)

  // manage modal
  const [modal, setModal]   = useState(false)
  const [target, setTarget] = useState(null)   // editing existing row, or null for new
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')
  const [delTarget, setDelTarget] = useState(null)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('training_videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setVideos(data ?? [])
    setActive(a => a ?? data?.[0] ?? null)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const categories = useMemo(() => {
    const map = {}
    for (const v of videos) (map[v.category || 'General'] ??= []).push(v)
    return map
  }, [videos])

  function openNew()  { setTarget(null); setForm(BLANK); setErr(''); setModal(true) }
  function openEdit(v){ setTarget(v); setForm({ title: v.title, description: v.description || '', category: v.category || 'General', file: null }); setErr(''); setModal(true) }

  async function save() {
    setErr('')
    if (!form.title.trim()) { setErr('Title is required.'); return }
    if (!target && !form.file) { setErr('Please choose a video file.'); return }
    setSaving(true)
    try {
      let storage_path = target?.storage_path
      if (form.file) {
        const ext  = form.file.name.split('.').pop()
        const path = `${Date.now()}-${form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.${ext}`
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, form.file, {
          cacheControl: '3600', upsert: false, contentType: form.file.type,
        })
        if (upErr) throw upErr
        storage_path = path
      }
      const row = { title: form.title.trim(), description: form.description.trim() || null, category: form.category.trim() || 'General', storage_path }
      const res = target
        ? await supabase.from('training_videos').update(row).eq('id', target.id)
        : await supabase.from('training_videos').insert(row)
      if (res.error) throw res.error
      setModal(false); setForm(BLANK)
      await load()
    } catch (e) {
      setErr(e.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    if (delTarget.storage_path) await supabase.storage.from(BUCKET).remove([delTarget.storage_path])
    await supabase.from('training_videos').delete().eq('id', delTarget.id)
    if (active?.id === delTarget.id) setActive(null)
    setDelTarget(null); setSaving(false)
    load()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={PlayCircle} title="Training Videos" sub="Official ZCPD training material"
        action={canManage && <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" />Add video</button>}
      />

      {loading ? (
        <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>
      ) : videos.length === 0 ? (
        <Empty icon={Film} title="No training videos yet" desc={canManage ? 'Use “Add video” to upload the first one.' : 'Check back soon — videos will appear here.'} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Player */}
          <div className="flex-1 min-w-0">
            {active ? (
              <>
                <VideoPlayer key={active.id} src={publicUrl(active.storage_path)} className="aspect-video w-full" />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-a-400 uppercase tracking-wider mb-1">{active.category}</p>
                    <h2 className="text-lg font-semibold text-g-text">{active.title}</h2>
                    {active.description && <p className="text-sm text-g-muted mt-1.5 whitespace-pre-line">{active.description}</p>}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(active)} className="text-xs px-2 py-1 rounded border border-n-600 text-a-400 hover:bg-a-500/10 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDelTarget(active)} className="text-xs px-2 py-1 rounded border border-n-600 text-red-400 hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="aspect-video w-full card flex items-center justify-center text-g-muted text-sm">Select a video to play</div>
            )}
          </div>

          {/* Playlist */}
          <div className="w-full lg:w-80 shrink-0 space-y-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
            {Object.entries(categories).map(([cat, vids]) => (
              <div key={cat}>
                <p className="text-[10px] font-bold text-g-muted uppercase tracking-wider mb-1.5 px-1">{cat}</p>
                <div className="space-y-1.5">
                  {vids.map(v => (
                    <button key={v.id} onClick={() => setActive(v)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors border
                        ${active?.id === v.id ? 'bg-a-500/15 border-a-500/25' : 'border-transparent hover:bg-white/5'}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active?.id === v.id ? 'bg-a-500/25 text-a-400' : 'bg-n-700 text-g-muted'}`}>
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <span className={`text-sm truncate ${active?.id === v.id ? 'text-a-400 font-medium' : 'text-g-sub'}`}>{v.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={target ? 'Edit video' : 'Add training video'}>
        <div className="space-y-4">
          <Field label="Title" required><input value={form.title} onChange={e => f('title', e.target.value)} className="inp" placeholder="e.g. Traffic Stop Procedure" /></Field>
          <Field label="Category">
            <input value={form.category} onChange={e => f('category', e.target.value)} className="inp" placeholder="General" list="tv-cats" />
            <datalist id="tv-cats">{[...new Set(videos.map(v => v.category).filter(Boolean))].map(c => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Description"><textarea value={form.description} onChange={e => f('description', e.target.value)} className="inp min-h-[80px] resize-y" placeholder="What this video covers…" /></Field>
          <Field label={target ? 'Replace video file (optional)' : 'Video file'} required={!target}>
            <input type="file" accept="video/*" onChange={e => f('file', e.target.files?.[0] || null)}
              className="block w-full text-sm text-g-sub file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-a-500/15 file:text-a-400 file:text-sm file:cursor-pointer" />
            {target && <p className="text-xs text-g-muted mt-1">Leave empty to keep the current video.</p>}
          </Field>
          {err && <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-red-400 text-sm">{err}</p></div>}
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : target ? 'Save changes' : 'Upload video'}</button>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Delete video">
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg mb-5">
          <p className="text-sm text-red-300 font-medium mb-1">This action cannot be undone.</p>
          <p className="text-sm text-g-sub">Permanently delete <strong className="text-g-text">{delTarget?.title}</strong> and its video file?</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDelTarget(null)} className="btn-ghost">Cancel</button>
          <button onClick={confirmDelete} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50">{saving ? 'Deleting…' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  )
}
