import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TrendingUp, Search } from 'lucide-react'
import { PageHeader, Spinner, Empty } from '../../components/ui'

export default function PromotionHistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('promotion_history').select('*').order('promoted_date', { ascending: false })
      .then(({ data }) => {
        setRecords(data ?? [])
        setLoading(false)
      })
  }, [])

  const grouped = {}
  records.forEach(r => {
    const name = r.notes || 'Unknown'
    if (!grouped[name]) grouped[name] = []
    grouped[name].push(r)
  })

  Object.values(grouped).forEach(arr => arr.sort((a, b) => {
    const parse = d => { if (!d) return 0; const p = d.split('/'); return new Date(p[2], p[1]-1, p[0]).getTime() }
    return parse(a.promoted_date) - parse(b.promoted_date)
  }))

  const officers = Object.entries(grouped).filter(([name]) =>
    !search || name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader icon={TrendingUp} title="Promotion History" sub={`${records.length} promotions across ${Object.keys(grouped).length} officers`}/>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted"/>
        <input value={search} onChange={e => setSearch(e.target.value)} className="inp pl-9" placeholder="Search officer…"/>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner className="w-6 h-6"/></div>
      : officers.length === 0 ? <Empty icon={TrendingUp} title="No records found" desc="No promotion history available."/>
      : officers.map(([name, promos]) => (
        <div key={name} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-g-text text-base">{name}</h3>
              <span className="text-xs text-g-muted">{promos.length} promotion{promos.length > 1 ? 's' : ''}</span>
            </div>
            <span className="text-xs font-semibold text-a-400 bg-a-500/10 border border-a-500/20 px-2 py-0.5 rounded-full">
              {promos[promos.length - 1]?.to_rank}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {promos.map((p, i) => (
              <div key={p.id} className="flex items-center shrink-0">
                <div className="flex flex-col items-center px-3 py-2 rounded-lg border bg-green-900/20 border-green-700/30 min-w-[110px]">
                  <span className="text-[10px] font-bold uppercase text-green-300">{p.from_rank} → {p.to_rank}</span>
                  <span className="text-xs mt-1 font-mono text-g-text">{p.promoted_date || '—'}</span>
                </div>
                {i < promos.length - 1 && <div className="w-4 h-px mx-0.5 bg-green-700"/>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
