import { readHudConfig, writeHudConfig } from './hudConfig'
import { getAllPlayers, sleep } from './db/repositories/playerRepo'
import { recomputeProfile } from './resources/profile'
import { notifyHudUpdate } from '../windows/hudWindow'

const RESET_HOUR = 4 // 本地时间凌晨 4 点为「游戏日」分界

// 以本地时间凌晨 4 点为界的游戏日 key（YYYY-MM-DD）。
// 4 点前算作前一天，故先把时间回拨 RESET_HOUR 小时再取本地日期。
export function gameDayKey(now: Date = new Date()): string {
  const d = new Date(now.getTime() - RESET_HOUR * 60 * 60 * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 跨过本地 4 点进入新的游戏日时：精力回满、意志力小幅恢复（沿用 sleep(8)）。
export function applyDailyResetIfNeeded(): void {
  const key = gameDayKey()
  if (readHudConfig().lastResetDate === key) return
  if (getAllPlayers().length > 0) {
    sleep(8)
    try { recomputeProfile() } catch { /* ignore */ }
    notifyHudUpdate()
  }
  writeHudConfig({ lastResetDate: key })
}

// 运行中每 5 分钟检查一次，跨过本地 4 点时自动回满。
export function startDailyResetScheduler(): void {
  const CHECK_INTERVAL = 5 * 60 * 1000
  setInterval(applyDailyResetIfNeeded, CHECK_INTERVAL)
}
