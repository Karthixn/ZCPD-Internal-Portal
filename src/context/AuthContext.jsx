import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid) {
    const { data } = await supabase
      .from('profiles')
      .select('*, officers(id,name,rank,badge_no,designation,status)')
      .eq('id', uid)
      .single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) await loadProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) await loadProfile(session.user.id)
      else { setProfile(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const role    = profile?.role ?? null
  const isFTC   = role === 'ftc'
  const isFTI   = role === 'fti' || isFTC
  const isFTO   = role === 'fto' || isFTI
  const isSWAT  = role === 'swat'
  const officer = profile?.officers ?? null

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  return (
    <Ctx.Provider value={{ user, profile, officer, loading, role, isFTC, isFTI, isFTO, isSWAT, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}
