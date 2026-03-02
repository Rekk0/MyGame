import { create } from 'zustand'
import type { Quest } from '../types/quest'

interface QuestState {
  quests: Quest[]
  loading: boolean
  error: string | null
  fetchQuests: () => Promise<void>
  createQuest: (originalText: string) => Promise<void>
  completeQuest: (id: string) => Promise<void>
  deleteQuest: (id: string) => Promise<void>
}

export const useQuestStore = create<QuestState>((set) => ({
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
    await useQuestStore.getState().fetchQuests()
  },

  completeQuest: async (id: string) => {
    await window.questAPI.complete(id)
    await useQuestStore.getState().fetchQuests()
  },

  deleteQuest: async (id: string) => {
    await window.questAPI.delete(id)
    await useQuestStore.getState().fetchQuests()
  },
}))
