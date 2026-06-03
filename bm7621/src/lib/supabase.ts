import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || ''
const supabaseKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || ''

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 2 } },
})

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseKey

// ─── TEAM OPERATIONS ────────────────────────────────────────
export async function getTeamByCode(code: string) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('bm7621seo_teams')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()
  if (error) return null
  return data
}

export async function updateTeamMembers(teamId: string, members: { name: string; order: number }[]) {
  if (!isSupabaseConfigured()) return false
  const { data, error } = await supabase
    .from('bm7621seo_teams')
    .update({ members: members })
    .eq('id', teamId)
    .select()
  console.log('[updateTeamMembers] teamId:', teamId, 'members:', members, 'result:', data, 'error:', error)
  return !error
}

export async function upsertWorkspaceData(teamId: string, payload: {
  scores?: Record<string, unknown>
  responses?: Record<string, unknown>
  simulators?: Record<string, unknown>
  cmo_eval?: Record<string, unknown> | null
}) {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase
    .from('bm7621seo_workspace_data')
    .upsert({
      team_id: teamId,
      ...payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'team_id' })
  return !error
}

export async function getWorkspaceData(teamId: string) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('bm7621seo_workspace_data')
    .select('*')
    .eq('team_id', teamId)
    .single()
  if (error) return null
  return data
}

export async function getAllTeamsData() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('bm7621seo_teams')
    .select(`
      *,
      bm7621seo_workspace_data (
        scores,
        responses,
        simulators,
        cmo_eval,
        updated_at
      )
    `)
  if (error) return []
  return data || []
}

export function subscribeToAllWorkspaces(callback: (payload: unknown) => void) {
  if (!isSupabaseConfigured()) return () => {}
  const channel = supabase
    .channel('workspace-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bm7621seo_workspace_data',
    }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export function subscribeToTeamWorkspace(teamId: string, callback: (payload: unknown) => void) {
  if (!isSupabaseConfigured()) return () => {}
  const channel = supabase
    .channel(`workspace-${teamId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bm7621seo_workspace_data',
      filter: `team_id=eq.${teamId}`,
    }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
