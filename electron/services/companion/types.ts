export type TriggerEvent =
  | 'quest_completed' | 'idle' | 'startup' | 'timer' | 'threshold' | 'manual'

export interface Snapshot {
  energy: number; willpower: number; spirit: number
  dEnergy: number; dWillpower: number; dSpirit: number
  pendingTasks: number; streak: number
  hour: number                 // 0-23，本地挂钟小时
  event: TriggerEvent
  lastCompletedName?: string
}

export type SignalKind =
  | 'energy_low' | 'willpower_low' | 'spirit_low'
  | 'late_night' | 'quest_completed' | 'streak_milestone'
  | 'idle' | 'greeting' | 'state_good' | 'mood'

export type Severity = 'danger' | 'warning' | 'info'
export interface Signal { kind: SignalKind; severity: Severity }

export type ActionId =
  | 'rest' | 'sleep' | 'recommend_liked' | 'recommend_task'
  | 'add_task' | 'view_plot' | 'record_mood'

export type Proactivity = 'high' | 'medium' | 'low'
export type Mood = 'neutral' | 'happy' | 'tired' | 'worried' | 'alert'
export type EnergyTier = 'high' | 'mid' | 'low'

export interface CompanionReply {
  line: string
  actions: ActionId[]
  mood: Mood
  fromAI: boolean            // true=AI 生成，false=离线模板
}
