import { create } from 'zustand'

export type Theme = 'dark' | 'light'

interface UIStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  },
}))
