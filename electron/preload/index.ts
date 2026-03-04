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
  showQuickInput: () => ipcRenderer.invoke(IPC.WINDOW_SHOW_QUICK_INPUT),
  hideQuickInput: () => ipcRenderer.invoke(IPC.WINDOW_HIDE_QUICK_INPUT),
}

const dataAPI = {
  onUpdated: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IPC.DATA_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC.DATA_UPDATED, handler)
  },
}

const aiAPI = {
  transformQuest: (args: { originalText: string; worldStyle: string }) =>
    ipcRenderer.invoke(IPC.AI_TRANSFORM_QUEST, args),
}

const settingsAPI = {
  getAiConfig: () => ipcRenderer.invoke(IPC.SETTINGS_GET_AI_CONFIG),
  setAiConfig: (config: { provider: string; apiKey: string; model: string }) =>
    ipcRenderer.invoke(IPC.SETTINGS_SET_AI_CONFIG, config),
}

const achievementAPI = {
  getAll: () => ipcRenderer.invoke(IPC.ACHIEVEMENT_GET_ALL),
  getUnlocked: () => ipcRenderer.invoke(IPC.ACHIEVEMENT_GET_UNLOCKED),
  onShow: (callback: (achievement: unknown) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, achievement: unknown) => callback(achievement)
    ipcRenderer.on(IPC.ACHIEVEMENT_SHOW, handler)
    return () => ipcRenderer.removeListener(IPC.ACHIEVEMENT_SHOW, handler)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('questAPI', questAPI)
    contextBridge.exposeInMainWorld('playerAPI', playerAPI)
    contextBridge.exposeInMainWorld('streakAPI', streakAPI)
    contextBridge.exposeInMainWorld('windowAPI', windowAPI)
    contextBridge.exposeInMainWorld('dataAPI', dataAPI)
    contextBridge.exposeInMainWorld('aiAPI', aiAPI)
    contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)
    contextBridge.exposeInMainWorld('achievementAPI', achievementAPI)
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
  // @ts-ignore
  window.aiAPI = aiAPI
  // @ts-ignore
  window.settingsAPI = settingsAPI
  // @ts-ignore
  window.achievementAPI = achievementAPI
}
