export type QuestType = 'daily' | 'dungeon' | 'main' | 'timed' | 'adventure' | 'test'
export type QuestStatus = 'pending' | 'completed' | 'failed'

export interface Quest {
  id: string
  originalText: string
  gamifiedName: string | null
  narrative: string | null
  xp: number
  type: QuestType
  status: QuestStatus
  dueDate: string | null
  completedAt: string | null
  createdAt: string
}
