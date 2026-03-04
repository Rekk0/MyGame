import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { IPC } from '../../src/types/ipc'
import type { Achievement } from '../../src/types/achievement'

let achWindow: BrowserWindow | null = null

export function createAchievementWindow(): BrowserWindow {
  achWindow = new BrowserWindow({
    fullscreen: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    achWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/achievement.html`)
  } else {
    achWindow.loadFile(join(__dirname, '../renderer/achievement.html'))
  }

  return achWindow
}

export function showAchievementPopup(achievement: Achievement): void {
  if (!achWindow) return
  achWindow.show()
  achWindow.webContents.send(IPC.ACHIEVEMENT_SHOW, achievement)
  setTimeout(() => achWindow?.hide(), 4000)
}
