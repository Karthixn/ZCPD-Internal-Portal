import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TrendingUp, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { PageHeader, Spinner, Empty } from '../../components/ui'

const RANK_ORDER = ['Chief Of Police','DGP','ADGP','Commissioner','IG','DIG','SP','DYSP','CI','SI','ASI','HC','CPO','PO']

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

export default function PromotionHistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    supabase.from('promotion_history').select('*').order('promoted_date')
      .then(({ data }) => { setRecords(data ?? []); setLoading(false) })
  }, [])

  const grouped = {}
  records.forEach(r => {
    const name = r.notes || 'Unknown'
    if (!grouped[name]) grouped[name] = { promos: [], currentRank: r.to_rank }
    grouped[name].promos.push(r)
    const idx = RANK_ORDER.indexOf(r.to_rank)
    const curIdx = RANK_ORDER.indexOf(grouped[name].currentRank)
    if (idx !== -1 && (curIdx === -1 || idx < curIdx)) grouped[name].currentRank = r.to_rank
  })

  Object.values(grouped).forEach(g =>
    g.promos.sort((a, b) => new Date(a.promoted_date || 0) - new Date(b.promoted_date || 0))
  )

  const officers = Object.entries(grouped)
    .filter(([name]) => !search || name.toLowerCase().includes(search.toLowerCase()))
    .sort(([,a], [,b]) => {
      const ai = RANK_ORDER.indexOf(a.currentRank), bi = RANK_ORDER.indexOf(b.currentRank)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })

  const toggle = name => setExpanded(prev => prev === name ? null : name)

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader icon={TrendingUp} title="Promotion History" sub={`${records.length} promotions across ${Object.keys(grouped).length} officers`}/>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted"/>
        <input value={search} onChange={e => setSearch(e.target.value)} className="inp pl-9" placeholder="Search officer…"/>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner className="w-6 h-6"/></div>
      : officers.length === 0 ? <Empty icon={TrendingUp} title="No records found" desc="No promotion history available."/>
      : <div className="card overflow-hidden">
          <table className="tbl">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Officer</th>
                <th>Current Rank</th>
                <th>Total Promotions</th>
                <th>First Promotion</th>
                <th>Latest Promotion</th>
              </tr>
            </thead>
            <tbody>
              {officers.map(([name, { promos, currentRank }]) => {
                const isOpen = expanded === name
                const first = promos[0]
                const last = promos[promos.length - 1]
                return (
                  <>{/* eslint-disable-next-line react/jsx-key */}
                    <tr key={name} className="cursor-pointer hover:bg-white/[0.02]" onClick={() => toggle(name)}>
                      <td className="text-center">
                        {isOpen
                          ? <ChevronDown className="w-3.5 h-3.5 text-a-400 inline"/>
                          : <ChevronRight className="w-3.5 h-3.5 text-g-muted inline"/>}
                      </td>
                      <td className="font-medium text-g-text">{name}</td>
                      <td>
                        <span className="text-xs font-semibold text-a-400 bg-a-500/10 border border-a-500/20 px-2 py-0.5 rounded-full">
                          {currentRank}
                        </span>
                      </td>
                      <td className="font-mono text-sm text-g-sub">{promos.length}</td>
                      <td className="text-xs text-g-muted">{first ? `${first.from_rank} → ${first.to_rank} · ${fmtDate(first.promoted_date)}` : '—'}</td>
                      <td className="text-xs text-g-sub">{last ? `${last.from_rank} → ${last.to_rank} · ${fmtDate(last.promoted_date)}` : '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr key={name + '-detail'}>
                        <td colSpan={6} className="!p-0">
                          <div className="bg-n-800/50 px-6 py-4 border-t border-b border-n-600/50">
                            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                              {promos.map((p, i) => (
                                <div key={p.id} className="flex items-center shrink-0">
                                  <div className="flex flex-col items-center px-3 py-2 rounded-lg border bg-green-900/20 border-green-700/30 min-w-[100px]">
                                    <span className="text-[10px] font-bold uppercase text-green-300">{p.from_rank} → {p.to_rank}</span>
                                    <span className="text-[11px] mt-1 font-mono text-g-text">{fmtDate(p.promoted_date)}</span>
                                  </div>
                                  {i < promos.length - 1 && <div className="w-6 h-px mx-0.5 bg-green-700/60"/>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}
