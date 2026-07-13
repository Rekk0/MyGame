import { create } from 'zustand'
import type { Quest, QuestType } from '../types/quest'
import { usePlayerStore } from './playerStore'
import { useStreakStore } from './streakStore'
import { useSkillStore } from './skillStore'

interface QuestState {
  quests: Quest[]
  loading: boolean
  error: string | null
  autoTransform: boolean
  transformingIds: string[]
  questOrder: string[]
  fetchQuests: () => Promise<void>
  loadSettings: () => Promise<void>
  setAutoTransform: (val: boolean) => void
  createQuest: (
    originalText: string,
    ratings?: { E?: number; D?: number; L?: number },
    dueDate?: string
  ) => Promise<void>
  transformQuest: (id: string) => Promise<void>
  completeQuest: (id: string) => Promise<void>
  deleteQuest: (id: string) => Promise<void>
  reorderQuests: (ids: string[]) => void
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  loading: false,
  error: null,
  autoTransform: true,
  transformingIds: [],
  questOrder: [],

  reorderQuests: (ids: string[]) => set({ questOrder: ids }),

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

  createQuest: async (
    originalText: string,
    ratings?: { E?: number; D?: number; L?: number },
    dueDate?: string
  ) => {
    const quest = await window.questAPI.create({
      originalText,
      dueDate: dueDate || null,
      userEnergyPct: ratings?.E,
      userDrive: ratings?.D,
      userLike: ratings?.L,
    })
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
        epCost: result.epCost ?? 10,
        aiEnergyPct: result.aiEnergyPct,
        aiDrive: result.aiDrive,
        aiLike: result.aiLike,
        skillHint: result.skillHint ?? null,
      })
      await get().fetchQuests()
    } catch {
      // AI failed, keep original text
    } finally {
      set((s) => ({ transformingIds: s.transformingIds.filter((t) => t !== id) }))
    }
  },

  completeQuest: async (id: string) => {
    // 技能 XP 回路已移入主进程 QUEST_COMPLETE（按 skillHint 路由，见 questHandlers）
    await window.questAPI.complete(id)
    await window.streakAPI.record()
    await Promise.all([
      get().fetchQuests(),
      usePlayerStore.getState().fetchPlayer(),
      useStreakStore.getState().fetchStreak(),
      useSkillStore.getState().fetchSkills(),
    ])
  },

  deleteQuest: async (id: string) => {
    await window.questAPI.delete(id)
    await get().fetchQuests()
  },
}))
