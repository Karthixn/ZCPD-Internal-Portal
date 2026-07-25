import { supabase } from './supabase'

/**
 * Append a line to the activity log. Fire-and-forget — never blocks or throws
 * into the caller, so a logging failure can't break the real action.
 *   logActivity({ action: 'Promoted John Doe to SI', kind: 'promotion', actor: 'Selva Raj' })
 */
export function logActivity({ action, kind = null, actor = null }) {
  if (!action) return
  supabase.from('activity_log').insert({ action, kind, actor }).then(() => {}, () => {})
}
