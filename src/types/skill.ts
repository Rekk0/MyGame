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
  iconSvg: string | null
}

/** 技能升级事件（主进程广播 → 渲染层弹「技能精进」）。 */
export interface SkillLevelUpEvent {
  id: string
  name: string
  category: SkillCategory
  level: number
  description: string
  newTrait: string | null
  iconSvg: string | null
}
