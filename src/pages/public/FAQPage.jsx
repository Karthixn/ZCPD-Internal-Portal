import { HelpCircle, ChevronDown } from 'lucide-react'
import { PageHeader } from '../../components/ui'

const FAQ = [
  ['What should I do during a traffic stop?',
   'Pull over safely, stay in your vehicle, keep your hands visible, and follow the officer\'s instructions. You have the right to know why you were stopped. Have your license ready if asked.'],
  ['What are my rights if I\'m detained or arrested?',
   'You have the right to remain silent and the right to an attorney. Officers must have reasonable suspicion to detain you and probable cause to arrest you. Stay calm and do not resist — disputes are settled in court, not on the street.'],
  ['How do I report a crime?',
   'For emergencies or crimes in progress, call 911. For non-urgent issues, contact the station or flag down a patrol officer. Provide as much detail as you can: location, descriptions and time.'],
  ['How do I file a complaint against an officer?',
   'Complaints are reviewed by command staff. Note the officer\'s badge number, the date, time and location, and what happened, then submit it through the station. All complaints are taken seriously.'],
  ['Can the police search me or my vehicle?',
   'Generally only with your consent, a warrant, or probable cause. Contraband in plain view may be seized. You may decline a consent search — declining is not itself grounds for a search.'],
  ['How do I get a firearm or driver\'s license?',
   'Licenses are issued through the appropriate city process. See the Citizen Services page for the types of licenses and what each allows.'],
  ['How can I join the ZCPD?',
   'Visit the Join ZCPD page for requirements and the recruitment process. No prior experience is needed — full training is provided.'],
]

export default function FAQPage() {
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
