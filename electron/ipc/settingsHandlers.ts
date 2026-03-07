import { ipcMain, app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { IPC } from '../../src/types/ipc'

interface AIConfig {
  provider: string
  apiKey: string
  model: string
  autoTransform?: boolean
  language?: 'zh' | 'en'
  theme?: 'dark' | 'light'
}

function getConfigPath(): string {
  return join(app.getPath('userData'), 'ai-settings.json')
}

function readConfig(): AIConfig | null {
  const p = getConfigPath()
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return null }
}

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC.SETTINGS_GET_AI_CONFIG, () => readConfig())
  ipcMain.handle(IPC.SETTINGS_SET_AI_CONFIG, (_, config: AIConfig) => {
    writeFileSync(getConfigPath(), JSON.stringify(config))
  })
}
