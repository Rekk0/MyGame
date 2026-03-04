export type AchievementTier = 'common' | 'rare' | 'epic' | 'legendary' | 'Ultra'

export interface Achievement {
  id: string
  title: string
  description: string
  tier: AchievementTier
  unlockText: string | null
  triggerCondition: string
  unlockedAt: string | null
  isUnlocked: boolean
}
