import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { getAllAchievements, getUnlockedAchievements } from '../services/db/repositories/achievementRepo'

export function registerAchievementHandlers(): void {
  ipcMain.handle(IPC.ACHIEVEMENT_GET_ALL, () => getAllAchievements())
  ipcMain.handle(IPC.ACHIEVEMENT_GET_UNLOCKED, () => getUnlockedAchievements())
}
