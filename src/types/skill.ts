export type SkillCategory = 'core' | 'universal' | 'hidden'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  level: number
  xp: number
  maxXp: number
  description: string
  traits: string[]
  parentSkillId: string | null
  isUnlocked: boolean
  playerId: string
}
