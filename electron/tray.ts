import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import { showHud, hideHud } from './windows/hudWindow'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): void {
  const iconPath = join(app.getAppPath(), 'resources', 'icon.png')
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
    { label: '显示悬浮窗', click: () => showHud() },
    { label: '隐藏悬浮窗', click: () => hideHud() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', showAll)
}
