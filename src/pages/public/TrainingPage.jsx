import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Modal, Field, Spinner, Empty } from '../../components/ui'
import { PlayCircle, Plus, Pencil, Trash2, AlertCircle, Film, Search, X, Layers } from 'lucide-react'

const BLANK = { title: '', description: '', category: 'General', youtube_url: '' }

/* Extract the 11-char video id from any common YouTube URL form. */
function ytId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null)
}
const embedUrl = (url) => `https://www.youtube-nocookie.com/embed/${ytId(url)}?rel=0&modestbranding=1`
const thumbUrl = (url) => `https://img.youtube.com/vi/${ytId(url)}/mqdefault.jpg`

export default function TrainingPage() {
  const { isFTI } = useAuth()          // isFTI is true for FTI and FTC
  const canManage = isFTI

  const [videos, setVideos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive]   = useState(null)

  // filtering
  const [query, setQuery] = useState('')
  const [cat, setCat]     = useState('All')

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

  const allCats = useMemo(
    () => [...new Set(videos.map(v => v.category || 'General'))],
    [videos]
  )

  // Apply category + search filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return videos.filter(v => {
      if (cat !== 'All' && (v.category || 'General') !== cat) return false
      if (!q) return true
      return (v.title + ' ' + (v.description || '') + ' ' + (v.category || '')).toLowerCase().includes(q)
    })
  }, [videos, query, cat])

  // Group the filtered list by category for the playlist
  const grouped = useMemo(() => {
    const map = {}
    for (const v of filtered) (map[v.category || 'General'] ??= []).push(v)
    return map
  }, [filtered])

  function openNew()  { setTarget(null); setForm(BLANK); setErr(''); setModal(true) }
  function openEdit(v){ setTarget(v); setForm({ title: v.title, description: v.description || '', category: v.category || 'General', youtube_url: v.youtube_url || '' }); setErr(''); setModal(true) }

  async function save() {
    setErr('')
    if (!form.title.trim()) { setErr('Title is required.'); return }
    if (!ytId(form.youtube_url)) { setErr('Enter a valid YouTube link (e.g. https://youtu.be/… or https://www.youtube.com/watch?v=…).'); return }
    setSaving(true)
    try {
      const row = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || 'General',
        youtube_url: form.youtube_url.trim(),
      }
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
        <Empty icon={Film} title="No training videos yet" desc={canManage ? 'Use “Add video” to add the first one.' : 'Check back soon — videos will appear here.'} />
      ) : (
        <>
          {/* Toolbar: summary · search · category chips */}
          <div className="card p-3 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-g-muted shrink-0">
              <Film className="w-3.5 h-3.5 text-a-400" />
              <span><strong className="text-g-text">{videos.length}</strong> video{videos.length !== 1 && 's'}</span>
              <span className="text-g-muted/50">·</span>
              <Layers className="w-3.5 h-3.5 text-a-400" />
              <span><strong className="text-g-text">{allCats.length}</strong> categor{allCats.length !== 1 ? 'ies' : 'y'}</span>
            </div>

            <div className="relative flex-1 min-w-0 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-g-muted pointer-events-none" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                className="inp pl-9 pr-8" placeholder="Search videos…"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-g-muted hover:text-g-text">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto lg:ml-auto">
              {['All', ...allCats].map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
                    ${cat === c ? 'bg-a-500/15 border-a-500/30 text-a-400' : 'border-n-600 text-g-muted hover:text-g-text hover:bg-white/5'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player + description */}
            <div className="flex-1 min-w-0">
              {active ? (
                <>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      key={active.id}
                      src={embedUrl(active.youtube_url)}
                      title={active.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  </div>
                  <div className="card p-5 mt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-bold text-a-400 uppercase tracking-wider bg-a-500/10 border border-a-500/20 rounded px-1.5 py-0.5 mb-2">{active.category}</span>
                        <h2 className="text-lg font-semibold text-g-text">{active.title}</h2>
                        {active.description
                          ? <p className="text-sm text-g-sub mt-2 whitespace-pre-line leading-relaxed">{active.description}</p>
                          : <p className="text-sm text-g-muted mt-2 italic">No description.</p>}
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => openEdit(active)} className="text-xs px-2 py-1 rounded border border-n-600 text-a-400 hover:bg-a-500/10 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDelTarget(active)} className="text-xs px-2 py-1 rounded border border-n-600 text-red-400 hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video w-full card flex items-center justify-center text-g-muted text-sm">Select a video to play</div>
              )}
            </div>

            {/* Playlist */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="card p-3 lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto space-y-4">
                <p className="text-xs font-semibold text-g-text px-1">
                  {filtered.length === videos.length ? 'All videos' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
                </p>
                {filtered.length === 0 ? (
                  <p className="text-sm text-g-muted px-1 py-6 text-center">No videos match your search.</p>
                ) : Object.entries(grouped).map(([c, vids]) => (
                  <div key={c}>
                    <p className="text-[10px] font-bold text-g-muted uppercase tracking-wider mb-1.5 px-1">{c}</p>
                    <div className="space-y-1.5">
                      {vids.map(v => (
                        <button key={v.id} onClick={() => setActive(v)}
                          className={`w-full flex items-center gap-3 p-1.5 rounded-lg text-left transition-colors border
                            ${active?.id === v.id ? 'bg-a-500/15 border-a-500/25' : 'border-transparent hover:bg-white/5'}`}>
                          <div className="relative w-20 h-12 rounded-md overflow-hidden bg-n-700 shrink-0">
                            <img src={thumbUrl(v.youtube_url)} alt="" className="w-full h-full object-cover" loading="lazy" />
                            {active?.id === v.id && <div className="absolute inset-0 bg-a-500/25 flex items-center justify-center"><PlayCircle className="w-4 h-4 text-white" /></div>}
                          </div>
                          <span className={`text-sm leading-snug line-clamp-2 ${active?.id === v.id ? 'text-a-400 font-medium' : 'text-g-sub'}`}>{v.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add / edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={target ? 'Edit video' : 'Add training video'}>
        <div className="space-y-4">
          <Field label="Title" required><input value={form.title} onChange={e => f('title', e.target.value)} className="inp" placeholder="e.g. Traffic Stop Procedure" /></Field>
          <Field label="Category">
            <input value={form.category} onChange={e => f('category', e.target.value)} className="inp" placeholder="General" list="tv-cats" />
            <datalist id="tv-cats">{allCats.map(c => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="YouTube link" required>
            <input value={form.youtube_url} onChange={e => f('youtube_url', e.target.value)} className="inp" placeholder="https://youtu.be/… or https://www.youtube.com/watch?v=…" />
            <p className="text-xs text-g-muted mt-1">Tip: set the video to <strong>Unlisted</strong> on YouTube so only this site links to it.</p>
          </Field>
          <Field label="Description"><textarea value={form.description} onChange={e => f('description', e.target.value)} className="inp min-h-[80px] resize-y" placeholder="What this video covers…" /></Field>
          {err && <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-red-400 text-sm">{err}</p></div>}
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : target ? 'Save changes' : 'Add video'}</button>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Delete video">
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg mb-5">
          <p className="text-sm text-red-300 font-medium mb-1">This removes it from the portal.</p>
          <p className="text-sm text-g-sub">Remove <strong className="text-g-text">{delTarget?.title}</strong> from the training list? (The video stays on YouTube.)</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDelTarget(null)} className="btn-ghost">Cancel</button>
          <button onClick={confirmDelete} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50">{saving ? 'Deleting…' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  )
}
