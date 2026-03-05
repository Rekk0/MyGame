import { app, globalShortcut } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { runMigrations } from './services/db/index'
import { registerAllHandlers } from './ipc/index'
import { registerWindowHandlers } from './ipc/windowHandlers'
import { getAllPlayers, resetDailyEp } from './services/db/repositories/playerRepo'
import { initAchievements } from './services/db/repositories/achievementRepo'
import { initSkills } from './services/db/repositories/skillRepo'
import { createMainWindow } from './windows/mainWindow'
import { createHudWindow, showHud } from './windows/hudWindow'
import { createQuickInputWindow, toggleQuickInput } from './windows/quickInput'
import { createAchievementWindow } from './windows/achievementWindow'
import { createTray } from './tray'
import { startStreakWarningScheduler } from './services/notification'

let isQuitting = false

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.questboard.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  runMigrations()
  registerAllHandlers()
  getAllPlayers().forEach((p) => { initAchievements(p.id); initSkills(p.id) })

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
  createHudWindow()
  createQuickInputWindow()
  createAchievementWindow()
  createTray(mainWindow)
  registerWindowHandlers(mainWindow)
  globalShortcut.register('Ctrl+Shift+Q', toggleQuickInput)
  startStreakWarningScheduler()

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  app.on('activate', () => {
    mainWindow.show()
    mainWindow.focus()
    showHud()
  })
})

app.on('before-quit', () => { isQuitting = true })
app.on('will-quit', () => { globalShortcut.unregisterAll() })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
