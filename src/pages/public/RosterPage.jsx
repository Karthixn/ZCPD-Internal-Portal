import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Spinner, Empty, StatusBadge } from '../../components/ui'
import Avatar from '../../components/ui/Avatar'
import { Network, Users, Search, X } from 'lucide-react'

/* Rank ladder, most senior first, split into command tiers for colour-coding. */
const TIERS = [
  { accent: 'amber',   ranks: ['Chief Of Police', 'DGP', 'ADGP', 'Commissioner', 'DIG', 'IG'] },
  { accent: 'sky',     ranks: ['SP', 'DYSP', 'CI', 'SI'] },
  { accent: 'emerald', ranks: ['ASI', 'HC', 'CPO', 'PO'] },
]
const RANK_ORDER = TIERS.flatMap(t => t.ranks)
const rankIndex = (r) => { const i = RANK_ORDER.indexOf(r); return i === -1 ? RANK_ORDER.length : i }

/* Only show this rank and everything below it (set to null to show all). */
const START_RANK = 'ADGP'
const startIdx = START_RANK ? RANK_ORDER.indexOf(START_RANK) : 0
const tierOf = (rank) => TIERS.find(t => t.ranks.includes(rank))?.accent ?? 'slate'

const ACCENT = {
  amber:   { bar: 'bg-amber-400',   text: 'text-amber-300',   ring: 'ring-amber-400/40' },
  sky:     { bar: 'bg-sky-400',     text: 'text-sky-300',     ring: 'ring-sky-400/40' },
  emerald: { bar: 'bg-emerald-400', text: 'text-emerald-300', ring: 'ring-emerald-400/40' },
  slate:   { bar: 'bg-slate-400',   text: 'text-slate-300',   ring: 'ring-slate-400/40' },
}

const LINE = 'bg-n-600'

/* trailing number in a badge, e.g. "DIG-801" -> 801, for ordering within a rank */
const badgeNum = (b = '') => { const m = b.match(/(\d+)\s*$/) || b.match(/(\d+)/); return m ? parseInt(m[1]) : 9999 }

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
    return officers.filter(o => {
      if (rankIndex(o.rank) < startIdx) return false   // hide ranks above START_RANK
      if (!q) return true
      return (`${o.name} ${o.rank} ${o.badge_no} ${o.designation || ''}`).toLowerCase().includes(q)
    })
  }, [officers, query])

  // Group by rank (seniority order); within a rank sort by badge number.
  const levels = useMemo(() => {
    const map = {}
    for (const o of filtered) (map[o.rank || 'Unranked'] ??= []).push(o)
    return Object.entries(map)
      .sort((a, b) => rankIndex(a[0]) - rankIndex(b[0]))
      .map(([rank, list]) => [rank, list.sort((x, y) => badgeNum(x.badge_no) - badgeNum(y.badge_no))])
  }, [filtered])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <PageHeader icon={Network} title="Chain of Command" sub="ZCPD rank structure & officers" />
        <div className="relative sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-g-muted pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="inp pl-9 pr-8" placeholder="Search name, rank, badge…" />
          {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-g-muted hover:text-g-text"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>
      ) : officers.length === 0 ? (
        <Empty icon={Users} title="No officers to show" desc="Officers will appear here once added." />
      ) : levels.length === 0 ? (
        <Empty icon={Search} title="No matches" desc="No officers match your search." />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max flex flex-col items-center mx-auto">
            {levels.map(([rank, list], li) => {
              const a = ACCENT[tierOf(rank)]
              const many = list.length > 1
              return (
                <div key={rank} className="flex flex-col items-center">
                  {/* spine connecting from the level above */}
                  {li > 0 && <div className={`w-px h-4 ${LINE}`} />}

                  {/* Rank pill */}
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-n-600 bg-n-800">
                    <span className={`w-1.5 h-1.5 rounded-full ${a.bar}`} />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-g-text">{rank}</span>
                    <span className={`text-[11px] font-semibold ${a.text}`}>{list.length}</span>
                  </div>

                  {/* drop from pill toward the cards */}
                  <div className={`w-px h-3 ${LINE}`} />

                  {/* Officer node row with branch connectors */}
                  <div className="relative flex justify-center gap-4 px-2">
                    {/* horizontal branch bar spans between the first and last card centres (card = 13rem wide) */}
                    {many && <span className={`absolute top-0 h-px ${LINE}`} style={{ left: '6.5rem', right: '6.5rem' }} />}
                    {list.map(o => (
                      <div key={o.id} className="relative w-52 pt-3">
                        <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 ${LINE}`} />
                        <div className="card px-3 py-2 flex items-center gap-2.5 text-left hover:border-a-500/40 transition-colors">
                          <Avatar name={o.name} path={o.avatar_path} size={38} className={`ring-2 shrink-0 ${a.ring}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-g-text leading-tight truncate" title={o.name}>{o.name}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-a-400">{o.badge_no}</span>
                              {o.status && o.status !== 'ACTIVE' && <span className="scale-90 origin-left"><StatusBadge v={o.status} /></span>}
                            </div>
                            {o.designation && <p className="text-[10px] text-g-muted truncate">{o.designation}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
