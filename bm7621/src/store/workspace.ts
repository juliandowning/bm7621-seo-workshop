import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkspaceState, Team, ScoreMap, ResponseMap, SimulatorMap, CMOEvaluation, ActivityKey } from '../types'
import { upsertWorkspaceData, isSupabaseConfigured } from '../lib/supabase'

interface WorkspaceStore extends WorkspaceState {
  // Actions
  setTeam: (team: Team) => void
  updateScore: (key: ActivityKey, points: number, max?: number) => void
  updateResponse: (patch: Partial<ResponseMap>) => void
  updateSimulator: (key: string, scores: (number | null)[]) => void
  setCMOEval: (eval_: CMOEvaluation) => void
  clearWorkspace: () => void
  syncToSupabase: () => Promise<void>
  exportJSON: () => string
  importJSON: (json: string) => boolean
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null

const initialState: WorkspaceState = {
  team: null,
  scores: {},
  responses: {},
  simulators: {},
  cmoEval: null,
  syncStatus: 'idle',
  lastSaved: null,
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTeam: (team) => set({ team }),

      updateScore: (key, points, max = 5) => {
        set(state => ({
          scores: {
            ...state.scores,
            [key]: {
              key,
              points,
              max,
              completed: points > 0,
              timestamp: new Date().toISOString(),
            },
          },
          syncStatus: 'idle',
        }))
        scheduledSync(get)
      },

      updateResponse: (patch) => {
        set(state => ({
          responses: { ...state.responses, ...patch },
          syncStatus: 'idle',
        }))
        scheduledSync(get)
      },

      updateSimulator: (key, scores) => {
        const valid = scores.filter((s): s is number => s !== null && !isNaN(s))
        const average = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null
        const points = average !== null ? simPts(average) : 0
        set(state => ({
          simulators: {
            ...state.simulators,
            [key]: { key, scores, average, points },
          },
          syncStatus: 'idle',
        }))
        scheduledSync(get)
      },

      setCMOEval: (cmoEval) => {
        set({ cmoEval, syncStatus: 'idle' })
        scheduledSync(get)
      },

      clearWorkspace: () => set({ ...initialState }),

      syncToSupabase: async () => {
        const state = get()
        if (!state.team || !isSupabaseConfigured()) {
          set({ syncStatus: 'offline' })
          return
        }
        set({ syncStatus: 'saving' })
        try {
          const ok = await upsertWorkspaceData(state.team.id, {
            scores: state.scores as Record<string, unknown>,
            responses: state.responses as Record<string, unknown>,
            simulators: state.simulators as Record<string, unknown>,
            cmo_eval: state.cmoEval as Record<string, unknown> | null,
          })
          set({
            syncStatus: ok ? 'saved' : 'error',
            lastSaved: ok ? new Date().toISOString() : get().lastSaved,
          })
        } catch {
          set({ syncStatus: 'error' })
        }
      },

      exportJSON: () => {
        const { team, scores, responses, simulators, cmoEval } = get()
        return JSON.stringify({ team, scores, responses, simulators, cmoEval, exportedAt: new Date().toISOString() }, null, 2)
      },

      importJSON: (json) => {
        try {
          const data = JSON.parse(json)
          set({
            scores: data.scores || {},
            responses: data.responses || {},
            simulators: data.simulators || {},
            cmoEval: data.cmoEval || null,
          })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'bm7621-workspace',
      partialize: (state) => ({
        team: state.team,
        scores: state.scores,
        responses: state.responses,
        simulators: state.simulators,
        cmoEval: state.cmoEval,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Debounced sync — waits 2.5s after last change
function scheduledSync(get: () => WorkspaceStore) {
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    get().syncToSupabase()
  }, 2500)
}

function simPts(avg: number) {
  if (avg >= 90) return 5
  if (avg >= 80) return 4
  if (avg >= 70) return 3
  if (avg >= 60) return 2
  return 1
}

// ─── SELECTORS ───────────────────────────────────────────────
export function selectTotalScore(scores: ScoreMap): number {
  return Object.values(scores).reduce((sum, s) => sum + (s?.points || 0), 0)
}

export function selectCompletedCount(scores: ScoreMap): number {
  return Object.values(scores).filter(s => s?.completed).length
}
