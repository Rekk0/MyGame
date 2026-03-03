export type WorldStyle = 'wuxia' | 'xianxia' | 'realistic' | 'apocalypse' | 'scifi' | 'fantasy'

export interface Player {
  id: string
  name: string
  title: string | null
  level: number
  xp: number
  xpToNextLevel: number // not stored in DB, dynamically calculated: Math.ceil(100 * level * 1.5)
  gold: number
  ep: number
  maxEp: number
  worldStyle: WorldStyle
  createdAt: string
}
