import { app } from 'electron'
import { join } from 'path'
import { existsSync, copyFileSync } from 'fs'

// The app's English name was changed from "quest-board" to "my-game". In dev this
// moved the userData dir (%APPDATA%/quest-board → %APPDATA%/my-game) and some files
// were renamed too. On first launch under the new name, copy any surviving file
// from the old location so existing users keep their data (db, HUD config, AI keys).
export function migrateLegacyUserDataFile(newName: string, oldName = newName): void {
  const target = join(app.getPath('userData'), newName)
  if (existsSync(target)) return
  const candidates = [
    join(app.getPath('appData'), 'quest-board', oldName),
    join(app.getPath('userData'), oldName)
  ]
  const legacy = candidates.find((p) => existsSync(p))
  if (legacy) copyFileSync(legacy, target)
}
