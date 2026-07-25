import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/* ── Default content — shown until an FTC edits it in the Site Editor. ── */
export const DEFAULTS = {
  nav: [
    { label: 'Home',      path: '/',          visible: true },
    { label: 'News',      path: '/news',      visible: true },
    { label: 'Join',      path: '/join',      visible: true },
    { label: 'Command',   path: '/roster',    visible: true },
    { label: 'Divisions', path: '/divisions', visible: true },
    { label: 'Services',  path: '/services',  visible: true },
    { label: 'Blotter',   path: '/blotter',   visible: true },
    { label: 'FAQ',       path: '/faq',       visible: true },
    { label: 'SOP',       path: '/sop',       visible: true },
    { label: 'Training',  path: '/training',  visible: true },
  ],

  join: {
    intro: "The Zion City Police Department is always looking for dedicated recruits who want to protect the community and uphold the law. No prior experience is required — our Field Training program will teach you everything from patrol procedure to radio communication. If you're ready to earn the badge, here's how to get started.",
    requirements: [
      'Be an active, verified member of the Zion City community',
      'Maintain a clean record (no serious active charges)',
      'A working microphone and clear communication',
      'Commitment to professional, fair role-play at all times',
      'Willingness to learn and follow the ZCPD SOP',
    ],
    steps: [
      { title: 'Apply', desc: 'Submit a recruitment application through the ZCPD Discord.' },
      { title: 'Interview', desc: 'Attend a short interview with a Field Training Instructor (FTI).' },
      { title: 'Academy', desc: 'Complete basic training on laws, procedure and radio protocol.' },
      { title: 'Field Training', desc: 'Ride along with an FTO across the training phases until signed off.' },
      { title: 'Sworn In', desc: 'Pass your final evaluation and be sworn in as a Constable.' },
    ],
    ladder: ['PO', 'CPO', 'HC', 'ASI', 'SI', 'CI', 'DYSP', 'SP', '…'],
    applyNote: 'Applications are handled through the official ZCPD Discord server. Ask a staff member for the current recruitment link.',
  },

  divisions: [
    { name: 'Command Staff',        desc: 'Senior leadership responsible for strategy, policy and overall command of the department.' },
    { name: 'Patrol Division',      desc: 'The backbone of ZCPD — uniformed officers responding to calls, patrolling zones and serving the public day and night.' },
    { name: 'Field Training (FTO)', desc: 'Trains and evaluates every new recruit through structured phases before they patrol independently.' },
    { name: 'S.W.A.T',              desc: 'Special Weapons And Tactics — the elite unit deployed for high-risk situations, hostage rescue and heavily armed suspects.' },
    { name: 'Traffic Division',     desc: 'Enforces road safety, manages pursuits and PIT operations, and responds to collisions across the city.' },
    { name: 'Investigations (CID)', desc: 'Detectives who handle serious crimes, gather evidence, execute warrants and follow cases from scene to court.' },
    { name: 'Dispatch & ZIMS',      desc: 'Coordinates units over radio, prioritises calls and manages incidents through the Zephyr Incident Management System.' },
  ],

  services: {
    emergency: 'In an emergency, always call 911 — for life-threatening situations, crimes in progress, or immediate danger.',
    licenses: [
      { name: "Learner's License", desc: 'Permits supervised driving practice — you must be accompanied by a licensed driver.' },
      { name: "Driver's License", desc: 'Full authorization to operate motor vehicles within Zion City.' },
      { name: 'Firearm License', desc: 'Required to legally purchase, possess and carry a firearm. Verified during any firearm-related stop.' },
      { name: 'Residential ID', desc: 'Proof of Zion City residency, required for certain city services.' },
      { name: 'Press / News ID', desc: 'For accredited media — grants access rights at public events and briefings.' },
    ],
    reports: [
      { title: 'Report a crime', desc: 'For emergencies call 911. For non-urgent matters, contact the station front desk or a patrol officer.' },
      { title: 'Request a police record', desc: 'Records and incident reports can be requested through the station. Bring valid ID.' },
      { title: 'File a complaint', desc: "Complaints about an officer are taken seriously and reviewed by command staff. Note the officer's badge number if possible." },
      { title: 'Recover impounded property', desc: 'Vehicles or items seized as evidence can be reclaimed once released — contact the evidence desk.' },
    ],
  },

  faq: [
    { q: 'What should I do during a traffic stop?', a: "Pull over safely, stay in your vehicle, keep your hands visible, and follow the officer's instructions. You have the right to know why you were stopped. Have your license ready if asked." },
    { q: "What are my rights if I'm detained or arrested?", a: 'You have the right to remain silent and the right to an attorney. Officers must have reasonable suspicion to detain you and probable cause to arrest you. Stay calm and do not resist — disputes are settled in court, not on the street.' },
    { q: 'How do I report a crime?', a: 'For emergencies or crimes in progress, call 911. For non-urgent issues, contact the station or flag down a patrol officer. Provide as much detail as you can: location, descriptions and time.' },
    { q: 'How do I file a complaint against an officer?', a: "Complaints are reviewed by command staff. Note the officer's badge number, the date, time and location, and what happened, then submit it through the station." },
    { q: 'Can the police search me or my vehicle?', a: 'Generally only with your consent, a warrant, or probable cause. Contraband in plain view may be seized. You may decline a consent search — declining is not itself grounds for a search.' },
    { q: 'How can I join the ZCPD?', a: 'Visit the Join ZCPD page for requirements and the recruitment process. No prior experience is needed — full training is provided.' },
  ],
}

/** Read one content key, falling back to the built-in default until edited. */
export function useSiteContent(key) {
  const [data, setData] = useState(DEFAULTS[key])
  useEffect(() => {
    let alive = true
    supabase.from('site_content').select('data').eq('key', key).maybeSingle()
      .then(({ data: row }) => { if (alive && row?.data) setData(row.data) })
    return () => { alive = false }
  }, [key])
  return data
}

/** Load every content key at once (for the editor), seeded with defaults. */
export function useAllSiteContent() {
  const [content, setContent] = useState({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  async function reload() {
    const { data } = await supabase.from('site_content').select('key,data')
    const map = { ...DEFAULTS }
    data?.forEach(r => { if (r.data) map[r.key] = r.data })
    setContent(map); setLoading(false)
  }
  useEffect(() => { reload() }, [])
  return { content, setContent, loading, reload }
}

export async function saveSiteContent(key, data) {
  return supabase.from('site_content').upsert({ key, data, updated_at: new Date().toISOString() })
}
