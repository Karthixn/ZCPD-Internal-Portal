import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [pw, setPw]           = useState('')
  const [show, setShow]       = useState(false)
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    const { error } = await signIn(email.trim(), pw)
    if (error) { setErr(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message); setLoading(false); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-n-900 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-n-800 border-r border-n-600 p-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ZCPD" className="w-9 h-9 object-contain"/>
          <span className="text-sm font-bold text-g-text tracking-wider">ZCPD INTERNAL</span>
        </div>

        <div>
          <img src="/logo.png" alt="ZCPD" className="w-20 h-20 object-contain mb-6"/>
          <h1 className="text-3xl font-bold text-g-text leading-tight mb-3">Zion City<br/>Police Department</h1>
          <p className="text-g-muted text-sm leading-relaxed mb-8">Restricted access. Authorised personnel only.<br/>All activity is logged and monitored.</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[['44+','Officers'],['11','Ranks'],['4','SWAT squads']].map(([v,l]) => (
              <div key={l} className="bg-n-900/60 border border-n-600 rounded-lg p-3">
                <p className="text-xl font-bold font-mono text-a-400">{v}</p>
                <p className="text-xs text-g-muted mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-g-muted">© ZCPD Internal Systems</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="ZCPD" className="w-8 h-8 object-contain"/>
            <span className="font-bold text-sm">ZCPD INTERNAL</span>
          </div>
          <h2 className="text-2xl font-bold text-g-text mb-1">Sign in</h2>
          <p className="text-g-muted text-sm mb-8">Use credentials provided by your FTC.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="inp" placeholder="officer@zcpd.internal" required autoComplete="email"/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} className="inp pr-10" placeholder="••••••••" required autoComplete="current-password"/>
                <button type="button" onClick={()=>setShow(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-g-muted hover:text-g-sub" tabIndex={-1}>
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            {err && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0"/>
                <p className="text-red-400 text-sm">{err}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-1">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Verifying…</> : <><Shield className="w-4 h-4"/>Sign in to portal</>}
            </button>
          </form>

          <p className="text-center text-xs text-g-muted mt-8">Account issues? Contact your FTC to reset credentials.</p>
        </div>
      </div>
    </div>
  )
}
