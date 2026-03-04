import { create } from 'zustand'
import type { Medal } from '../types/medal'

interface MedalState {
  medals: Medal[]
  fetchMedals: () => Promise<void>
}

export const useMedalStore = create<MedalState>((set) => ({
  medals: [],
  fetchMedals: async () => {
    const medals = (await window.medalAPI.getAll()) as Medal[]
    set({ medals })
  },
}))
