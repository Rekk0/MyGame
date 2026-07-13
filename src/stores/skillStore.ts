import { create } from 'zustand'
import type { Skill } from '../types/skill'
import type { DivinationState, SkillPreview } from '../types/profile'

interface SkillState {
  skills: Skill[]
  divination: DivinationState
  previews: SkillPreview[]
  generating: boolean
  genError: string | null
  fetchSkills: () => Promise<void>
  fetchDivination: () => Promise<void>
  divine: () => Promise<void>
  acceptHead: () => Promise<void>
  rejectHead: () => Promise<void>
  clearPreviews: () => void
}

const EMPTY_DIVINATION: DivinationState = { hasProfile: false, claimed: false, divinationsLeft: 0 }

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  divination: EMPTY_DIVINATION,
  previews: [],
  generating: false,
  genError: null,

  fetchSkills: async () => {
    const skills = await window.skillAPI.getAll()
    set({ skills })
  },

  fetchDivination: async () => {
    const divination = await window.skillAPI.getDivinationState()
    set({ divination })
  },

  divine: async () => {
    set({ generating: true, genError: null })
    try {
      const { error, previews } = await window.skillAPI.generate()
      await get().fetchDivination()
      set({ previews, genError: error, generating: false })
    } catch {
      set({ generating: false, genError: 'ai-failed' })
    }
  },

  acceptHead: async () => {
    const head = get().previews[0]
    if (!head) return
    await window.skillAPI.accept(head)
    await Promise.all([get().fetchSkills(), get().fetchDivination()])
    set((s) => ({ previews: s.previews.slice(1) }))
  },

  rejectHead: async () => {
    const head = get().previews[0]
    if (!head) return
    await window.skillAPI.reject(head.name)
    await get().fetchDivination()
    set((s) => ({ previews: s.previews.slice(1) }))
  },

  clearPreviews: () => set({ previews: [], genError: null }),
}))
