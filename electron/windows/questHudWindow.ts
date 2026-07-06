import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { readHudConfig } from '../services/hudConfig'

let questHudWindow: BrowserWindow | null = null

export function createQuestHudWindow(): BrowserWindow {
  const { x: ax, y: ay, width } = screen.getPrimaryDisplay().workArea
  const config = readHudConfig()
  const x = config.questHudX ?? ax + width - 240
  const y = config.questHudY ?? ay + 148

  questHudWindow = new BrowserWindow({
    width: 220,
    height: 200,
    minWidth: 220,
    maxWidth: 220,
    minHeight: 200,
    maxHeight: 200,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Default pinned=true for backwards compatibility; only skip if explicitly false
  const isQuestPinned = config.questHudPinned !== false
  if (isQuestPinned) questHudWindow.setAlwaysOnTop(true, 'screen-saver')

  if (config.questHudLocked) {
    questHudWindow.setIgnoreMouseEvents(true, { forward: true })
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    questHudWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/questHud.html`)
  } else {
    questHudWindow.loadFile(join(__dirname, '../renderer/questHud.html'))
  }

  return questHudWindow
}

export function showQuestHud(): void { questHudWindow?.show() }
export function hideQuestHud(): void { questHudWindow?.hide() }
export function isQuestHudVisible(): boolean { return questHudWindow?.isVisible() ?? false }
export function getQuestHudWindow(): BrowserWindow | null { return questHudWindow }
