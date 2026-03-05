import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import {
  getPlayer,
  getAllPlayers,
  createPlayer,
  switchPlayer,
  deletePlayer,
  addXp,
  addGold,
  consumeEp,
  resetDailyEp,
} from '../services/db/repositories/playerRepo'
import type { WorldStyle } from '../../src/types/player'
import { notifyHudUpdate } from '../windows/hudWindow'
import { initAchievements } from '../services/db/repositories/achievementRepo'
import { initSkills } from '../services/db/repositories/skillRepo'

export function registerPlayerHandlers(): void {
  ipcMain.handle(IPC.PLAYER_GET, () => getPlayer())

  ipcMain.handle(IPC.PLAYER_GET_ALL, () => getAllPlayers())

  ipcMain.handle(IPC.PLAYER_CREATE, (_e, name: string, worldStyle: WorldStyle) => {
    const player = createPlayer(name, worldStyle)
    initAchievements(player.id)
    initSkills(player.id)
    return player
  })

  ipcMain.handle(IPC.PLAYER_SWITCH, (_e, id: string) => {
    const result = switchPlayer(id)
    notifyHudUpdate()
    return result
  })

  ipcMain.handle(IPC.PLAYER_DELETE, (_e, id: string) => {
    deletePlayer(id)
    notifyHudUpdate()
    return getPlayer()
  })

  ipcMain.handle(IPC.PLAYER_ADD_XP, async (_e, amount: number) => {
    const result = addXp(amount)
    const player = getPlayer()!
    return { player, ...result }
  })

  ipcMain.handle(IPC.PLAYER_ADD_GOLD, (_e, amount: number) => addGold(amount))

  ipcMain.handle(IPC.PLAYER_CONSUME_EP, (_e, amount: number) => consumeEp(amount))

  ipcMain.handle(IPC.PLAYER_RESET_EP, () => {
    resetDailyEp()
    notifyHudUpdate()
    return getPlayer()
  })
}
