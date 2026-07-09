import { ipcMain, dialog } from 'electron'
import { IPC } from '../../src/types/ipc'
import { generateImage } from '../services/ai/imageClient'
import {
  readImageGenConfig,
  writeImageGenConfig,
  getBackgroundPath,
  getBackgroundDataUrl,
  saveGeneratedBackground,
  saveUploadedBackground,
  clearBackground,
  type ImageGenConfig
} from '../services/backgroundConfig'

const WORLD_STYLES = ['realistic', 'wuxia', 'xianxia', 'fantasy', 'scifi', 'apocalypse']

export function registerBackgroundHandlers(): void {
  ipcMain.handle(IPC.BG_GET_CONFIG, () => {
    const worlds: Record<string, boolean> = {}
    for (const w of WORLD_STYLES) worlds[w] = getBackgroundPath(w) !== null
    return { config: readImageGenConfig(), worlds }
  })

  ipcMain.handle(IPC.BG_SET_CONFIG, (_, config: ImageGenConfig) => {
    writeImageGenConfig(config)
  })

  ipcMain.handle(IPC.BG_GENERATE, async (_, worldStyle: string, prompt: string) => {
    const image = await generateImage(prompt)
    saveGeneratedBackground(worldStyle, image)
    return getBackgroundDataUrl(worldStyle)
  })

  ipcMain.handle(IPC.BG_UPLOAD, async (_, worldStyle: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    if (!saveUploadedBackground(worldStyle, result.filePaths[0])) return null
    return getBackgroundDataUrl(worldStyle)
  })

  ipcMain.handle(IPC.BG_GET_IMAGE, (_, worldStyle: string) => getBackgroundDataUrl(worldStyle))

  ipcMain.handle(IPC.BG_CLEAR, (_, worldStyle: string) => {
    clearBackground(worldStyle)
  })
}
