import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { getStreak, recordActivity } from '../services/db/repositories/streakRepo'

export function registerStreakHandlers(): void {
  ipcMain.handle(IPC.STREAK_GET, () => getStreak())

  ipcMain.handle(IPC.STREAK_RECORD, () => recordActivity())
}
