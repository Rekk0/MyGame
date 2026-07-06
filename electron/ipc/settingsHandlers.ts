import { ipcMain, app, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { IPC } from '../../src/types/ipc'
import { registerQuickInputShortcut } from '../services/shortcutManager'
import type { Proactivity } from '../services/companion/types'

interface AIConfig {
  provider: string
  apiKey: string
  model: string
  autoTransform?: boolean
  language?: 'zh' | 'en'
  theme?: 'dark' | 'light'
  quickInputHotkey?: string
  companionProactivity?: 'high' | 'medium' | 'low'
}

function getConfigPath(): string {
  return join(app.getPath('userData'), 'ai-settings.json')
}

export function readAiConfig(): AIConfig | null {
  const p = getConfigPath()
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return null }
}

export function getProactivity(): Proactivity {
  return (readAiConfig()?.companionProactivity ?? 'medium')
}

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC.SETTINGS_GET_AI_CONFIG, () => readAiConfig())
  ipcMain.handle(IPC.SETTINGS_SET_AI_CONFIG, (_, config: AIConfig) => {
    writeFileSync(getConfigPath(), JSON.stringify(config))
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send(IPC.SETTINGS_LANGUAGE_CHANGED, config.language)
    )
    registerQuickInputShortcut(config.quickInputHotkey)
  })
}
