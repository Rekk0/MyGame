import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { readHudConfig, writeHudConfig } from '../services/hudConfig'

let questHudWindow: BrowserWindow | null = null

export function createQuestHudWindow(): BrowserWindow {
  const { width } = screen.getPrimaryDisplay().workAreaSize
  const config = readHudConfig()
  const x = config.questHudX ?? width - 240
  const y = config.questHudY ?? 148

  questHudWindow = new BrowserWindow({
    width: 220,
    height: 200,
    minWidth: 220,
    maxWidth: 220,
    minHeight: 200,
    maxHeight: 200,
    x,
    y,
    alwaysOnTop: true,
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

  questHudWindow.on('moved', () => {
    if (!questHudWindow) return
    const [wx, wy] = questHudWindow.getPosition()
    writeHudConfig({ questHudX: wx, questHudY: wy })
  })

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
