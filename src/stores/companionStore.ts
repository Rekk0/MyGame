import { create } from 'zustand'
import type { CompanionReply } from '../../electron/services/companion/types'

interface CompanionStore {
  reply: CompanionReply | null
  setReply: (r: CompanionReply | null) => void
}

export const useCompanionStore = create<CompanionStore>((set) => ({
  reply: null,
  setReply: (r) => set({ reply: r }),
}))
