import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { IPC } from '../../src/types/ipc'

let hudWindow: BrowserWindow | null = null

export function createHudWindow(): BrowserWindow {
  const { width } = screen.getPrimaryDisplay().workAreaSize

  hudWindow = new BrowserWindow({
    width: 200,
    height: 200,
    x: width - 220,
    y: 20,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    hudWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/hud.html`)
  } else {
    hudWindow.loadFile(join(__dirname, '../renderer/hud.html'))
  }

  return hudWindow
}

export function showHud(): void {
  hudWindow?.show()
}

export function hideHud(): void {
  hudWindow?.hide()
}

export function isHudVisible(): boolean {
  return hudWindow?.isVisible() ?? false
}

export function notifyHudUpdate(): void {
  hudWindow?.webContents.send(IPC.DATA_UPDATED)
}
