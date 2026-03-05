import type { Quest } from './quest'
import type { Player, WorldStyle } from './player'
import type { Streak } from './streak'
import type { Achievement } from './achievement'
import type { Medal, MedalCategory } from './medal'
import type { Skill } from './skill'

declare global {
  interface Window {
    questAPI: {
      create: (data: { originalText: string; dueDate?: string | null }) => Promise<Quest>
      getAll: () => Promise<Quest[]>
      getById: (id: string) => Promise<Quest | undefined>
      update: (id: string, data: Partial<Quest>) => Promise<Quest>
      delete: (id: string) => Promise<void>
      complete: (id: string) => Promise<Quest>
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
      }>
    }
    settingsAPI: {
      getAiConfig: () => Promise<{ provider: string; apiKey: string; model: string; autoTransform: boolean } | null>
      setAiConfig: (config: { provider: string; apiKey: string; model: string; autoTransform: boolean }) => Promise<void>
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
  }
}
