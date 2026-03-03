import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '../../src/types/ipc'
import { showHud, hideHud } from '../windows/hudWindow'

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC.WINDOW_SHOW_MAIN, () => {
    mainWindow.show()
    mainWindow.focus()
  })
  ipcMain.handle(IPC.WINDOW_HIDE_MAIN, () => mainWindow.hide())
  ipcMain.handle(IPC.WINDOW_SHOW_HUD, () => showHud())
  ipcMain.handle(IPC.WINDOW_HIDE_HUD, () => hideHud())
}
