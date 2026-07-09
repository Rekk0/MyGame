import { create } from 'zustand'
import type { WorldStyle } from '../types/player'

interface BackgroundStore {
  bgUrl: string | null
  activeWorld: WorldStyle | null
  fetchBackground: (world: WorldStyle) => Promise<void>
  setBackground: (world: WorldStyle, url: string | null) => void
}

export const useBackgroundStore = create<BackgroundStore>((set, get) => ({
  bgUrl: null,
  activeWorld: null,
  fetchBackground: async (world) => {
    set({ activeWorld: world })
    const url = await window.backgroundAPI.getImage(world).catch(() => null)
    if (get().activeWorld === world) set({ bgUrl: url })
  },
  // Applied by settings after generate/upload/clear; only affects the active world's scene.
  setBackground: (world, url) => {
    if (get().activeWorld === world) set({ bgUrl: url })
  }
}))
