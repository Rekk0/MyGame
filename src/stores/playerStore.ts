import { create } from 'zustand'
import type { Player } from '../types/player'

interface PlayerState {
  player: Player | null
  loading: boolean
  fetchPlayer: () => Promise<void>
  createPlayer: (name: string) => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  loading: false,

  fetchPlayer: async () => {
    set({ loading: true })
    try {
      const player = await window.playerAPI.get()
      set({ player: player ?? null, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createPlayer: async (name: string) => {
    await window.playerAPI.create(name)
    await usePlayerStore.getState().fetchPlayer()
  },
}))
