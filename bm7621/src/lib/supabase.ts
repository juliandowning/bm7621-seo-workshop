import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://abteskbtkgmplasgpekj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidGVza2J0a2dtcGxhc2dwZWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODY5MTcsImV4cCI6MjA5MTA2MjkxN30.YczwMyY4ElTJVlx4bPq01teH47HYcBZJPQAfREGPYvg'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 2 } },
})

export const isSupabaseConfigured = () => true

// ─── TEAM OPERATIONS ────────────────────────────────────────
export async function getTeamByCode(code: string) {
  const { data, error } = await supabase
    .from('bm7621seo_teams')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle()
  if (error) return null
  return data
}

export async function updateTeamMembers(teamId: string, members: { name: string; order: number }[]) {
  const { data, error } = await supabase
    .from('bm7621seo_teams')
    .update({ members })
    .eq('id', teamId)
    .select()
  console.log('[updateTeamMembers]', { teamId, members, data, error })
  return !error
}

export async function upsertWorkspaceData(teamId: string, payload: {
  scores?: Record<string, unknown>
  responses?: Record<string, unknown>
  simulators?: Record<string, unknown>
  cmo_eval?: Record<string, unknown> | null
}) {
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
  const { data, error } = await supabase
    .from('bm7621seo_workspace_data')
    .select('*')
    .eq('team_id', teamId)
    .maybeSingle()
  if (error) return null
  return data
}

export async function getAllTeamsData() {
  // Fetch teams and workspace data separately to avoid join issues
  const { data: teams, error: teamsError } = await supabase
    .from('bm7621seo_teams')
    .select('*')
  if (teamsError || !teams) return []

  const { data: workspaces } = await supabase
    .from('bm7621seo_workspace_data')
    .select('*')

  // Merge workspace data onto teams
  return teams.map((team: { id: string; brand: string; name: string; members: unknown }) => ({
    ...team,
    bm7621seo_workspace_data: workspaces
      ? workspaces.filter((ws: { team_id: string }) => ws.team_id === team.id)
      : [],
  }))
}

export function subscribeToAllWorkspaces(callback: (payload: unknown) => void) {
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
