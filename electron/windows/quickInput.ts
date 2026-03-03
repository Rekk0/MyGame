import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let quickInputWindow: BrowserWindow | null = null

export function createQuickInputWindow(): BrowserWindow {
  quickInputWindow = new BrowserWindow({
    width: 500,
    height: 80,
    center: true,
    frame: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  quickInputWindow.on('blur', () => { quickInputWindow?.hide() })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    quickInputWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/quickInput.html`)
  } else {
    quickInputWindow.loadFile(join(__dirname, '../renderer/quickInput.html'))
  }

  return quickInputWindow
}

export function toggleQuickInput(): void {
  if (!quickInputWindow) return
  if (quickInputWindow.isVisible()) {
    quickInputWindow.hide()
  } else {
    quickInputWindow.show()
    quickInputWindow.focus()
  }
}

export function hideQuickInput(): void { quickInputWindow?.hide() }

export function showQuickInput(): void {
  quickInputWindow?.show()
  quickInputWindow?.focus()
}
