import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { getStreak, recordActivity } from '../services/db/repositories/streakRepo'
import { notifyHudUpdate } from '../windows/hudWindow'

export function registerStreakHandlers(): void {
  ipcMain.handle(IPC.STREAK_GET, () => getStreak())

  ipcMain.handle(IPC.STREAK_RECORD, () => {
    const result = recordActivity()
    notifyHudUpdate()
    return result
  })
}
