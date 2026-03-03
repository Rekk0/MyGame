import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { runMigrations } from './services/db/index'
import { registerAllHandlers } from './ipc/index'
import { getAllPlayers, resetDailyEp } from './services/db/repositories/playerRepo'
import { createMainWindow } from './windows/mainWindow'
import { createTray } from './tray'

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
    if (getAllPlayers().length > 0) resetDailyEp()
    writeFileSync(configPath, JSON.stringify({ lastResetDate: today }))
  }

  const mainWindow = createMainWindow()
  createTray(mainWindow)

  app.on('activate', () => {
    mainWindow.show()
    mainWindow.focus()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
