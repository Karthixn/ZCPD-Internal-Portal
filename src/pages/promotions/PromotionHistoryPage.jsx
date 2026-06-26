import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TrendingUp, Search } from 'lucide-react'
import { PageHeader, Spinner, Empty } from '../../components/ui'

const RANK_ORDER = ['Chief Of Police','DGP','ADGP','Commissioner','DIG','IG','SP','DYSP','CI','SI','ASI','HC','CPO','PO']
const PROMO_STEPS = ['PO TO CPO','CPO TO HC','HC TO ASI','ASI TO SI','SI TO CI','CI TO DYSP','DYSP TO SP','SP TO DIG','DIG TO IG','IG TO COMMISSIONER']

export default function PromotionHistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rankF, setRankF] = useState('All')

  useEffect(() => {
    supabase.from('promotion_history').select('*').order('id')
      .then(({ data }) => { setRecords(data ?? []); setLoading(false) })
  }, [])

  const shown = records.filter(r =>
    (rankF === 'All' || r.current_rank === rankF) &&
    (!search || r.officer_name?.toLowerCase().includes(search.toLowerCase()))
  )

  const ranks = ['All', ...new Set(records.map(r => r.current_rank).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader icon={TrendingUp} title="Promotion History" sub="Complete promotion timeline of all officers"/>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted"/>
          <input value={search} onChange={e => setSearch(e.target.value)} className="inp pl-9" placeholder="Search officer…"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ranks.map(r => (
            <button key={r} onClick={() => setRankF(r)}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${rankF === r ? 'bg-a-500/20 border-a-500/40 text-a-400' : 'bg-n-700 border-n-600 text-g-muted hover:text-g-text'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner className="w-6 h-6"/></div>
      : shown.length === 0 ? <Empty icon={TrendingUp} title="No records found" desc="No promotion history available."/>
      : shown.map(r => (
        <div key={r.id} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-g-text text-base">{r.officer_name}</h3>
              <span className="text-xs font-semibold text-a-400 bg-a-500/10 border border-a-500/20 px-2 py-0.5 rounded-full">{r.current_rank}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PROMO_STEPS.map((step, i) => {
              const date = r[`promo${i + 1}_date`]
              const active = !!date
              const isCurrent = i < PROMO_STEPS.length - 1 && r[`promo${i + 1}_date`] && !r[`promo${i + 2}_date`]
              return (
                <div key={step} className="flex items-center shrink-0">
                  <div className={`flex flex-col items-center px-3 py-2 rounded-lg border min-w-[100px] ${
                    active ? 'bg-green-900/20 border-green-700/30' : 'bg-n-800 border-n-600 opacity-40'
                  } ${isCurrent ? 'ring-1 ring-a-500/40' : ''}`}>
                    <span className={`text-[10px] font-bold uppercase ${active ? 'text-green-300' : 'text-g-muted'}`}>{step}</span>
                    <span className={`text-xs mt-1 font-mono ${active ? 'text-g-text' : 'text-g-muted'}`}>{date || '—'}</span>
                  </div>
                  {i < PROMO_STEPS.length - 1 && <div className={`w-4 h-px mx-0.5 ${active ? 'bg-green-700' : 'bg-n-600'}`}/>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
