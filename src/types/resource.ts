export type ResourceSource = 'quest' | 'sleep' | 'rest' | 'passive' | 'mood'

export interface ResourceDelta {
  energy?: number
  willpower?: number
  spirit?: number
}

export interface Ratings {
  E: number
  D: number
  L: number
}
