import { useState } from 'react'
import { BookOpen, ChevronRight, Shield, Users, Award, Star, Radio, Scale, Search, Crosshair, AlertTriangle, Eye, MapPin, FileText, Car, Siren, Target, Handshake, Lock, Megaphone, UserCheck, BadgeCheck } from 'lucide-react'

/* ─── SOP Content Sections ─── */

const SOP_CONTENT = {
  /* ══ DEPARTMENT ══ */
  'about-zcpd': {
    title: 'About ZCPD',
    cat: 'Department',
    render: () => (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Mission Statement</h3>
          <blockquote className="border-l-2 border-a-500/40 pl-4 italic text-g-sub text-sm">
            The Zion City Police Department is committed to upholding law and order, protecting the citizens of Zion City, and maintaining public trust through professionalism, integrity, and community-centered policing.
          </blockquote>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-3">Core Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Integrity','Upholding honesty, ethical behavior, and transparency in all duties.'],
              ['Service','Dedicating ourselves to the safety and well-being of the community.'],
              ['Courage','Acting decisively and bravely in the face of danger or adversity.'],
              ['Professionalism','Maintaining high standards of conduct, appearance, and competence.'],
              ['Collaboration','Working together with fellow officers and the community to achieve shared goals.'],
            ].map(([v,d])=>(
              <div key={v} className="bg-n-800 border border-n-600 rounded-lg p-3">
                <p className="text-sm font-semibold text-a-400 mb-1">{v}</p>
                <p className="text-xs text-g-sub">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Authority & Jurisdiction</h3>
          <p className="text-sm text-g-sub">ZCPD holds full law enforcement authority within the boundaries of Zion City. Officers are empowered to enforce all municipal, state, and applicable federal laws. Jurisdiction extends to all public and private spaces within city limits, with mutual aid agreements in place for surrounding jurisdictions.</p>
        </div>
      </div>
    )
  },

  'rank-structure': {
    title: 'Rank Structure',
    cat: 'Department',
    render: () => (
      <div className="space-y-6">
        {[
          { tier:'Entry-Level', ranks:[
            { name:'Probationary Officer (PO)', role:'New recruits undergoing field training and evaluation.', reports:'Field Training Officer (FTO) / Constable', powers:'Limited enforcement under FTO supervision; cannot operate independently.' },
            { name:'Constable', role:'Standard patrol officer responsible for day-to-day law enforcement.', reports:'Head Constable / ASI', powers:'Full patrol authority, traffic enforcement, arrest powers, report filing.' },
            { name:'Head Constable', role:'Senior patrol officer who mentors junior officers and leads small teams.', reports:'ASI / SI', powers:'All Constable powers plus authority to lead patrol teams and approve basic reports.' },
          ]},
          { tier:'Senior Officers', ranks:[
            { name:'Assistant Sub-Inspector (ASI)', role:'Assists in investigations and supervises constables during shifts.', reports:'Sub-Inspector (SI)', powers:'Investigation assistance, shift supervision, evidence handling authority.' },
            { name:'Sub-Inspector (SI)', role:'Leads investigations, manages field operations, and supervises patrol units.', reports:'Circle Inspector (CI)', powers:'Full investigative authority, warrant requests, tactical decision-making.' },
          ]},
          { tier:'Operational Command', ranks:[
            { name:'Circle Inspector (CI)', role:'Commands a police circle/station and oversees all operations in assigned area.', reports:'DYSP', powers:'Station command authority, resource allocation, operational planning.' },
            { name:'Deputy Superintendent of Police (DYSP)', role:'Oversees multiple circles/stations and coordinates district-level operations.', reports:'SP', powers:'Multi-station oversight, inter-agency coordination, policy implementation.' },
            { name:'Superintendent of Police (SP)', role:'Commands district-level policing and strategic operations.', reports:'DIG', powers:'District command, strategic planning, media liaison, major case oversight.' },
          ]},
          { tier:'Senior Command', ranks:[
            { name:'Deputy Inspector General (DIG)', role:'Oversees multiple districts and coordinates regional operations.', reports:'IG', powers:'Regional oversight, inter-district coordination, policy development.' },
            { name:'Inspector General (IG)', role:'Commands a zone or range comprising several districts.', reports:'Commissioner / ADGP', powers:'Zonal command, strategic policy, disciplinary authority over subordinate ranks.' },
            { name:'Commissioner', role:'Heads ZCPD operations in commissioner-system jurisdictions.', reports:'ADGP / DGP', powers:'Full operational command, executive decisions, external agency liaison.' },
          ]},
          { tier:'Executive Command', ranks:[
            { name:'Additional Director General of Police (ADGP)', role:'Assists the DGP in specialized portfolios (law & order, crime, administration).', reports:'DGP', powers:'Portfolio-level authority, specialized operations command.' },
            { name:'Director General of Police (DGP)', role:'Top police officer of the state/department.', reports:'Chief of ZCPD', powers:'Departmental policy, statewide coordination, final disciplinary authority.' },
            { name:'Chief of ZCPD', role:'Supreme authority of the Zion City Police Department.', reports:'Government / Civilian Oversight', powers:'All powers; final authority on all ZCPD matters.' },
          ]},
        ].map(t=>(
          <div key={t.tier}>
            <h3 className="text-base font-semibold text-g-text mb-3">{t.tier}</h3>
            <div className="space-y-3">
              {t.ranks.map(r=>(
                <div key={r.name} className="bg-n-800 border border-n-600 rounded-lg p-4">
                  <p className="text-sm font-semibold text-a-400 mb-2">{r.name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-g-muted font-semibold">Primary Role:</span> <span className="text-g-sub">{r.role}</span></div>
                    <div><span className="text-g-muted font-semibold">Reporting To:</span> <span className="text-g-sub">{r.reports}</span></div>
                    <div><span className="text-g-muted font-semibold">Powers & Authority:</span> <span className="text-g-sub">{r.powers}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },

  'promotion-criteria': {
    title: 'Promotion Criteria',
    cat: 'Department',
    render: () => (
      <div className="space-y-4">
        <p className="text-sm text-g-sub">All promotions are merit-based and require meeting minimum service duration and duty hour thresholds.</p>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>From Rank</th><th>To Rank</th><th>Minimum Duration</th><th>Required Hours</th></tr></thead>
            <tbody>
              {[
                ['Constable / Probationary Officer','Head Constable','2 months','60 hours'],
                ['Head Constable','ASI','3 months','150 hours'],
                ['ASI','SI','3 months','150 hours'],
                ['SI','CI','3 months','180 hours'],
                ['CI','DYSP','3 months','200 hours'],
                ['DYSP','SP','4 months','250 hours'],
                ['SP','DIG','4 months','250 hours'],
                ['DIG','IG','4 months','280 hours'],
              ].map(([f,t,d,h])=>(
                <tr key={f}><td className="text-g-sub text-sm">{f}</td><td className="text-g-text text-sm font-medium">{t}</td><td className="text-g-sub text-sm">{d}</td><td className="text-g-sub text-sm">{h}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <blockquote className="border-l-2 border-a-500/40 pl-4 italic text-g-muted text-xs">
          Executive promotions beyond IG are granted by the Commissioner only, based on departmental need and exceptional service.
        </blockquote>
      </div>
    )
  },

  'decorum': {
    title: 'Decorum',
    cat: 'Department',
    render: () => (
      <div className="space-y-4">
        {[
          ['Professional Conduct','All officers must conduct themselves with professionalism at all times, both on and off duty. Behavior that brings discredit to the department is subject to disciplinary action.'],
          ['Truthfulness','Officers are required to be truthful in all official communications, reports, and testimony. Falsification of any official document or statement is grounds for termination.'],
          ['Responsibility','Officers are personally responsible for their actions and decisions. Each officer must be prepared to justify their conduct and accept accountability.'],
          ['Prohibition of Misuse of Authority','Officers shall not use their position, badge, or authority for personal gain, intimidation, or any purpose outside the scope of their duties.'],
          ['Confidentiality','All case-related information, internal communications, and departmental matters must be kept confidential. Unauthorized disclosure of sensitive information is a serious violation.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'uniform-equipment': {
    title: 'Uniform & Equipment',
    cat: 'Department',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Uniform Standards</h3>
          <p className="text-sm text-g-sub">All officers must wear the department-issued uniform while on duty. Uniforms must be clean, pressed, and in good repair. Badges and name tags must be visible at all times. Modifications to the uniform are not permitted without authorization from a supervisor.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-3">Required Equipment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['Firearm (department-issued)','Baton','Handcuffs','Radio','Body Armor','Flashlight','Aspirin Patch'].map(e=>(
              <div key={e} className="bg-n-800 border border-n-600 rounded-lg px-3 py-2 text-xs text-g-sub">{e}</div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Maintenance</h3>
          <p className="text-sm text-g-sub">Officers are responsible for the maintenance and care of all issued equipment. Malfunctioning or damaged equipment must be reported to the quartermaster immediately. Firearms must be inspected and cleaned regularly. Lost or stolen equipment must be reported to a supervisor without delay.</p>
        </div>
      </div>
    )
  },

  'badge-number': {
    title: 'Badge Number System',
    cat: 'Department',
    render: () => (
      <div className="space-y-4">
        <p className="text-sm text-g-sub">Each officer is assigned a unique badge number consisting of a rank prefix followed by a 3-digit number.</p>
        <div className="bg-n-800 border border-n-600 rounded-lg p-4">
          <p className="text-sm text-g-text font-semibold mb-2">Format</p>
          <p className="text-a-400 font-mono text-lg mb-2">RANK-XXX</p>
          <p className="text-xs text-g-sub">Example: <span className="text-a-400 font-mono">LT-601</span></p>
        </div>
        <p className="text-sm text-g-sub">Badge numbers are permanent for the duration of each rank. Upon promotion, officers receive a new badge number with the updated rank prefix. Officers must display their badge number at all times while on duty and must state it during radio communications.</p>
      </div>
    )
  },

  'communication-protocol': {
    title: 'Communication Protocol',
    cat: 'Department',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Radio Procedures</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-g-sub">
            <li>Use official radio codes at all times.</li>
            <li>State your badge number at the beginning of each transmission.</li>
            <li>Keep transmissions brief and clear.</li>
            <li>Wait for the channel to be clear before transmitting.</li>
            <li>Acknowledge all dispatches promptly.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Professional Conduct on Radio</h3>
          <p className="text-sm text-g-sub">Radio channels are official communication lines. Personal conversations, profanity, and non-essential chatter are prohibited. All radio communications may be recorded and reviewed.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Emergency Handling</h3>
          <p className="text-sm text-g-sub">In emergency situations, officers may break standard radio protocol to relay urgent information. Use the emergency prefix before your badge number to indicate priority traffic. All non-essential communications must cease until the emergency is resolved.</p>
        </div>
      </div>
    )
  },

  /* ══ GUIDELINES ══ */
  'g1-citizen-rights': {
    title: 'G-1: Citizen Rights',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <p className="text-sm text-g-sub">Officers must respect and protect the fundamental rights of all citizens at all times.</p>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-3">Citizen Rights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Freedom of Movement','Citizens may travel freely within Zion City without undue interference.'],
              ['Right to Privacy','Citizens are protected from unreasonable searches and seizures.'],
              ['Right to Property','Citizens\' property may not be seized or damaged without legal justification.'],
              ['Right to Safety & Dignity','Citizens must be treated with respect and protected from harm.'],
              ['Freedom of Speech','Citizens may express their views freely, subject to lawful restrictions.'],
              ['Right to Bear Arms','Licensed citizens may carry firearms in accordance with city regulations.'],
            ].map(([r,d])=>(
              <div key={r} className="bg-n-800 border border-n-600 rounded-lg p-3">
                <p className="text-sm font-semibold text-a-400 mb-1">{r}</p>
                <p className="text-xs text-g-sub">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Decision Framework</h3>
          <p className="text-sm text-g-sub mb-2">Before taking any action that may affect a citizen's rights, officers must ensure the action is:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Lawful','Necessary','Proportionate','Defensible'].map(d=>(
              <div key={d} className="bg-a-500/10 border border-a-500/20 rounded-lg px-3 py-2 text-center text-sm font-semibold text-a-400">{d}</div>
            ))}
          </div>
        </div>
      </div>
    )
  },

  'g2-reasonable-suspicion': {
    title: 'G-2: Reasonable Suspicion & Probable Cause',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-n-800 border border-n-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-a-400 mb-2">Reasonable Suspicion</h3>
            <p className="text-xs text-g-sub mb-2">A belief based on specific, articulable facts that a person is, has been, or is about to be engaged in criminal activity.</p>
            <p className="text-xs text-g-muted font-semibold mb-1">Examples:</p>
            <ul className="list-disc list-inside text-xs text-g-sub space-y-0.5">
              <li>Person matching suspect description in the area of a recent crime</li>
              <li>Individual seen fleeing from a crime scene</li>
              <li>Erratic driving behavior suggesting impairment</li>
            </ul>
            <p className="text-xs text-g-muted font-semibold mt-2 mb-1">Allowed Actions:</p>
            <ul className="list-disc list-inside text-xs text-g-sub space-y-0.5">
              <li>Brief investigatory stop (Terry Stop)</li>
              <li>Pat-down for weapons (if safety concern exists)</li>
              <li>Questioning</li>
            </ul>
          </div>
          <div className="bg-n-800 border border-n-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-a-400 mb-2">Probable Cause</h3>
            <p className="text-xs text-g-sub mb-2">A reasonable belief, based on facts and circumstances, that a crime has been, is being, or will be committed by a specific person.</p>
            <p className="text-xs text-g-muted font-semibold mb-1">Examples:</p>
            <ul className="list-disc list-inside text-xs text-g-sub space-y-0.5">
              <li>Witness identification of a suspect</li>
              <li>Contraband or evidence in plain view</li>
              <li>Positive field test on suspected narcotics</li>
            </ul>
            <p className="text-xs text-g-muted font-semibold mt-2 mb-1">Allowed Actions:</p>
            <ul className="list-disc list-inside text-xs text-g-sub space-y-0.5">
              <li>Arrest</li>
              <li>Search of person and immediate area</li>
              <li>Vehicle search</li>
              <li>Warrant application</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },

  'g3-use-of-force': {
    title: 'G-3: Use of Force & Escalation',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <p className="text-sm text-g-sub">Officers must use only the minimum force necessary to control a situation. Force must be proportional to the threat encountered.</p>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-3">Escalation Steps</h3>
          <div className="space-y-2">
            {[
              ['1. Officer Presence','The mere presence of a uniformed officer is often enough to deter criminal activity or calm a situation.'],
              ['2. Verbal Commands','Clear, calm, and authoritative verbal directions to gain compliance.'],
              ['3. Physical Control','Hands-on techniques such as joint locks, takedowns, or restraints to control a non-compliant subject.'],
              ['4. Defensive Force','Use of less-lethal tools (baton, taser) when a subject poses a physical threat.'],
              ['5. Lethal Force','Use of a firearm or other deadly force. Authorized ONLY when there is an immediate threat of death or serious bodily harm to the officer or others.'],
            ].map(([s,d],i)=>(
              <div key={s} className={`border rounded-lg p-3 ${i===4?'bg-red-900/10 border-red-700/30':'bg-n-800 border-n-600'}`}>
                <p className={`text-sm font-semibold mb-1 ${i===4?'text-red-400':'text-g-text'}`}>{s}</p>
                <p className="text-xs text-g-sub">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">De-escalation Standards</h3>
          <p className="text-sm text-g-sub">Officers must always attempt to de-escalate before escalating force. This includes creating distance, using time as a tool, calling for backup, and communicating calmly. De-escalation should be the default approach in all non-life-threatening situations.</p>
        </div>
      </div>
    )
  },

  'g4-felony-misdemeanor': {
    title: 'G-4: Felony & Misdemeanor',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-n-800 border border-n-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-2">Felonies</h3>
            <ul className="list-disc list-inside text-xs text-g-sub space-y-1">
              <li>Murder / Attempted Murder</li>
              <li>Armed Robbery</li>
              <li>Kidnapping</li>
              <li>Aggravated Assault</li>
              <li>Drug Trafficking</li>
              <li>Grand Theft Auto</li>
              <li>Arson</li>
              <li>Weapons Trafficking</li>
              <li>Assault on a Law Enforcement Officer</li>
            </ul>
          </div>
          <div className="bg-n-800 border border-n-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">Misdemeanors</h3>
            <ul className="list-disc list-inside text-xs text-g-sub space-y-1">
              <li>Petty Theft</li>
              <li>Vandalism</li>
              <li>Disorderly Conduct</li>
              <li>Trespassing</li>
              <li>Simple Assault</li>
              <li>Public Intoxication</li>
              <li>Traffic Violations</li>
              <li>Possession of Small Amounts of Contraband</li>
            </ul>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Encounter Guidelines</h3>
          <p className="text-sm text-g-sub mb-2"><strong className="text-g-text">Priority of Life:</strong> Officer safety and civilian safety always come first. Never pursue a misdemeanor suspect in a manner that endangers life.</p>
          <p className="text-sm text-g-sub"><strong className="text-g-text">Misdemeanor Handling:</strong> For minor offenses, officers should prioritize citation over arrest when appropriate. Use discretion and consider the totality of circumstances.</p>
        </div>
      </div>
    )
  },

  'g5-undercover-ops': {
    title: 'G-5: Undercover Operations',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Unmarked Vehicle Policy</h3>
          <ul className="list-disc list-inside text-sm text-g-sub space-y-1">
            <li>Unmarked vehicles may only be deployed when at least <strong className="text-g-text">5 active units</strong> are on patrol.</li>
            <li>Unmarked units are restricted to <strong className="text-g-text">information gathering only</strong> -- no direct enforcement action.</li>
            <li>Unmarked units must have authorization from a supervisor before deployment.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Operational Conduct</h3>
          <ul className="list-disc list-inside text-sm text-g-sub space-y-1">
            <li><strong className="text-g-text">No direct engagement</strong> with suspects unless officer safety is at immediate risk.</li>
            <li>Officers in civilian clothing must carry concealed identification and badge at all times.</li>
            <li>Undercover officers must maintain radio contact with dispatch and a designated handler.</li>
            <li>All intelligence gathered must be documented and submitted within 24 hours.</li>
          </ul>
        </div>
      </div>
    )
  },

  'g6-redzone': {
    title: 'G-6: Redzone Declaration',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Declaration Authority</h3>
          <p className="text-sm text-g-sub">A Redzone may only be declared by an officer holding the rank of <strong className="text-g-text">Sergeant or above</strong>. The declaration must specify the boundaries of the zone and the reason for its activation.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Access Control</h3>
          <p className="text-sm text-g-sub">Once declared, access to the Redzone is restricted to authorized personnel only. Civilians must be evacuated or prevented from entering. A perimeter must be established and maintained by assigned officers.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Firearm Rules</h3>
          <p className="text-sm text-g-sub">Within a declared Redzone, officers may have weapons drawn and ready. Standard rules of engagement still apply -- lethal force is authorized only when there is an immediate threat to life. All firearm discharges within a Redzone must be reported and documented.</p>
        </div>
      </div>
    )
  },

  'g7-warrant': {
    title: 'G-7: Warrant Execution',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Validity</h3>
          <p className="text-sm text-g-sub">All warrants are valid for <strong className="text-g-text">2 days (48 hours)</strong> from the time of issuance. Expired warrants must be reissued before execution.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Identification Procedure</h3>
          <ul className="list-disc list-inside text-sm text-g-sub space-y-1">
            <li>Officers must positively identify the subject of the warrant before execution.</li>
            <li>Present the warrant to the subject and allow them to read it.</li>
            <li>Clearly state the reason for the warrant and the charges involved.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Handling Associates</h3>
          <p className="text-sm text-g-sub">Individuals present at the scene who are not named in the warrant may be detained temporarily if there is reasonable suspicion of involvement. Associates cannot be arrested solely based on their presence -- additional probable cause is required.</p>
        </div>
      </div>
    )
  },

  'g8-bolo': {
    title: 'G-8: BOLO',
    cat: 'Guidelines',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Eligibility Conditions</h3>
          <p className="text-sm text-g-sub mb-2">A BOLO (Be On the Look Out) may be issued when:</p>
          <ul className="list-disc list-inside text-sm text-g-sub space-y-1">
            <li>A suspect has fled the scene of a serious crime.</li>
            <li>A vehicle used in a felony has been identified.</li>
            <li>A missing person or endangered individual needs to be located.</li>
            <li>A known dangerous individual is believed to be in the area.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Execution Procedure</h3>
          <div className="space-y-2">
            {[
              ['1. Verify','Confirm the information is accurate and current before issuing.'],
              ['2. Authorize','Obtain authorization from a supervisor (SI or above).'],
              ['3. Notify','Broadcast the BOLO on all active channels with full description.'],
              ['4. Engage','Upon locating the subject, follow appropriate protocols (arrest, surveillance, etc.).'],
            ].map(([s,d])=>(
              <div key={s} className="bg-n-800 border border-n-600 rounded-lg p-3">
                <p className="text-sm font-semibold text-a-400">{s}</p>
                <p className="text-xs text-g-sub">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },

  /* ══ PROTOCOLS ══ */
  'patrolling': {
    title: 'Patrolling',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-4">
        {[
          ['Unit Assignment','Each patrol unit is identified by the officer\'s badge number, which serves as their call-sign during operations.'],
          ['Area Assignment','Officers are assigned to specific patrol zones at the beginning of each shift. Zone assignments are made by the shift supervisor based on staffing and crime data.'],
          ['Call Response','Officers must respond to dispatched calls promptly. Priority calls take precedence. Officers must acknowledge receipt of dispatch and provide status updates.'],
          ['Status Reporting','Officers must report their status (available, en route, on scene, etc.) to dispatch regularly. Status changes must be communicated immediately.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'traffic-stop': {
    title: 'Traffic Stop',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-4">
        {[
          ['Reason for Stop','Officers must have a valid reason (observed violation, equipment defect, BOLO match) before initiating a traffic stop. The reason must be communicated to the driver.'],
          ['Approach','Activate emergency lights and pull over the vehicle in a safe location. Approach the vehicle cautiously from the driver\'s side. Maintain awareness of all occupants.'],
          ['Handling Violations','Issue citations for observed violations. Explain the violation clearly. Provide the driver with their options (court date, fine payment). Remain professional throughout.'],
          ['Search Conditions','A vehicle may only be searched with consent, probable cause, or a warrant. Plain-view contraband may be seized immediately. Refusal of consent does not constitute probable cause.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'pursuit': {
    title: 'Pursuit',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Initiation Criteria</h3>
          <p className="text-sm text-g-sub">A pursuit may only be initiated when a suspect fails to yield and is believed to have committed a felony, or when the suspect poses an immediate threat to public safety. The decision to pursue must weigh the danger of the pursuit against the danger of allowing the suspect to flee.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-3">Roles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['Primary Unit','Initiates and leads the pursuit. Provides continuous updates on location, speed, and direction.'],
              ['Secondary Unit','Follows at a safe distance as backup. Takes over if the primary unit is disabled or must disengage.'],
              ['Tertiary Unit','Positions ahead of the pursuit to deploy stop sticks or assist with containment. Does not actively chase.'],
            ].map(([r,d])=>(
              <div key={r} className="bg-n-800 border border-n-600 rounded-lg p-3">
                <p className="text-sm font-semibold text-a-400 mb-1">{r}</p>
                <p className="text-xs text-g-sub">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Rules & Communication</h3>
          <ul className="list-disc list-inside text-sm text-g-sub space-y-1">
            <li>No more than 3 units may actively engage in a pursuit unless authorized by a supervisor.</li>
            <li>Pursuits must be terminated if conditions become too dangerous for officers or civilians.</li>
            <li>The primary unit must provide continuous radio updates including location, speed, direction, and traffic conditions.</li>
            <li>A supervisor may order termination of a pursuit at any time.</li>
          </ul>
        </div>
      </div>
    )
  },

  'pit-maneuver': {
    title: 'PIT Maneuvering',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-4">
        {[
          ['Authorization','PIT maneuvers require explicit authorization from a supervisor (CI or above). Unauthorized PIT attempts are a serious policy violation.'],
          ['Safety Precautions','PIT maneuvers should only be attempted at speeds below 40 mph. The area must be clear of civilian vehicles and pedestrians. The officer must be trained and certified in PIT technique.'],
          ['Execution Steps','Position behind and slightly offset from the suspect vehicle. Apply contact to the rear quarter panel. Steer into the suspect vehicle to induce a spin. Maintain control of your own vehicle throughout.'],
          ['Restrictions','PIT maneuvers may NOT be used on motorcycles, vehicles with known passengers (children, elderly), or on bridges, overpasses, or near drop-offs. If conditions are unsafe, the PIT must be aborted.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'arrest': {
    title: 'Arrest',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-4">
        {[
          ['Probable Cause','An arrest requires probable cause -- a reasonable belief based on facts that the individual has committed a crime. Officers must be able to articulate the basis for probable cause.'],
          ['Approach & Detainment','Approach the suspect cautiously. Clearly identify yourself as a police officer. Inform the suspect they are under arrest and state the charges.'],
          ['Miranda Rights','Upon arrest, officers must read the suspect their Miranda rights before any interrogation: the right to remain silent, that statements may be used against them, the right to an attorney, and that one will be appointed if they cannot afford one.'],
          ['Search & Seizure','A search incident to arrest is permitted for officer safety and evidence preservation. Search the suspect\'s person and immediate area. Document all items seized.'],
          ['Transport','Secure the suspect in the patrol vehicle. Ensure seatbelt is fastened. Transport directly to the station for processing. Do not make unnecessary stops.'],
          ['Processing','Complete all required paperwork including arrest report, evidence logs, and booking forms. Ensure the suspect\'s personal belongings are inventoried and secured.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'evidence-securing': {
    title: 'Evidence Securing',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Photo Evidence</h3>
          <p className="text-sm text-g-sub">Photo evidence is <strong className="text-g-text">required for all incidents</strong> except Code 99 situations (where officer safety takes absolute priority). Documentation must begin as soon as the scene is secure.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-3">Requirements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['Suspects','Photograph all detained suspects, including visible injuries, clothing, and identifying features.'],
              ['Plates & Vehicles','Photograph license plates, vehicle damage, and any distinguishing marks on involved vehicles.'],
              ['Scene','Document the overall scene, evidence locations, and environmental conditions.'],
            ].map(([t,d])=>(
              <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-3">
                <p className="text-sm font-semibold text-a-400 mb-1">{t}</p>
                <p className="text-xs text-g-sub">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Ballistic Evidence</h3>
          <p className="text-sm text-g-sub">All spent casings, bullet fragments, and firearm-related evidence must be collected and logged. Chain of custody must be maintained from collection through processing.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Linking to Incident</h3>
          <p className="text-sm text-g-sub">All evidence must be tagged with the incident number, date, time, location, and collecting officer's badge number. Evidence must be submitted to the evidence locker before end of shift.</p>
        </div>
      </div>
    )
  },

  'firearm-engagement': {
    title: 'Firearm Engagement',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-5">
        <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Conditions for Use</h3>
          <p className="text-sm text-g-sub">Firearms may only be discharged when there is an <strong className="text-g-text">immediate threat of death or serious bodily harm</strong> to the officer or another person. Warning shots are prohibited.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Rules of Engagement</h3>
          <ul className="list-disc list-inside text-sm text-g-sub space-y-1">
            <li>Positively identify the threat before engaging.</li>
            <li>Be aware of your backdrop -- know what is behind the target.</li>
            <li>Fire only the number of rounds necessary to stop the threat.</li>
            <li>Cease fire immediately when the threat is neutralized.</li>
            <li>Render first aid to any injured person once the scene is secure.</li>
            <li>Preserve the scene and report the discharge immediately.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Special Circumstances During Pursuits</h3>
          <p className="text-sm text-g-sub">Firing at or from a moving vehicle is generally prohibited unless the vehicle is being used as a deadly weapon and there is no other reasonable means to stop the threat. Officers must consider the risk to bystanders and other officers before engaging.</p>
        </div>
      </div>
    )
  },

  'crowd-control': {
    title: 'Crowd Control',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-4">
        {[
          ['Assessment','Evaluate the size, mood, and intent of the crowd. Determine if the gathering is lawful or unlawful. Identify potential agitators or threats.'],
          ['Engagement Procedure','Establish a visible police presence. Assign officers to key positions around the perimeter. Maintain communication with all units.'],
          ['Warnings','Before taking dispersal action, issue clear and repeated warnings. Use a public address system when available. Allow reasonable time for compliance.'],
          ['Dispersal','If the crowd fails to disperse after warnings, use minimum force necessary. Deploy officers in formation. Use designated routes for crowd movement.'],
          ['Adaptability','Monitor the situation continuously. Be prepared to adjust tactics as conditions change. De-escalate when possible. Document all actions taken.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'hostage-handling': {
    title: 'Hostage Handling',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-4">
        {[
          ['Initial Response','Secure the perimeter immediately. Establish inner and outer cordons. Evacuate civilians from the danger zone. Do NOT attempt to enter without authorization.'],
          ['Backup Coordination','Request specialized units (SWAT, negotiators) immediately. Brief arriving units on the situation. Establish a command post outside the danger zone.'],
          ['Negotiation','A trained negotiator must lead all communication with the suspect. Maintain a calm, professional tone. The goal is peaceful resolution -- buy time when possible. Never make promises you cannot keep.'],
          ['Tactical Entry','Tactical entry is authorized only when: negotiations have failed, hostages are in immediate danger, or the suspect begins harming hostages. Entry must be led by trained tactical units.'],
          ['Evacuation','Once hostages are released or rescued, escort them to a safe staging area. Provide immediate medical attention. Separate hostages for individual debriefing.'],
          ['Pursuit of Fleeing Suspects','If a suspect flees, do not abandon hostage security. Assign pursuit to designated units while maintaining the secure perimeter until all hostages are accounted for.'],
          ['Documentation','Document all actions, communications, and decisions throughout the incident. Preserve all evidence. Complete an after-action report within 48 hours.'],
        ].map(([t,d])=>(
          <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-g-text mb-1">{t}</p>
            <p className="text-xs text-g-sub">{d}</p>
          </div>
        ))}
      </div>
    )
  },

  'code-99': {
    title: 'Code 99 Response',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-5">
        <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-4">
          <p className="text-sm text-g-sub"><strong className="text-red-400">Code 99</strong> indicates shots fired. This is the highest-priority response protocol.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Primary Unit Response</h3>
          <p className="text-sm text-g-sub">The nearest available unit must respond immediately. Upon arrival, prioritize cover and concealment. Assess the situation before engaging. Report the number of suspects, their location, and type of weapons observed.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Engagement Protocol</h3>
          <p className="text-sm text-g-sub">Engage only if there is an active and immediate threat to life. Use cover effectively. Coordinate with backup units before advancing. Follow standard firearm engagement rules.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Multiple Suspects</h3>
          <p className="text-sm text-g-sub">If multiple armed suspects are present, do NOT engage alone. Wait for backup. Establish containment and request additional resources including tactical units.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">Evidence Handling</h3>
          <p className="text-sm text-g-sub">In Code 99 situations, officer safety takes priority over evidence collection. Once the scene is secure, standard evidence protocols apply. Photo evidence requirements are waived during the active engagement phase.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-g-text mb-2">ZIMS Communication</h3>
          <p className="text-sm text-g-sub">All Code 99 incidents must be reported through ZIMS (Zephyr Incident Management System) as soon as practicable. Include all relevant details: time, location, officers involved, shots fired, injuries, and outcome.</p>
        </div>
      </div>
    )
  },

  'licensing-id': {
    title: 'Licensing & ID',
    cat: 'Protocols',
    render: () => (
      <div className="space-y-5">
        <p className="text-sm text-g-sub">Officers must be familiar with all license and identification types issued within Zion City.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Learner\'s License','Permits supervised driving practice. Holder must be accompanied by a licensed driver at all times.'],
            ['Driver\'s License','Full authorization to operate motor vehicles within Zion City. Must be valid and current.'],
            ['Residential ID','Proof of Zion City residency. Required for certain city services and interactions.'],
            ['Firearm License','Authorization to purchase, possess, and carry firearms. Must be verified during any firearm-related interaction.'],
            ['Lawyer ID','Professional identification for licensed attorneys. Holders have specific rights during legal proceedings and client interactions.'],
            ['ZIMS ID','Identification for Zephyr Incident Management System operators and authorized personnel.'],
            ['News / Press ID','Identification for accredited media personnel. Holders have certain access rights at public events and press briefings.'],
          ].map(([t,d])=>(
            <div key={t} className="bg-n-800 border border-n-600 rounded-lg p-3">
              <p className="text-sm font-semibold text-a-400 mb-1">{t}</p>
              <p className="text-xs text-g-sub">{d}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/* ─── Sidebar Structure ─── */
const SOP = [
  { cat:'Department', items:[
    { key:'about-zcpd',              label:'About ZCPD' },
    { key:'rank-structure',          label:'Rank Structure' },
    { key:'promotion-criteria',      label:'Promotion Criteria' },
    { key:'decorum',                 label:'Decorum' },
    { key:'uniform-equipment',       label:'Uniform & Equipment' },
    { key:'badge-number',            label:'Badge Number System' },
    { key:'communication-protocol',  label:'Communication Protocol' },
  ]},
  { cat:'Guidelines', items:[
    { key:'g1-citizen-rights',       label:'G-1: Citizen Rights' },
    { key:'g2-reasonable-suspicion', label:'G-2: Reasonable Suspicion' },
    { key:'g3-use-of-force',        label:'G-3: Use of Force' },
    { key:'g4-felony-misdemeanor',   label:'G-4: Felony & Misdemeanor' },
    { key:'g5-undercover-ops',       label:'G-5: Undercover Ops' },
    { key:'g6-redzone',              label:'G-6: Redzone Declaration' },
    { key:'g7-warrant',              label:'G-7: Warrant Execution' },
    { key:'g8-bolo',                 label:'G-8: BOLO' },
  ]},
  { cat:'Protocols', items:[
    { key:'patrolling',              label:'Patrolling' },
    { key:'traffic-stop',            label:'Traffic Stop' },
    { key:'pursuit',                 label:'Pursuit' },
    { key:'pit-maneuver',            label:'PIT Maneuvering' },
    { key:'arrest',                  label:'Arrest' },
    { key:'evidence-securing',       label:'Evidence Securing' },
    { key:'firearm-engagement',      label:'Firearm Engagement' },
    { key:'crowd-control',           label:'Crowd Control' },
    { key:'hostage-handling',        label:'Hostage Handling' },
    { key:'code-99',                 label:'Code 99 Response' },
    { key:'licensing-id',            label:'Licensing & ID' },
  ]},
]

export default function SOPPage() {
  const [active, setActive] = useState(null)
  const section = active ? SOP_CONTENT[active] : null

  return (
    <div className="max-w-7xl mx-auto flex flex-col" style={{ height:'calc(100vh - 5rem)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-a-500/15 border border-a-500/25 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-a-400"/>
          </div>
          <div><h1 className="page-title">SOP Library</h1><p className="text-sm text-g-muted mt-0.5">Standard Operating Procedures</p></div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-60 shrink-0 card p-3 overflow-y-auto space-y-4">
          {SOP.map(s => (
            <div key={s.cat}>
              <p className="text-[10px] font-bold text-g-muted uppercase tracking-wider px-2 mb-1.5">{s.cat}</p>
              {s.items.map(item => (
                <button key={item.key} onClick={()=>setActive(item.key)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors
                    ${active===item.key?'bg-a-500/15 text-a-400':'text-g-sub hover:text-g-text hover:bg-white/5'}`}>
                  <span>{item.label}</span>
                  <ChevronRight className="w-3 h-3 opacity-40 shrink-0"/>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card overflow-y-auto">
          {section
            ? <div className="p-6">
                <h2 className="text-lg font-bold text-g-text mb-1">{section.title}</h2>
                <p className="text-xs text-g-muted mb-5 uppercase tracking-wider">{section.cat}</p>
                {section.render()}
              </div>
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
