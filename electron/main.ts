import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { runMigrations } from './services/db/index'
import { registerAllHandlers } from './ipc/index'
import { getPlayer, resetDailyEp } from './services/db/repositories/playerRepo'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.questboard.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  runMigrations()
  registerAllHandlers()

  const configPath = join(app.getPath('userData'), 'quest-board-config.json')
  const config: { lastResetDate?: string } = existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, 'utf-8'))
    : {}
  const today = new Date().toISOString().slice(0, 10)
  if (config.lastResetDate !== today) {
    if (getPlayer()) resetDailyEp()
    writeFileSync(configPath, JSON.stringify({ lastResetDate: today }))
  }

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
