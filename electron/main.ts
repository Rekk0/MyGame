import { app, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import { appendFileSync } from 'fs'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { runMigrations } from './services/db/index'
import { registerAllHandlers } from './ipc/index'
import { registerWindowHandlers } from './ipc/windowHandlers'
import { getAllPlayers, sleep } from './services/db/repositories/playerRepo'
import { initAchievements } from './services/db/repositories/achievementRepo'
import { initSkills } from './services/db/repositories/skillRepo'
import { createMainWindow } from './windows/mainWindow'
import { createHudWindow, showHud } from './windows/hudWindow'
import { createQuestHudWindow } from './windows/questHudWindow'
import { createQuickInputWindow } from './windows/quickInput'
import { createAchievementWindow } from './windows/achievementWindow'
import { createCompanionWindow } from './windows/companionWindow'
import { readHudConfig, writeHudConfig } from './services/hudConfig'
import { readAiConfig } from './ipc/settingsHandlers'
import { registerQuickInputShortcut } from './services/shortcutManager'
import { createTray } from './tray'
import { startStreakWarningScheduler } from './services/notification'
import { startCompanionScheduler, evaluate } from './services/companion/scheduler'
import { COMPANION_ENABLED } from './services/companion/constants'
import { migrateLegacyUserDataFile } from './services/legacyMigration'
import { recomputeProfile } from './services/resources/profile'

let isQuitting = false

function logError(err: unknown): void {
  const logPath = join(app.getPath('userData'), 'startup-error.log')
  const msg = `[${new Date().toISOString()}] ${err instanceof Error ? err.stack : String(err)}\n`
  try { appendFileSync(logPath, msg) } catch { /* ignore */ }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.mygame.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  try {
    // AI provider config + API key survives the quest-board → my-game rename.
    migrateLegacyUserDataFile('ai-settings.json')
    runMigrations()
    registerAllHandlers()
    getAllPlayers().forEach((p) => { initAchievements(p.id); initSkills(p.id) })

    const config = readHudConfig()
    const today = new Date().toISOString().slice(0, 10)
    if (config.lastResetDate !== today) {
      if (getAllPlayers().length > 0) {
        sleep(8)
        try { recomputeProfile() } catch { /* ignore */ }
      }
      writeHudConfig({ lastResetDate: today })
    }

    const mainWindow = createMainWindow()
    createHudWindow()
    createQuestHudWindow()
    createQuickInputWindow()
    createAchievementWindow()
    if (COMPANION_ENABLED) createCompanionWindow()
    createTray(mainWindow)
    registerWindowHandlers(mainWindow)
    const aiCfg = readAiConfig()
    registerQuickInputShortcut(aiCfg?.quickInputHotkey)
    startStreakWarningScheduler()
    startCompanionScheduler()
    void evaluate('startup')

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
  } catch (err) {
    logError(err)
    dialog.showErrorBox(
      '游纪 启动失败',
      `错误信息已写入：\n${join(app.getPath('userData'), 'startup-error.log')}\n\n${err instanceof Error ? err.message : String(err)}`
    )
    app.quit()
  }
})

app.on('before-quit', () => { isQuitting = true })
app.on('will-quit', () => { globalShortcut.unregisterAll() })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
