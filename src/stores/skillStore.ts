import { create } from 'zustand'
import type { Skill } from '../types/skill'

interface SkillState {
  skills: Skill[]
  fetchSkills: () => Promise<void>
}

export const useSkillStore = create<SkillState>((set) => ({
  skills: [],

  fetchSkills: async () => {
    const skills = await window.skillAPI.getAll()
    set({ skills })
  },
}))
