import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): void {
  const iconPath = join(app.getAppPath(), 'resources', 'icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  tray.setToolTip('Quest Board')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}
