import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { moodToSpiritDelta } from '../services/resources/calibration'
import { applyResourceDeltas } from '../services/db/repositories/playerRepo'
import { logEvent } from '../services/db/repositories/resourceRepo'
import { notifyHudUpdate } from '../windows/hudWindow'

export function registerResourceHandlers(): void {
  ipcMain.handle(IPC.MOOD_RECORD, (_e, score: number) => {
    const spirit = moodToSpiritDelta(score)
    const player = applyResourceDeltas({ spirit })
    logEvent({ source: 'mood', energyDelta: 0, willpowerDelta: 0, spiritDelta: spirit })
    notifyHudUpdate()
    return player
  })
}
