import { create } from 'zustand'
import type { Achievement } from '../types/achievement'

interface AchievementState {
  achievements: Achievement[]
  fetchAchievements: () => Promise<void>
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],

  fetchAchievements: async () => {
    const rows = await window.achievementAPI.getAll()
    // DB returns isUnlocked as 0/1 integer; convert to boolean
    const achievements = rows.map((a) => ({ ...a, isUnlocked: !!a.isUnlocked }))
    set({ achievements })
  },
}))
