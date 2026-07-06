import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { IPC } from '../../src/types/ipc'
import { readHudConfig, writeHudConfig } from '../services/hudConfig'

let companionWindow: BrowserWindow | null = null
const W = 260, H = 320

export function createCompanionWindow(): BrowserWindow {
  const { x: ax, y: ay, width, height } = screen.getPrimaryDisplay().workArea
  const cfg = readHudConfig()
  const x = cfg.companionX ?? ax + width - W - 24
  const y = cfg.companionY ?? ay + height - H - 24

  companionWindow = new BrowserWindow({
    width: W, height: H, x, y,
    frame: false, transparent: true, resizable: false,
    skipTaskbar: true,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false },
  })
  companionWindow.setAlwaysOnTop(true, 'screen-saver')

  if (is.dev && process.env['ELECTRON_RENDERER_URL'])
    companionWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/companion.html`)
  else
    companionWindow.loadFile(join(__dirname, '../renderer/companion.html'))
  return companionWindow
}

export function showCompanion(): void { companionWindow?.show() }
export function hideCompanion(): void { companionWindow?.hide() }
export function getCompanionWindow(): BrowserWindow | null { return companionWindow }
export function pushCompanionReply(reply: unknown): void {
  companionWindow?.webContents.send(IPC.COMPANION_REPLY_PUSHED, reply)
}
export { writeHudConfig }
