import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, StatusBadge, PhasePill, ScoreBar, Spinner, Empty } from '../../components/ui'
import { GraduationCap, UserX, ClipboardList, FileText, CheckCircle } from 'lucide-react'

const PHASES = [
  ['Phase 1', 'phase1_status', 'phase1_date', 'phase1_fto'],
  ['Phase 2', 'phase2_status', 'phase2_date', 'phase2_fto'],
  ['Phase 3', 'phase3_status', 'phase3_date', 'phase3_fto'],
]

export default function MyStatusPage() {
  const { officer } = useAuth()
  const [cadet, setCadet]     = useState(null)
  const [potests, setPotests] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!officer?.badge_no) { setLoading(false); return }
      const { data: c } = await supabase.from('cadet_applications').select('*').eq('badge_no', officer.badge_no).order('created_at', { ascending: false }).limit(1).maybeSingle()
      setCadet(c ?? null)
      if (c) {
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase.from('po_test_results').select('*').eq('cadet_id', c.id).order('created_at', { ascending: false }),
          supabase.from('fto_weekly_reports').select('*').eq('cadet_id', c.id).order('week_number'),
        ])
        setPotests(p ?? []); setReports(r ?? [])
      }
      setLoading(false)
    }
    load()
  }, [officer?.badge_no])

  if (loading) return <div className="p-16 flex justify-center"><Spinner className="w-6 h-6" /></div>

  if (!cadet) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader icon={GraduationCap} title="My Training" sub="Your Field Training progress" />
        <Empty icon={UserX} title="No training record found"
          desc={`We couldn't find a cadet record linked to your badge (${officer?.badge_no ?? '—'}). If you're currently in training, ask your FTO to check your record.`} />
      </div>
    )
  }

  const latestTest = potests[0]

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader icon={GraduationCap} title="My Training" sub="Your Field Training progress (view only)" />

      {/* Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-g-text">{cadet.name}</h2>
            <p className="text-sm text-g-muted">{cadet.badge_no}{cadet.batch_no ? ` · Batch ${cadet.batch_no}` : ''}{cadet.assigned_fto ? ` · FTO ${cadet.assigned_fto}` : ''}</p>
          </div>
          <StatusBadge v={cadet.status} />
        </div>
      </div>

      {/* Phases */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-g-text flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4 text-a-400" />Training Phases</h3>
        <div className="space-y-3">
          {PHASES.map(([label, sKey, dKey, fKey]) => (
            <div key={label} className="flex items-center justify-between bg-n-800 border border-n-600 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-g-text">{label}</p>
                <p className="text-xs text-g-muted">{cadet[dKey] ? `${cadet[dKey]}` : 'Not dated'}{cadet[fKey] ? ` · ${cadet[fKey]}` : ''}</p>
              </div>
              <PhasePill v={cadet[sKey]} />
            </div>
          ))}
        </div>
      </div>

      {/* PO test */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-g-text flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-a-400" />PO Test</h3>
        {!latestTest ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-g-muted">Not taken yet.</p>
            <PhasePill v={cadet.po_test_status} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-g-text font-medium">{latestTest.test_date}</p>
                <p className="text-xs text-g-muted">Evaluated by {latestTest.fto_name}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${latestTest.recommendation === 'PASSED' ? 'bg-green-900/40 text-green-300 border-green-700/40' : 'bg-red-900/40 text-red-300 border-red-700/40'}`}>{latestTest.recommendation}</span>
            </div>
            <ScoreBar score={cadet.po_test_score ?? 0} max={60} />
            {latestTest.overall_remarks && <div className="mt-3 p-3 bg-n-800 rounded-lg"><p className="text-xs text-g-muted mb-1">Remarks</p><p className="text-sm text-g-sub">{latestTest.overall_remarks}</p></div>}
          </div>
        )}
      </div>

      {/* Weekly reports */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-g-text flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-a-400" />Weekly Reports</h3>
        {reports.length === 0 ? <p className="text-sm text-g-muted">No weekly reports filed yet.</p>
        : <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="bg-n-800 border border-n-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-g-text">Week {r.week_number}</p>
                  <span className="text-xs text-g-muted">{r.performance} · {r.duty_hrs} hrs</span>
                </div>
                {r.activities && <p className="text-xs text-g-sub whitespace-pre-line">{r.activities}</p>}
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  )
}
