import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import { showHud, hideHud, isHudVisible } from './windows/hudWindow'
import { showQuestHud, hideQuestHud, isQuestHudVisible } from './windows/questHudWindow'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): void {
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(app.getAppPath(), 'resources', 'icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  tray.setToolTip('Quest Board')

  const showAll = () => {
    mainWindow.show()
    mainWindow.focus()
    showHud()
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: showAll },
    { label: '悬浮窗 显示/隐藏', click: () => isHudVisible() ? hideHud() : showHud() },
    { label: '任务列表 显示/隐藏', click: () => isQuestHudVisible() ? hideQuestHud() : showQuestHud() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', showAll)
}
