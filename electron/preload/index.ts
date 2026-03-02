import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../../src/types/ipc'

const questAPI = {
  create: (data: { originalText: string; dueDate?: string | null }) =>
    ipcRenderer.invoke(IPC.QUEST_CREATE, data),
  getAll: () => ipcRenderer.invoke(IPC.QUEST_GET_ALL),
  getById: (id: string) => ipcRenderer.invoke(IPC.QUEST_GET_BY_ID, id),
  update: (id: string, data: object) => ipcRenderer.invoke(IPC.QUEST_UPDATE, id, data),
  delete: (id: string) => ipcRenderer.invoke(IPC.QUEST_DELETE, id),
  complete: (id: string) => ipcRenderer.invoke(IPC.QUEST_COMPLETE, id),
}

const playerAPI = {
  get: () => ipcRenderer.invoke(IPC.PLAYER_GET),
  create: (name: string) => ipcRenderer.invoke(IPC.PLAYER_CREATE, name),
  addXp: (amount: number) => ipcRenderer.invoke(IPC.PLAYER_ADD_XP, amount),
  addGold: (amount: number) => ipcRenderer.invoke(IPC.PLAYER_ADD_GOLD, amount),
  consumeEp: (amount: number) => ipcRenderer.invoke(IPC.PLAYER_CONSUME_EP, amount),
  resetEp: () => ipcRenderer.invoke(IPC.PLAYER_RESET_EP),
}

const streakAPI = {
  get: () => ipcRenderer.invoke(IPC.STREAK_GET),
  record: () => ipcRenderer.invoke(IPC.STREAK_RECORD),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('questAPI', questAPI)
    contextBridge.exposeInMainWorld('playerAPI', playerAPI)
    contextBridge.exposeInMainWorld('streakAPI', streakAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.questAPI = questAPI
  // @ts-ignore
  window.playerAPI = playerAPI
  // @ts-ignore
  window.streakAPI = streakAPI
}
