import { ipcMain, BrowserWindow, screen } from 'electron'
import { IPC } from '../../src/types/ipc'
import { showHud, hideHud, getHudWindow } from '../windows/hudWindow'
import { showQuestHud, hideQuestHud, getQuestHudWindow } from '../windows/questHudWindow'
import { showQuickInput, hideQuickInput } from '../windows/quickInput'
import { readHudConfig, writeHudConfig } from '../services/hudConfig'

// Authoritative last-set positions — avoids DPI round-trip drift from win.getPosition()
let hudLastPos: { x: number; y: number } | null = null
let questHudLastPos: { x: number; y: number } | null = null

function clamp(x: number, y: number, w: number, h: number): [number, number] {
  const { x: ax, y: ay, width, height } = screen.getPrimaryDisplay().workArea
  return [
    Math.max(ax, Math.min(ax + width - w, Math.round(x))),
    Math.max(ay, Math.min(ay + height - h, Math.round(y))),
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
    if (hudLastPos) return hudLastPos
    const [x, y] = win.getPosition()
    return { x, y }
  })

  ipcMain.handle(IPC.WINDOW_SET_HUD_POSITION, (_e, rx: number, ry: number) => {
    const win = getHudWindow()
    if (!win) return
    const [w, h] = win.getSize()
    const [x, y] = clamp(rx, ry, w, h)
    win.setPosition(x, y)
    hudLastPos = { x, y }
    writeHudConfig({ hudX: x, hudY: y })
  })

  ipcMain.handle(IPC.WINDOW_GET_QUEST_HUD_POSITION, () => {
    const win = getQuestHudWindow()
    if (!win) return null
    if (questHudLastPos) return questHudLastPos
    const [x, y] = win.getPosition()
    return { x, y }
  })

  ipcMain.handle(IPC.WINDOW_SET_QUEST_HUD_POSITION, (_e, rx: number, ry: number) => {
    const win = getQuestHudWindow()
    if (!win) return
    const [w, h] = win.getSize()
    const [x, y] = clamp(rx, ry, w, h)
    win.setPosition(x, y)
    questHudLastPos = { x, y }
    writeHudConfig({ questHudX: x, questHudY: y })
  })

  ipcMain.handle(IPC.WINDOW_GET_HUD_CONFIG, () => readHudConfig())
  ipcMain.handle(IPC.WINDOW_SAVE_HUD_CONFIG, (_e, patch: object) => writeHudConfig(patch))
}
