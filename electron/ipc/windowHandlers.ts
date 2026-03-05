import { ipcMain, BrowserWindow, screen } from 'electron'
import { IPC } from '../../src/types/ipc'
import { showHud, hideHud, getHudWindow } from '../windows/hudWindow'
import { showQuestHud, hideQuestHud, getQuestHudWindow } from '../windows/questHudWindow'
import { showQuickInput, hideQuickInput } from '../windows/quickInput'
import { readHudConfig, writeHudConfig } from '../services/hudConfig'

function clamp(x: number, y: number, w: number, h: number): [number, number] {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  return [
    Math.max(0, Math.min(width - w, Math.round(x))),
    Math.max(0, Math.min(height - h, Math.round(y))),
  ]
}

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC.WINDOW_SHOW_MAIN, () => { mainWindow.show(); mainWindow.focus() })
  ipcMain.handle(IPC.WINDOW_HIDE_MAIN, () => mainWindow.hide())
  ipcMain.handle(IPC.WINDOW_SHOW_HUD, () => showHud())
  ipcMain.handle(IPC.WINDOW_HIDE_HUD, () => hideHud())
  ipcMain.handle(IPC.WINDOW_SHOW_QUICK_INPUT, () => showQuickInput())
  ipcMain.handle(IPC.WINDOW_HIDE_QUICK_INPUT, () => hideQuickInput())
  ipcMain.handle(IPC.WINDOW_SHOW_QUEST_HUD, () => showQuestHud())
  ipcMain.handle(IPC.WINDOW_HIDE_QUEST_HUD, () => hideQuestHud())

  ipcMain.handle(IPC.WINDOW_GET_HUD_POSITION, () => {
    const win = getHudWindow()
    if (!win) return null
    const [x, y] = win.getPosition()
    return { x, y }
  })

  ipcMain.handle(IPC.WINDOW_SET_HUD_POSITION, (_e, rx: number, ry: number) => {
    const win = getHudWindow()
    if (!win) return
    const [w, h] = win.getSize()
    const [x, y] = clamp(rx, ry, w, h)
    win.setPosition(x, y)
    writeHudConfig({ hudX: x, hudY: y })
  })

  ipcMain.handle(IPC.WINDOW_GET_QUEST_HUD_POSITION, () => {
    const win = getQuestHudWindow()
    if (!win) return null
    const [x, y] = win.getPosition()
    return { x, y }
  })

  ipcMain.handle(IPC.WINDOW_SET_QUEST_HUD_POSITION, (_e, rx: number, ry: number) => {
    const win = getQuestHudWindow()
    if (!win) return
    const [w, h] = win.getSize()
    const [x, y] = clamp(rx, ry, w, h)
    win.setPosition(x, y)
    writeHudConfig({ questHudX: x, questHudY: y })
  })

  ipcMain.handle(IPC.WINDOW_GET_HUD_CONFIG, () => readHudConfig())
  ipcMain.handle(IPC.WINDOW_SAVE_HUD_CONFIG, (_e, patch: object) => writeHudConfig(patch))
}
