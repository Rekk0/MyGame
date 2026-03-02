import type { Quest } from './quest'
import type { Player } from './player'
import type { Streak } from './streak'

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
      create: (name: string) => Promise<Player>
      addXp: (amount: number) => Promise<{ player: Player; leveledUp: boolean; newLevel: number }>
      addGold: (amount: number) => Promise<Player>
      consumeEp: (amount: number) => Promise<Player>
      resetEp: () => Promise<Player>
    }
    streakAPI: {
      get: () => Promise<Streak | undefined>
      record: () => Promise<Streak>
    }
  }
}
