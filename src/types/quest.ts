export type QuestType = 'daily' | 'dungeon' | 'main' | 'timed' | 'adventure' | 'test'
export type QuestStatus = 'pending' | 'completed' | 'failed'

export interface Quest {
  id: string
  originalText: string
  gamifiedName: string | null
  narrative: string | null
  xp: number
  epCost: number
  type: QuestType
  status: QuestStatus
  dueDate: string | null
  completedAt: string | null
  aiEnergyPct: number | null
  aiDrive: number | null
  aiLike: number | null
  userEnergyPct: number | null
  userDrive: number | null
  userLike: number | null
  skillHint: string | null
  createdAt: string
  predictedDeltas?: { energy: number; willpower: number; spirit: number }
}
