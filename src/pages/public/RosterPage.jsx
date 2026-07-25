import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Spinner, Empty } from '../../components/ui'
import Avatar from '../../components/ui/Avatar'
import { Network, Users } from 'lucide-react'

/* Rank ladder, most senior first (matches the Officers page order). */
const RANK_ORDER = [
  'Chief Of Police', 'DGP', 'ADGP', 'Commissioner', 'DIG', 'IG',
  'SP', 'DYSP', 'CI', 'SI', 'ASI', 'HC', 'CPO', 'PO',
]
const rankIndex = (r) => {
  const i = RANK_ORDER.indexOf(r)
  return i === -1 ? RANK_ORDER.length : i
}

export default function RosterPage() {
  const [officers, setOfficers] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('public_roster').select('*')
      setOfficers(data ?? [])
      setLoading(false)
    })()
  }, [])

  // Group by rank, ordered by seniority; officers alpha within a rank.
  const tiers = useMemo(() => {
    const map = {}
    for (const o of officers) (map[o.rank || 'Unranked'] ??= []).push(o)
    return Object.entries(map)
      .sort((a, b) => rankIndex(a[0]) - rankIndex(b[0]))
      .map(([rank, list]) => [rank, list.sort((x, y) => (x.name || '').localeCompare(y.name || ''))])
  }, [officers])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Network} title="Chain of Command" sub="ZCPD rank structure & active officers" />

      {loading ? (
        <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>
      ) : officers.length === 0 ? (
        <Empty icon={Users} title="No officers to show" desc="Active officers will appear here once added." />
      ) : (
        <div className="relative flex flex-col items-center">
          {tiers.map(([rank, list], ti) => (
            <div key={rank} className="w-full flex flex-col items-center">
              {/* connector from the tier above */}
              {ti > 0 && <div className="w-px h-6 bg-n-600" />}

              {/* Rank label */}
              <div className="mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-a-400 bg-a-500/10 border border-a-500/20 rounded-full px-3 py-1">
                  {rank} <span className="text-g-muted font-medium">· {list.length}</span>
                </span>
              </div>

              {/* Officer cards for this rank */}
              <div className="flex flex-wrap justify-center gap-3 mb-2">
                {list.map(o => (
                  <div key={o.id} className="card p-4 w-44 flex flex-col items-center text-center hover:border-a-500/40 transition-colors">
                    <Avatar name={o.name} path={o.avatar_path} size={64} className="mb-3 ring-2 ring-n-600" />
                    <p className="text-sm font-semibold text-g-text leading-tight">{o.name}</p>
                    {o.designation && <p className="text-xs text-g-muted mt-0.5">{o.designation}</p>}
                    <p className="mt-1.5 font-mono text-xs text-a-400">{o.badge_no}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
