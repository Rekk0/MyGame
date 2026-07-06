import { create } from 'zustand'
import type { Player, WorldStyle } from '../types/player'

interface PlayerState {
  player: Player | null
  allPlayers: Player[]
  loading: boolean
  fetchPlayer: () => Promise<void>
  fetchAllPlayers: () => Promise<void>
  createPlayer: (name: string, worldStyle: WorldStyle) => Promise<void>
  switchPlayer: (id: string) => Promise<void>
  deletePlayer: (id: string) => Promise<void>
  sleep: (hours?: number) => Promise<void>
  rest: () => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  allPlayers: [],
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

  fetchAllPlayers: async () => {
    const all = await window.playerAPI.getAll()
    set({ allPlayers: all })
  },

  createPlayer: async (name: string, worldStyle: WorldStyle) => {
    await window.playerAPI.create(name, worldStyle)
    const store = usePlayerStore.getState()
    await Promise.all([store.fetchPlayer(), store.fetchAllPlayers()])
  },

  switchPlayer: async (id: string) => {
    const player = await window.playerAPI.switch(id)
    set({ player })
  },

  deletePlayer: async (id: string) => {
    const next = await window.playerAPI.delete(id)
    set({ player: next ?? null })
    await usePlayerStore.getState().fetchAllPlayers()
  },

  sleep: async (hours?: number) => {
    await window.playerAPI.sleep(hours)
    await usePlayerStore.getState().fetchPlayer()
  },

  rest: async () => {
    await window.playerAPI.rest()
    await usePlayerStore.getState().fetchPlayer()
  },
}))
