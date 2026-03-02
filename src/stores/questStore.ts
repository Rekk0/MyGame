import { create } from 'zustand'
import type { Quest } from '../types/quest'
import { usePlayerStore } from './playerStore'
import { useStreakStore } from './streakStore'

interface QuestState {
  quests: Quest[]
  loading: boolean
  error: string | null
  fetchQuests: () => Promise<void>
  createQuest: (originalText: string) => Promise<void>
  completeQuest: (id: string) => Promise<void>
  deleteQuest: (id: string) => Promise<void>
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  loading: false,
  error: null,

  fetchQuests: async () => {
    set({ loading: true, error: null })
    try {
      const quests = await window.questAPI.getAll()
      set({ quests, loading: false })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  createQuest: async (originalText: string) => {
    await window.questAPI.create({ originalText })
    await get().fetchQuests()
  },

  completeQuest: async (id: string) => {
    const quest = get().quests.find((q) => q.id === id)
    const xp = quest?.xp ?? 10
    await window.questAPI.complete(id)
    await window.playerAPI.addXp(xp)
    await window.playerAPI.addGold(5)
    await window.playerAPI.consumeEp(10)
    await window.streakAPI.record()
    await Promise.all([
      get().fetchQuests(),
      usePlayerStore.getState().fetchPlayer(),
      useStreakStore.getState().fetchStreak(),
    ])
  },

  deleteQuest: async (id: string) => {
    await window.questAPI.delete(id)
    await get().fetchQuests()
  },
}))
