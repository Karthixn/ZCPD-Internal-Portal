import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Empty } from '../../components/ui'
import Avatar from '../../components/ui/Avatar'
import { UserCog, Upload, Trash2, AlertCircle, CheckCircle2, UserX } from 'lucide-react'

const BUCKET = 'avatars'
const MAX_MB = 3

export default function ProfileSettingsPage() {
  const { officer, profile } = useAuth()
  const fileRef = useRef(null)

  const [path, setPath]   = useState(null)   // current avatar_path
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState('')
  const [ok, setOk]       = useState('')

  // Load the officer's current photo (AuthContext officer may be stale on it).
  useEffect(() => {
    if (!officer?.id) return
    supabase.from('officers').select('avatar_path').eq('id', officer.id).single()
      .then(({ data }) => setPath(data?.avatar_path ?? null))
  }, [officer?.id])

  if (!officer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <PageHeader icon={UserCog} title="Profile Settings" />
        <Empty icon={UserX} title="No officer linked to your account"
          desc="Your login isn't linked to an officer record yet. Ask your FTC to link it, then you can set a photo." />
      </div>
    )
  }

  async function onPick(e) {
    setErr(''); setOk('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return }
    if (file.size > MAX_MB * 1024 * 1024) { setErr(`Image must be under ${MAX_MB} MB.`); return }

    setBusy(true)
    try {
      const ext     = file.name.split('.').pop()
      const newPath = `officer-${officer.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(newPath, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { error: dbErr } = await supabase.from('officers').update({ avatar_path: newPath }).eq('id', officer.id)
      if (dbErr) throw dbErr

      // best-effort cleanup of the old file
      if (path && path !== newPath) supabase.storage.from(BUCKET).remove([path])
      setPath(newPath); setOk('Photo updated.')
    } catch (e) {
      setErr(e.message || 'Upload failed.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function removePhoto() {
    setErr(''); setOk(''); setBusy(true)
    try {
      await supabase.from('officers').update({ avatar_path: null }).eq('id', officer.id)
      if (path) supabase.storage.from(BUCKET).remove([path])
      setPath(null); setOk('Photo removed.')
    } catch (e) {
      setErr(e.message || 'Could not remove photo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={UserCog} title="Profile Settings" sub="Manage how you appear on the public roster" />

      <div className="card p-6">
        <div className="flex items-center gap-5">
          <Avatar name={officer.name} path={path} size={88} className="ring-2 ring-n-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-base font-semibold text-g-text">{officer.name}</p>
            <p className="text-sm text-g-muted">{officer.rank}{officer.badge_no ? ` · ${officer.badge_no}` : ''}</p>
            {officer.designation && <p className="text-xs text-g-muted mt-0.5">{officer.designation}</p>}
          </div>
        </div>

        <div className="border-t border-n-600 mt-6 pt-5">
          <p className="text-sm font-medium text-g-text mb-1">Profile photo</p>
          <p className="text-xs text-g-muted mb-4">Shown on the public Chain of Command page. Square images work best. Max {MAX_MB} MB.</p>

          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
          <div className="flex items-center gap-3">
            <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-primary">
              <Upload className="w-4 h-4" />{busy ? 'Uploading…' : path ? 'Change photo' : 'Upload photo'}
            </button>
            {path && (
              <button onClick={removePhoto} disabled={busy} className="text-sm px-3 py-2 rounded-lg border border-n-600 text-red-400 hover:bg-red-900/10 transition-colors inline-flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />Remove
              </button>
            )}
          </div>

          {err && <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 mt-4"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-red-400 text-sm">{err}</p></div>}
          {ok  && <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/40 rounded-lg px-3 py-2.5 mt-4"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /><p className="text-green-400 text-sm">{ok}</p></div>}
        </div>
      </div>
    </div>
  )
}
