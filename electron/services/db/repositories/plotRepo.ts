import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../index'
import { plotLogs } from '../schema'
import { getActivePlayerId } from './playerRepo'

type PlotLog = typeof plotLogs.$inferSelect
type PlotType = 'daily' | 'weekly'

function pid(): string {
  return getActivePlayerId()
}

export function getDailyKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getWeeklyKey(): string {
  const d = new Date()
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  const y = monday.getFullYear()
  const jan4 = new Date(y, 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() || 7) - 1))
  const diff = monday.getTime() - startOfWeek1.getTime()
  const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
  return `${y}-W${String(weekNum).padStart(2, '0')}`
}

export function getPlotLog(type: PlotType, periodKey: string): PlotLog | undefined {
  return db.select().from(plotLogs)
    .where(and(
      eq(plotLogs.playerId, pid()),
      eq(plotLogs.type, type),
      eq(plotLogs.periodKey, periodKey)
    ))
    .get()
}

export function createPlotLog(type: PlotType, periodKey: string, summary: string): PlotLog {
  const id = randomUUID()
  db.insert(plotLogs).values({ id, playerId: pid(), type, periodKey, summary }).run()
  return db.select().from(plotLogs).where(eq(plotLogs.id, id)).get()!
}

export function countPlotLogs(type: PlotType): number {
  return db.select().from(plotLogs)
    .where(and(eq(plotLogs.playerId, pid()), eq(plotLogs.type, type)))
    .all()
    .length
}
