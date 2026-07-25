import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Spinner, Empty, StatusBadge } from '../../components/ui'
import Avatar from '../../components/ui/Avatar'
import { Network, Users, Search, X } from 'lucide-react'

/* Rank ladder, most senior first, split into command tiers for colour-coding. */
const TIERS = [
  { name: 'Command',         accent: 'amber',   ranks: ['Chief Of Police', 'DGP', 'ADGP', 'Commissioner', 'DIG', 'IG'] },
  { name: 'Senior Officers', accent: 'sky',     ranks: ['SP', 'DYSP', 'CI', 'SI'] },
  { name: 'Officers',        accent: 'emerald', ranks: ['ASI', 'HC', 'CPO', 'PO'] },
]
const RANK_ORDER = TIERS.flatMap(t => t.ranks)
const rankIndex = (r) => { const i = RANK_ORDER.indexOf(r); return i === -1 ? RANK_ORDER.length : i }
const tierOf = (rank) => TIERS.find(t => t.ranks.includes(rank))?.accent ?? 'slate'

const ACCENT = {
  amber:   { bar: 'bg-amber-400',   text: 'text-amber-300',   ring: 'ring-amber-400/30' },
  sky:     { bar: 'bg-sky-400',     text: 'text-sky-300',     ring: 'ring-sky-400/30' },
  emerald: { bar: 'bg-emerald-400', text: 'text-emerald-300', ring: 'ring-emerald-400/30' },
  slate:   { bar: 'bg-slate-400',   text: 'text-slate-300',   ring: 'ring-slate-400/30' },
}

export default function RosterPage() {
  const [officers, setOfficers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('public_roster').select('*')
      setOfficers(data ?? [])
      setLoading(false)
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return officers
    return officers.filter(o =>
      (`${o.name} ${o.rank} ${o.badge_no} ${o.designation || ''}`).toLowerCase().includes(q))
  }, [officers, query])

  // Group by rank, ordered by seniority; officers alpha within a rank.
  const groups = useMemo(() => {
    const map = {}
    for (const o of filtered) (map[o.rank || 'Unranked'] ??= []).push(o)
    return Object.entries(map)
      .sort((a, b) => rankIndex(a[0]) - rankIndex(b[0]))
      .map(([rank, list]) => [rank, list.sort((x, y) => (x.name || '').localeCompare(y.name || ''))])
  }, [filtered])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <PageHeader icon={Network} title="Chain of Command" sub="ZCPD rank structure & active officers" />
        <div className="relative sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-g-muted pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="inp pl-9 pr-8" placeholder="Search name, rank, badge…" />
          {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-g-muted hover:text-g-text"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>
      ) : officers.length === 0 ? (
        <Empty icon={Users} title="No officers to show" desc="Active officers will appear here once added." />
      ) : groups.length === 0 ? (
        <Empty icon={Search} title="No matches" desc="No officers match your search." />
      ) : (
        <div className="space-y-8">
          {groups.map(([rank, list]) => {
            const a = ACCENT[tierOf(rank)]
            return (
              <section key={rank}>
                {/* Rank header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-1 h-5 rounded-full ${a.bar}`} />
                  <h2 className="text-sm font-bold text-g-text uppercase tracking-wide">{rank}</h2>
                  <span className={`text-xs font-semibold ${a.text}`}>{list.length}</span>
                  <span className="flex-1 h-px bg-n-600/60" />
                </div>

                {/* Officer cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {list.map(o => (
                    <div key={o.id} className="card p-4 flex items-center gap-3 hover:border-a-500/40 transition-colors">
                      <Avatar name={o.name} path={o.avatar_path} size={52} className={`shrink-0 ring-2 ${a.ring}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-g-text leading-tight truncate">{o.name}</p>
                        {o.designation && <p className="text-xs text-g-muted truncate mt-0.5">{o.designation}</p>}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-mono text-xs text-a-400">{o.badge_no}</span>
                          {o.status && o.status !== 'ACTIVE' && <StatusBadge v={o.status} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
