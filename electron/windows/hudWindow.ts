import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { IPC } from '../../src/types/ipc'
import { readHudConfig } from '../services/hudConfig'

let hudWindow: BrowserWindow | null = null

export function createHudWindow(): BrowserWindow {
  const { x: ax, y: ay, width } = screen.getPrimaryDisplay().workArea
  const config = readHudConfig()
  const x = config.hudX ?? ax + width - 240
  const y = config.hudY ?? ay + 20

  hudWindow = new BrowserWindow({
    width: 220,
    height: 128,
    minWidth: 220,
    maxWidth: 220,
    minHeight: 128,
    maxHeight: 128,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    hudWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/hud.html`)
  } else {
    hudWindow.loadFile(join(__dirname, '../renderer/hud.html'))
  }

  return hudWindow
}

export function showHud(): void { hudWindow?.show() }
export function hideHud(): void { hudWindow?.hide() }
export function isHudVisible(): boolean { return hudWindow?.isVisible() ?? false }
export function getHudWindow(): BrowserWindow | null { return hudWindow }

export function notifyHudUpdate(): void {
  BrowserWindow.getAllWindows().forEach((win) => win.webContents.send(IPC.DATA_UPDATED))
}
