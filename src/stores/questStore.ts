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
    const type = quest?.type ?? 'daily'
    const result = await window.questAPI.complete(id)
    const xp = result.finalXp ?? quest?.xp ?? 10
    await window.playerAPI.addXp(xp)
    await window.playerAPI.addGold(5)
    await window.playerAPI.consumeEp(10)
    await window.streakAPI.record()
    // 技能 XP：根据任务类型给对应技能加经验
    const SKILL_XP_MAP: Record<string, { skillKey: string; amount: number }> = {
      daily: { skillKey: 'time-mgmt', amount: 5 },
      dungeon: { skillKey: 'productivity', amount: 10 },
      main: { skillKey: 'resilience', amount: 20 },
      adventure: { skillKey: 'learning', amount: 8 },
    }
    const skillXp = SKILL_XP_MAP[type]
    if (skillXp) {
      // 技能 ID 格式为 `${playerId}-${skillKey}`，需要从 skillAPI 拿到实际 ID
      const allSkills = await window.skillAPI.getAll()
      const target = allSkills.find(s => s.id.endsWith(`-${skillXp.skillKey}`) && s.isUnlocked)
      if (target) void window.skillAPI.addXp(target.id, skillXp.amount)
    }
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
