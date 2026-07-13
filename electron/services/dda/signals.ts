import { and, eq, gte, ne } from 'drizzle-orm'
import { db } from '../db/index'
import { quests } from '../db/schema'
import { getActivePlayerId, getPlayer } from '../db/repositories/playerRepo'
import { getStreak } from '../db/repositories/streakRepo'
import { resolveRatings, difficultyFactor } from '../resources/settlement'
import { DDA } from './constants'
import type { Signals } from './score'

const DAY_MS = 86_400_000

function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function neutral(): Signals {
  return {
    pendingEnergyTotal: 0,
    overdueCount: 0,
    avgDifficulty: DDA.neutralDifficulty,
    epPct: 1,
    willPct: 1,
    spiritPct: 1,
    recentPace: DDA.neutralPace,
    streakCount: 0
  }
}

// 采集 v2 各信号原始指标（查库），交给 score.ts 纯函数计算 C/S。
export function collectSignals(): Signals {
  const pid = getActivePlayerId()
  const player = getPlayer()
  if (!pid || !player) return neutral()

  const now = Date.now()
  const threeDaysAgo = new Date(now - 3 * DAY_MS).toISOString()
  const sevenDaysAgo = new Date(now - 7 * DAY_MS).toISOString()
  const dayAgo = now - DAY_MS
  const today = localToday()

  const pending = db
    .select()
    .from(quests)
    .where(and(eq(quests.playerId, pid), ne(quests.status, 'completed')))
    .all()

  // 挑战：近 3 日待办 E 值总量
  const pendingEnergyTotal = pending
    .filter((q) => q.createdAt >= threeDaysAgo)
    .reduce((sum, q) => sum + resolveRatings(q).E, 0)

  // 挑战：过期未完成任务数（P1 产物，dueDate 只取日期语义，当天不算过期）
  const overdueCount = pending.filter((q) => q.dueDate != null && q.dueDate.slice(0, 10) < today).length

  // 挑战：近 7 天完成任务平均难度（低难度堆量 ≠ 高挑战）
  const doneRecent = db
    .select()
    .from(quests)
    .where(and(eq(quests.playerId, pid), eq(quests.status, 'completed')))
    .all()
    .filter((q) => (q.completedAt ?? q.createdAt) >= sevenDaysAgo)
  const avgDifficulty = doneRecent.length
    ? doneRecent.reduce((sum, q) => sum + difficultyFactor(resolveRatings(q)), 0) / doneRecent.length
    : DDA.neutralDifficulty

  // 承载：近 3 天完成节奏，只统计创建满 24h 或已到期的任务（修掉「建任务被罚」）
  const recent3 = db
    .select()
    .from(quests)
    .where(and(eq(quests.playerId, pid), gte(quests.createdAt, threeDaysAgo)))
    .all()
  const eligible = recent3.filter(
    (q) => Date.parse(q.createdAt) <= dayAgo || (q.dueDate != null && q.dueDate.slice(0, 10) < today)
  )
  const recentPace = eligible.length
    ? eligible.filter((q) => q.status === 'completed').length / eligible.length
    : DDA.neutralPace

  return {
    pendingEnergyTotal,
    overdueCount,
    avgDifficulty,
    epPct: player.ep / player.maxEp,
    willPct: player.willpower / player.maxWillpower,
    spiritPct: player.spirit / player.maxSpirit,
    recentPace,
    streakCount: getStreak()?.currentCount ?? 0
  }
}
