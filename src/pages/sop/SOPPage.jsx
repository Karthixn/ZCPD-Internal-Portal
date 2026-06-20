import { useState } from 'react'
import { BookOpen, ExternalLink, ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/ui'

const SOP = [
  { cat:'Department', items:[
    { label:'About ZCPD',            url:'https://zcpd.gitbook.io/zcpd-sop/z.c.p.d' },
    { label:'Rank structure',         url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-rank-structure' },
    { label:'Promotion criteria',     url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-promotion-criteria' },
    { label:'Decorum',                url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-decorum' },
    { label:'Uniform & equipment',    url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-uniform-and-equipment' },
    { label:'Badge number system',    url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-badge-number-system' },
    { label:'Communication protocol', url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-communication-protocol' },
  ]},
  { cat:'Guidelines', items:[
    { label:'G-1: Citizen rights',       url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-1-citizen-rights' },
    { label:'G-2: Reasonable suspicion', url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-2-reasonable-suspicion-and-probable-cause' },
    { label:'G-3: Use of force',         url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-3-use-of-force-and-escalation' },
    { label:'G-4: Felony & misdemeanor', url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-4-felony-and-misdemeanor-crimes' },
    { label:'G-5: Undercover ops',       url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-5-undercover-operations-and-unmarked-vehicles' },
    { label:'G-6: Redzone declaration',  url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-6-redzone-declaration-and-control' },
    { label:'G-7: Warrant execution',    url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-7-warrant-execution' },
    { label:'G-8: BOLO eligibility',     url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-guidelines/g-8-bolo-eligibility-and-execution' },
  ]},
  { cat:'Protocols', items:[
    { label:'Patrolling',         url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-patrolling-protocol' },
    { label:'Traffic stop',       url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-traffic-stop-protocol' },
    { label:'Pursuit',            url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-pursuit-protocol' },
    { label:'PIT maneuvering',    url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/pit-maneuvering-protocol' },
    { label:'Arrest',             url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-arrest-protocol' },
    { label:'Evidence securing',  url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-evidence-securing-protocol-photo-and-forensic-evidence' },
    { label:'Firearm engagement', url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-firearm-engagement-protocol' },
    { label:'Crowd control',      url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-crowd-control-protocol' },
    { label:'Hostage handling',   url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-hostage-handling-protocol' },
    { label:'Code 99 response',   url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-shots-fired-code-99-response-protocol' },
    { label:'Licensing & ID',     url:'https://zcpd.gitbook.io/zcpd-sop/zcpd-protocols/zcpd-licensing-and-identification-protocols' },
  ]},
]

export default function SOPPage() {
  const [active, setActive] = useState(null)

  return (
    <div className="max-w-7xl mx-auto flex flex-col" style={{ height:'calc(100vh - 5rem)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-a-500/15 border border-a-500/25 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-a-400"/>
          </div>
          <div><h1 className="page-title">SOP Library</h1><p className="text-sm text-g-muted mt-0.5">Standard Operating Procedures</p></div>
        </div>
        <a href="https://zcpd.gitbook.io/zcpd-sop" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-g-muted hover:text-a-400 transition-colors">
          Open in GitBook<ExternalLink className="w-3 h-3"/>
        </a>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-60 shrink-0 card p-3 overflow-y-auto space-y-4">
          {SOP.map(s => (
            <div key={s.cat}>
              <p className="text-[10px] font-bold text-g-muted uppercase tracking-wider px-2 mb-1.5">{s.cat}</p>
              {s.items.map(item => (
                <button key={item.url} onClick={()=>setActive(item.url)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors
                    ${active===item.url?'bg-a-500/15 text-a-400':'text-g-sub hover:text-g-text hover:bg-white/5'}`}>
                  <span>{item.label}</span>
                  <ChevronRight className="w-3 h-3 opacity-40 shrink-0"/>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card overflow-hidden">
          {active
            ? <iframe key={active} src={active} className="w-full h-full border-0 rounded-xl" title="SOP"/>
            : <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-a-500/10 border border-a-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-a-400"/>
                </div>
                <h2 className="text-base font-semibold text-g-text mb-2">Select a document</h2>
                <p className="text-sm text-g-muted max-w-xs">Choose a section from the left to read the official ZCPD Standard Operating Procedures.</p>
              </div>
          }
        </div>
      </div>
    </div>
  )
}
