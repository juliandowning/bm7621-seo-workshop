// ─── TEAM ───────────────────────────────────────────────────
export type Brand = 'ASOS' | 'Ryanair' | 'Starbucks' | 'Coca-Cola' | 'Samsung'

export interface TeamMember {
  name: string
  order: number
}

export interface Team {
  id: string
  code: string
  name: string
  brand: Brand
  members: TeamMember[]
  created_at: string
  updated_at: string
}

// ─── SCORES ─────────────────────────────────────────────────
export type ActivityKey =
  | 'a1' | 'a2' | 'a3'
  | 'sim1'
  | 'a4' | 'a5'
  | 'a6' | 'a7'
  | 'sim2'
  | 'a8' | 'a9' | 'a10'
  | 'a11' | 'a12' | 'a13'
  | 'sim3'
  | 'a14' | 'a15'
  | 'sim4' | 'sim5'
  | 'a16' | 'a17' | 'a18'

export interface ActivityScore {
  key: ActivityKey
  points: number
  max: number
  completed: boolean
  timestamp?: string
}

export type ScoreMap = Partial<Record<ActivityKey, ActivityScore>>

// ─── RESPONSES ──────────────────────────────────────────────
export interface ResponseMap {
  a1_st1?: string; a1_st2?: string; a1_lt1?: string; a1_lt2?: string
  a2_intents?: string[]
  a3_serp?: string[]; a3_obs?: string
  a4_title?: string; a4_meta?: string; a4_kw?: string
  a5_p1?: string; a5_p8?: string; a5_p2?: string
  a6_cwv?: string; a6_explain?: string
  a7_now?: string[]; a7_next?: string[]; a7_monitor?: string[]
  a8_pillar?: string; a8_s1?: string; a8_s2?: string; a8_s3?: string
  a8_q1?: string; a8_q2?: string; a8_q3?: string
  a9_exp?: number; a9_exp2?: number; a9_auth?: number; a9_trust?: number
  a9_exp_note?: string; a9_exp2_note?: string; a9_auth_note?: string; a9_trust_note?: string
  a10_gbp?: string; a10_reviews?: string; a10_citations?: string; a10_nap?: string
  a11_a?: string; a11_b?: string; a11_c?: string
  a12_negkw?: string[]
  a13_brand?: number; a13_generic?: number; a13_comp?: number; a13_retarg?: number
  a13_rationale?: string
  a14_e1?: string; a14_e2?: string; a14_e3?: string; a14_next?: string
  a15_high?: string; a15_low?: string; a15_opp?: string; a15_action?: string
  a16_auth?: string; a16_cite?: string; a16_orig?: string; a16_struct?: string
  a17_ai?: string[]; a17_human?: string[]
  a18_seo?: string; a18_tech?: string; a18_ppc?: string; a18_ai?: string
  a18_r1?: string; a18_r2?: string; a18_r3?: string; a18_impact?: string
}

// ─── SIMULATOR ──────────────────────────────────────────────
export interface SimulatorEntry {
  key: string
  scores: (number | null)[]
  average: number | null
  points: number
}

export type SimulatorMap = Partial<Record<string, SimulatorEntry>>

// ─── CMO EVALUATION ─────────────────────────────────────────
export type BoardVerdict = 'approved' | 'revisions' | 'rejected'

export interface EvalDimension {
  label: string
  score: number
}

export interface CMOEvaluation {
  dimensions: EvalDimension[]
  strengths: string[]
  weaknesses: string[]
  verdict: BoardVerdict
  generated_at: string
}

// ─── WORKSPACE ──────────────────────────────────────────────
export interface WorkspaceState {
  team: Team | null
  scores: ScoreMap
  responses: ResponseMap
  simulators: SimulatorMap
  cmoEval: CMOEvaluation | null
  syncStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSaved: string | null
}

// ─── FACILITATOR ────────────────────────────────────────────
export interface TeamSummary {
  team: Team
  totalScore: number
  activitiesCompleted: number
  currentBlock: number
  completionPct: number
}
