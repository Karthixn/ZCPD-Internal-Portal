import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Select, Spinner, Empty } from '../../components/ui'
import { FileText, Search } from 'lucide-react'

const TYPE_COLORS = {
  'Incident Report':'text-red-400 bg-red-900/20 border-red-700/30',
  'Case File':'text-purple-400 bg-purple-900/20 border-purple-700/30',
  'Confiscation Report':'text-amber-400 bg-amber-900/20 border-amber-700/30',
  'Notice':'text-blue-400 bg-blue-900/20 border-blue-700/30',
  'SOP Document':'text-teal-400 bg-teal-900/20 border-teal-700/30',
  'Other':'text-g-muted bg-n-700 border-n-600',
}

export default function BlotterPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [typeF, setTypeF]     = useState('All')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('public_records').select('*').order('created_at', { ascending: false })
      setRecords(data ?? [])
      setLoading(false)
    })()
  }, [])

  const types = useMemo(() => ['All', ...new Set(records.map(r => r.type).filter(Boolean))], [records])
  const shown = records.filter(r =>
    (typeF === 'All' || r.type === typeF) &&
    (!search || `${r.title} ${r.description || ''} ${r.reference_no || ''}`.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={FileText} title="Police Blotter" sub="Public records and notices released by the ZCPD" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-g-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="inp pl-9" placeholder="Search the blotter…" />
        </div>
        <Select value={typeF} onChange={e => setTypeF(e.target.value)} className="min-w-[160px]">
          {types.map(t => <option key={t}>{t}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-6 h-6" /></div>
      ) : shown.length === 0 ? (
        <Empty icon={FileText} title="Nothing here yet" desc="Public records released by the department will appear here." />
      ) : (
        <div className="space-y-3">
          {shown.map(r => (
            <article key={r.id} className="card p-5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[r.type] ?? TYPE_COLORS['Other']}`}>{r.type}</span>
                {r.reference_no && <span className="font-mono text-xs text-g-muted">#{r.reference_no}</span>}
              </div>
              <h3 className="font-semibold text-g-text mb-1">{r.title}</h3>
              {r.description && <p className="text-sm text-g-sub whitespace-pre-line leading-relaxed">{r.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-g-muted">
                {r.officer_name && <span>Filed by {r.officer_name}</span>}
                {r.incident_date && <span>· {r.incident_date}</span>}
                <span>· {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
