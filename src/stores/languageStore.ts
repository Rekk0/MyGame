import { create } from 'zustand'

export type Language = 'zh' | 'en'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'zh', // 永久默认值：中文
  setLanguage: (language) => set({ language }),
}))
