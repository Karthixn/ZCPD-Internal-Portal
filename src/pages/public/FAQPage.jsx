import { HelpCircle, ChevronDown } from 'lucide-react'
import { PageHeader } from '../../components/ui'
import { useSiteContent } from '../../lib/siteContent'

export default function FAQPage() {
  const items = useSiteContent('faq')
  const FAQ = (items || []).map(x => [x.q, x.a])
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={HelpCircle} title="Frequently Asked Questions" sub="Know your rights and how to work with the ZCPD" />

      <div className="space-y-3">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card group overflow-hidden">
            <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
              <span className="text-sm font-semibold text-g-text">{q}</span>
              <ChevronDown className="w-4 h-4 text-g-muted shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 -mt-1">
              <p className="text-sm text-g-sub leading-relaxed">{a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
