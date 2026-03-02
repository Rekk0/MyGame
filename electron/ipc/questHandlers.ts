import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import {
  createQuest,
  getAllQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
  completeQuest,
} from '../services/db/repositories/questRepo'

export function registerQuestHandlers(): void {
  ipcMain.handle(IPC.QUEST_CREATE, (_e, data: { originalText: string; dueDate?: string | null }) =>
    createQuest(data)
  )

  ipcMain.handle(IPC.QUEST_GET_ALL, () => getAllQuests())

  ipcMain.handle(IPC.QUEST_GET_BY_ID, (_e, id: string) => getQuestById(id))

  ipcMain.handle(IPC.QUEST_UPDATE, (_e, id: string, data: object) => updateQuest(id, data as never))

  ipcMain.handle(IPC.QUEST_DELETE, (_e, id: string) => deleteQuest(id))

  ipcMain.handle(IPC.QUEST_COMPLETE, (_e, id: string) => completeQuest(id))
}
