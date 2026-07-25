import { supabase } from '../../lib/supabase'

const COLORS = [
  ['bg-rose-500/20',   'text-rose-300'],
  ['bg-amber-500/20',  'text-amber-300'],
  ['bg-teal-500/20',   'text-teal-300'],
  ['bg-blue-500/20',   'text-blue-300'],
  ['bg-violet-500/20', 'text-violet-300'],
  ['bg-emerald-500/20','text-emerald-300'],
  ['bg-fuchsia-500/20','text-fuchsia-300'],
]

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'

const colorFor = (name = '') => {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return COLORS[h % COLORS.length]
}

export const avatarUrl = (path) =>
  path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null

/** Officer photo, or coloured initials when there's no photo. */
export default function Avatar({ name, path, size = 48, className = '' }) {
  const url = avatarUrl(path)
  const [bg, fg] = colorFor(name || '')
  const style = { width: size, height: size }

  if (url) {
    return (
      <img
        src={url} alt={name || ''} style={style} loading="lazy"
        className={`rounded-full object-cover bg-n-700 ${className}`}
      />
    )
  }
  return (
    <div
      style={{ ...style, fontSize: Math.round(size * 0.38) }}
      className={`rounded-full flex items-center justify-center font-semibold select-none ${bg} ${fg} ${className}`}
    >
      {initials(name)}
    </div>
  )
}
