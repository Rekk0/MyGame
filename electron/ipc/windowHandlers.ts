import { ipcMain, BrowserWindow, screen, shell } from 'electron'
import { IPC } from '../../src/types/ipc'
import { showHud, hideHud, getHudWindow, notifyHudUpdate } from '../windows/hudWindow'
import { showQuestHud, hideQuestHud, getQuestHudWindow } from '../windows/questHudWindow'
import { showCompanion, hideCompanion } from '../windows/companionWindow'
import { showQuickInput, hideQuickInput } from '../windows/quickInput'
import { readHudConfig, writeHudConfig } from '../services/hudConfig'
import { rest, sleep } from '../services/db/repositories/playerRepo'
import { getAllQuests } from '../services/db/repositories/questRepo'
import { pickRecommended } from '../services/companion/policy'

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
  ipcMain.handle(IPC.WINDOW_SHOW_COMPANION, () => showCompanion())
  ipcMain.handle(IPC.WINDOW_HIDE_COMPANION, () => hideCompanion())

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
    const [x, y] = clamp(rx, ry, 220, 128)  // fixed logical size, avoid getSize() drift
    win.setPosition(x, y)
    win.setSize(220, 128)  // reset physical drift caused by setPosition on fractional DPI
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
    const [x, y] = clamp(rx, ry, 220, 200)  // fixed logical size, avoid getSize() drift
    win.setPosition(x, y)
    win.setSize(220, 200)  // reset physical drift caused by setPosition on fractional DPI
    questHudLastPos = { x, y }
    writeHudConfig({ questHudX: x, questHudY: y })
  })

  ipcMain.handle(IPC.WINDOW_GET_HUD_CONFIG, () => readHudConfig())
  ipcMain.handle(IPC.WINDOW_SAVE_HUD_CONFIG, (_e, patch: object) => {
    writeHudConfig(patch)
    const cfg = readHudConfig()
    getHudWindow()?.webContents.send(IPC.WINDOW_HUD_CONFIG_CHANGED, cfg)
    getQuestHudWindow()?.webContents.send(IPC.WINDOW_HUD_CONFIG_CHANGED, cfg)
  })

  ipcMain.handle(IPC.WINDOW_SET_HUD_IGNORE_MOUSE, (_e, ignore: boolean) => {
    getHudWindow()?.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.handle(IPC.WINDOW_SET_QUEST_HUD_IGNORE_MOUSE, (_e, ignore: boolean) => {
    getQuestHudWindow()?.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.handle(IPC.WINDOW_SET_HUD_PINNED, (_e, pinned: boolean) => {
    const win = getHudWindow()
    if (!win) return
    if (pinned) win.setAlwaysOnTop(true, 'screen-saver')
    else win.setAlwaysOnTop(false)
    writeHudConfig({ hudPinned: pinned })
  })

  ipcMain.handle(IPC.WINDOW_SET_QUEST_HUD_PINNED, (_e, pinned: boolean) => {
    const win = getQuestHudWindow()
    if (!win) return
    if (pinned) win.setAlwaysOnTop(true, 'screen-saver')
    else win.setAlwaysOnTop(false)
    writeHudConfig({ questHudPinned: pinned })
  })

  ipcMain.handle(IPC.COMPANION_RUN_ACTION, (_e, action: string) => {
    const navigateMain = (payload: object): void => {
      mainWindow.webContents.send(IPC.COMPANION_NAVIGATE, payload)
    }
    switch (action) {
      case 'rest': { rest(); notifyHudUpdate(); return }
      case 'sleep': { sleep(8); notifyHudUpdate(); return }
      case 'add_task': return showQuickInput()
      case 'view_plot': { mainWindow.show(); mainWindow.focus(); navigateMain({ target: 'plot' }); return }
      case 'record_mood': { mainWindow.show(); mainWindow.focus(); navigateMain({ target: 'mood' }); return }
      case 'recommend_liked':
      case 'recommend_task': {
        const q = pickRecommended(getAllQuests() as never[], action === 'recommend_liked' ? 'like' : 'easy')
        mainWindow.show(); mainWindow.focus(); navigateMain({ target: 'quest', questId: q?.id ?? null }); return
      }
    }
  })

  ipcMain.handle(IPC.SHELL_OPEN_EXTERNAL, (_e, url: string) => {
    shell.openExternal(url)
  })
}
