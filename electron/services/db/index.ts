import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'
import * as schema from './schema'
import { migrateLegacyUserDataFile } from '../legacyMigration'

const userDataPath = app.getPath('userData')
mkdirSync(userDataPath, { recursive: true })

migrateLegacyUserDataFile('my-game.db', 'quest-board.db')
const dbPath = join(userDataPath, 'my-game.db')
const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })

export function runMigrations(): void {
  const migrationsFolder = app.isPackaged
    ? join(process.resourcesPath, 'migrations')
    : join(app.getAppPath(), 'electron/services/db/migrations')
  migrate(db, { migrationsFolder })
}
