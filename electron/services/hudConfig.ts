import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { migrateLegacyUserDataFile } from './legacyMigration'

export interface HudConfig {
  lastResetDate?: string
  hudX?: number
  hudY?: number
  hudLocked?: boolean
  hudPinned?: boolean
  questHudX?: number
  questHudY?: number
  questHudLocked?: boolean
  questHudPinned?: boolean
  hudBgOpacity?: number
  hudTextOpacity?: number
  companionX?: number
  companionY?: number
}

function configPath(): string {
  return join(app.getPath('userData'), 'my-game-config.json')
}

export function readHudConfig(): HudConfig {
  migrateLegacyUserDataFile('my-game-config.json', 'quest-board-config.json')
  const p = configPath()
  if (!existsSync(p)) return {}
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return {} }
}

export function writeHudConfig(patch: Partial<HudConfig>): void {
  const current = readHudConfig()
  writeFileSync(configPath(), JSON.stringify({ ...current, ...patch }))
}
