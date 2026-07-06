import type { Quest } from './quest'
import type { Player, WorldStyle } from './player'
import type { Streak } from './streak'
import type { Achievement } from './achievement'
import type { Medal, MedalCategory } from './medal'
import type { Skill } from './skill'

declare global {
  interface Window {
    questAPI: {
      create: (data: { originalText: string; dueDate?: string | null; userEnergyPct?: number; userDrive?: number; userLike?: number }) => Promise<Quest>
      getAll: () => Promise<Quest[]>
      getById: (id: string) => Promise<Quest | undefined>
      update: (id: string, data: Partial<Quest>) => Promise<Quest>
      delete: (id: string) => Promise<void>
      complete: (id: string) => Promise<{ quest: Quest; newAchievements: Achievement[]; finalXp: number }>
    }
    playerAPI: {
      get: () => Promise<Player | undefined>
      getAll: () => Promise<Player[]>
      create: (name: string, worldStyle: WorldStyle) => Promise<Player>
      switch: (id: string) => Promise<Player>
      delete: (id: string) => Promise<Player | undefined>
      addXp: (amount: number) => Promise<{ player: Player; leveledUp: boolean; newLevel: number }>
      addGold: (amount: number) => Promise<Player>
      consumeEp: (amount: number) => Promise<Player>
      resetEp: () => Promise<Player>
      sleep: (hours?: number) => Promise<Player>
      rest: () => Promise<Player>
    }
    streakAPI: {
      get: () => Promise<Streak | undefined>
      record: () => Promise<Streak>
    }
    windowAPI: {
      showMain: () => Promise<void>
      hideMain: () => Promise<void>
      showHud: () => Promise<void>
      hideHud: () => Promise<void>
      showQuickInput: () => Promise<void>
      hideQuickInput: () => Promise<void>
      showQuestHud: () => Promise<void>
      hideQuestHud: () => Promise<void>
      getHudConfig: () => Promise<{ hudX?: number; hudY?: number; hudLocked?: boolean; hudPinned?: boolean; questHudX?: number; questHudY?: number; questHudLocked?: boolean; questHudPinned?: boolean; hudBgOpacity?: number; hudTextOpacity?: number }>
      saveHudConfig: (patch: object) => Promise<void>
      getHudPosition: () => Promise<{ x: number; y: number } | null>
      getQuestHudPosition: () => Promise<{ x: number; y: number } | null>
      setHudPosition: (x: number, y: number) => Promise<void>
      setQuestHudPosition: (x: number, y: number) => Promise<void>
      setHudPinned: (pinned: boolean) => Promise<void>
      setQuestHudPinned: (pinned: boolean) => Promise<void>
      setHudIgnoreMouse: (ignore: boolean) => Promise<void>
      setQuestHudIgnoreMouse: (ignore: boolean) => Promise<void>
      onHudConfigChanged: (callback: (cfg: { hudBgOpacity?: number; hudTextOpacity?: number }) => void) => () => void
    }
    dataAPI: {
      onUpdated: (callback: () => void) => () => void
    }
    aiAPI: {
      transformQuest: (args: { originalText: string; worldStyle: WorldStyle }) => Promise<{
        gamifiedName: string | null
        narrative: string | null
        type: string
        xp: number
        epCost?: number
        aiEnergyPct?: number
        aiDrive?: number
        aiLike?: number
      }>
    }
    settingsAPI: {
      getAiConfig: () => Promise<{ provider: string; apiKey: string; model: string; autoTransform: boolean; language?: 'zh' | 'en'; theme?: 'dark' | 'light'; quickInputHotkey?: string } | null>
      setAiConfig: (config: { provider: string; apiKey: string; model: string; autoTransform: boolean; language?: 'zh' | 'en'; theme?: 'dark' | 'light'; quickInputHotkey?: string }) => Promise<void>
      onLanguageChanged: (callback: (lang: string) => void) => () => void
    }
    achievementAPI: {
      getAll: () => Promise<Achievement[]>
      getUnlocked: () => Promise<Achievement[]>
      onShow: (callback: (achievement: Achievement) => void) => () => void
    }
    medalAPI: {
      getAll: () => Promise<Medal[]>
      generate: (args: { name: string; category: MedalCategory; description: string }) => Promise<Medal | null>
    }
    skillAPI: {
      getAll: () => Promise<Skill[]>
      addXp: (id: string, amount: number) => Promise<{ skill: Skill; leveledUp: boolean; newTrait?: string }>
      unlock: (id: string) => Promise<Skill>
    }
    ddaAPI: {
      getState: () => Promise<{ state: 'anxious' | 'flow' | 'bored'; xpMultiplier: number; suggestion: string }>
      getSuggestion: () => Promise<{ mood: string; tips: string[]; suggestedQuestTypes: string[] } | null>
    }
    plotAPI: {
      getDailyStatus: () => Promise<{ eligible: boolean; cached?: string }>
      getWeeklyStatus: () => Promise<{ eligible: boolean; cached?: string }>
      generateDaily: () => Promise<string>
      generateWeekly: () => Promise<string>
    }
    shellAPI: {
      openExternal: (url: string) => Promise<void>
    }
  }
}
