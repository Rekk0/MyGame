import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import {
  getPlayer,
  createPlayer,
  addXp,
  addGold,
  consumeEp,
  resetDailyEp,
} from '../services/db/repositories/playerRepo'

export function registerPlayerHandlers(): void {
  ipcMain.handle(IPC.PLAYER_GET, () => getPlayer())

  ipcMain.handle(IPC.PLAYER_CREATE, (_e, name: string) => createPlayer(name))

  ipcMain.handle(IPC.PLAYER_ADD_XP, async (_e, amount: number) => {
    const result = addXp(amount)
    const player = getPlayer()!
    return { player, ...result }
  })

  ipcMain.handle(IPC.PLAYER_ADD_GOLD, (_e, amount: number) => addGold(amount))

  ipcMain.handle(IPC.PLAYER_CONSUME_EP, (_e, amount: number) => consumeEp(amount))

  ipcMain.handle(IPC.PLAYER_RESET_EP, () => resetDailyEp())
}
