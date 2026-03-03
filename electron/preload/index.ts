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
  getAll: () => ipcRenderer.invoke(IPC.PLAYER_GET_ALL),
  create: (name: string, worldStyle: string) => ipcRenderer.invoke(IPC.PLAYER_CREATE, name, worldStyle),
  switch: (id: string) => ipcRenderer.invoke(IPC.PLAYER_SWITCH, id),
  delete: (id: string) => ipcRenderer.invoke(IPC.PLAYER_DELETE, id),
  addXp: (amount: number) => ipcRenderer.invoke(IPC.PLAYER_ADD_XP, amount),
  addGold: (amount: number) => ipcRenderer.invoke(IPC.PLAYER_ADD_GOLD, amount),
  consumeEp: (amount: number) => ipcRenderer.invoke(IPC.PLAYER_CONSUME_EP, amount),
  resetEp: () => ipcRenderer.invoke(IPC.PLAYER_RESET_EP),
}

const streakAPI = {
  get: () => ipcRenderer.invoke(IPC.STREAK_GET),
  record: () => ipcRenderer.invoke(IPC.STREAK_RECORD),
}

const windowAPI = {
  showMain: () => ipcRenderer.invoke(IPC.WINDOW_SHOW_MAIN),
  hideMain: () => ipcRenderer.invoke(IPC.WINDOW_HIDE_MAIN),
  showHud: () => ipcRenderer.invoke(IPC.WINDOW_SHOW_HUD),
  hideHud: () => ipcRenderer.invoke(IPC.WINDOW_HIDE_HUD),
}

const dataAPI = {
  onUpdated: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IPC.DATA_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC.DATA_UPDATED, handler)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('questAPI', questAPI)
    contextBridge.exposeInMainWorld('playerAPI', playerAPI)
    contextBridge.exposeInMainWorld('streakAPI', streakAPI)
    contextBridge.exposeInMainWorld('windowAPI', windowAPI)
    contextBridge.exposeInMainWorld('dataAPI', dataAPI)
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
  // @ts-ignore
  window.windowAPI = windowAPI
  // @ts-ignore
  window.dataAPI = dataAPI
}
