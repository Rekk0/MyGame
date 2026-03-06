import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface HudConfig {
  lastResetDate?: string
  hudX?: number
  hudY?: number
  hudLocked?: boolean
  hudPinned?: boolean
  questHudX?: number
  questHudY?: number
  questHudLocked?: boolean
}

function configPath(): string {
  return join(app.getPath('userData'), 'quest-board-config.json')
}

export function readHudConfig(): HudConfig {
  const p = configPath()
  if (!existsSync(p)) return {}
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return {} }
}

export function writeHudConfig(patch: Partial<HudConfig>): void {
  const current = readHudConfig()
  writeFileSync(configPath(), JSON.stringify({ ...current, ...patch }))
}
