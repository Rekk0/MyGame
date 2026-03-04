import { create } from 'zustand'
import type { Quest, QuestType } from '../types/quest'
import { usePlayerStore } from './playerStore'
import { useStreakStore } from './streakStore'

interface QuestState {
  quests: Quest[]
  loading: boolean
  error: string | null
  autoTransform: boolean
  transformingIds: string[]
  fetchQuests: () => Promise<void>
  loadSettings: () => Promise<void>
  setAutoTransform: (val: boolean) => void
  createQuest: (originalText: string) => Promise<void>
  transformQuest: (id: string) => Promise<void>
  completeQuest: (id: string) => Promise<void>
  deleteQuest: (id: string) => Promise<void>
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  loading: false,
  error: null,
  autoTransform: true,
  transformingIds: [],

  fetchQuests: async () => {
    set({ loading: true, error: null })
    try {
      const quests = await window.questAPI.getAll()
      set({ quests, loading: false })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  loadSettings: async () => {
    const cfg = await window.settingsAPI.getAiConfig()
    if (cfg) set({ autoTransform: cfg.autoTransform ?? true })
  },

  setAutoTransform: (val: boolean) => set({ autoTransform: val }),

  createQuest: async (originalText: string) => {
    const quest = await window.questAPI.create({ originalText })
    await get().fetchQuests()
    if (get().autoTransform) void get().transformQuest(quest.id)
  },

  transformQuest: async (id: string) => {
    const quest = get().quests.find((q) => q.id === id)
    if (!quest) return
    if (!usePlayerStore.getState().player) await usePlayerStore.getState().fetchPlayer()
    const player = usePlayerStore.getState().player
    if (!player) return
    set((s) => ({ transformingIds: [...s.transformingIds, id] }))
    try {
      const result = await window.aiAPI.transformQuest({
        originalText: quest.originalText,
        worldStyle: player.worldStyle,
      })
      await window.questAPI.update(id, {
        gamifiedName: result.gamifiedName,
        narrative: result.narrative,
        type: result.type as QuestType,
        xp: result.xp,
      })
      await get().fetchQuests()
    } catch {
      // AI failed, keep original text
    } finally {
      set((s) => ({ transformingIds: s.transformingIds.filter((t) => t !== id) }))
    }
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
