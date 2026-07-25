import { PageHeader } from '../../components/ui'
import { Scale, CreditCard, FileText, AlertTriangle, Phone } from 'lucide-react'

const LICENSES = [
  ["Learner's License", 'Permits supervised driving practice — you must be accompanied by a licensed driver.'],
  ["Driver's License", 'Full authorization to operate motor vehicles within Zion City.'],
  ['Firearm License', 'Required to legally purchase, possess and carry a firearm. Verified during any firearm-related stop.'],
  ['Residential ID', 'Proof of Zion City residency, required for certain city services.'],
  ['Press / News ID', 'For accredited media — grants access rights at public events and briefings.'],
]

const REPORTS = [
  ['Report a crime', 'For emergencies call 911. For non-urgent matters, contact the station front desk or a patrol officer.'],
  ['Request a police record', 'Records and incident reports can be requested through the station. Bring valid ID.'],
  ['File a complaint', 'Complaints about an officer are taken seriously and reviewed by command staff. Note the officer\'s badge number if possible.'],
  ['Recover impounded property', 'Vehicles or items seized as evidence can be reclaimed once released — contact the evidence desk.'],
]

export default function ServicesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Scale} title="Citizen Services" sub="Licenses, reports and how the ZCPD can help you" />

      {/* Emergency strip */}
      <div className="card p-4 mb-6 flex items-center gap-4 bg-red-900/10 border-red-700/30">
        <Phone className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-g-text">In an emergency, always call 911</p>
          <p className="text-xs text-g-muted">For life-threatening situations, crimes in progress, or immediate danger.</p>
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
