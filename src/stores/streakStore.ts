import { create } from 'zustand'
import type { Streak } from '../types/streak'

interface StreakState {
  streak: Streak | null
  fetchStreak: () => Promise<void>
  recordToday: () => Promise<void>
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,

  fetchStreak: async () => {
    const streak = await window.streakAPI.get()
    set({ streak: streak ?? null })
  },

  recordToday: async () => {
    const streak = await window.streakAPI.record()
    set({ streak })
  },
}))
