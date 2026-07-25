import { PageHeader } from '../../components/ui'
import { useSiteContent } from '../../lib/siteContent'
import { Scale, CreditCard, FileText, AlertTriangle, Phone } from 'lucide-react'

export default function ServicesPage() {
  const c = useSiteContent('services')
  const LICENSES = (c.licenses || []).map(l => [l.name, l.desc])
  const REPORTS = (c.reports || []).map(r => [r.title, r.desc])
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Scale} title="Citizen Services" sub="Licenses, reports and how the ZCPD can help you" />

      {/* Emergency strip */}
      <div className="card p-4 mb-6 flex items-center gap-4 bg-red-900/10 border-red-700/30">
        <Phone className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <p className="text-sm text-g-sub whitespace-pre-line">{c.emergency}</p>
        </div>
      </div>

      {/* Licenses & IDs */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4"><CreditCard className="w-4 h-4 text-a-400" /><h2 className="text-base font-semibold text-g-text">Licenses & Identification</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LICENSES.map(([t, d]) => (
            <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-3">
              <p className="text-sm font-semibold text-a-400 mb-1">{t}</p>
              <p className="text-xs text-g-sub">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reports & requests */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-a-400" /><h2 className="text-base font-semibold text-g-text">Reports & Requests</h2></div>
        <div className="space-y-3">
          {REPORTS.map(([t, d]) => (
            <div key={t} className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-a-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-g-text">{t}</p>
                <p className="text-sm text-g-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
