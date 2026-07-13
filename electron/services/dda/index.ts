import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { getActivePlayerId } from '../db/repositories/playerRepo'
import { getStreak } from '../db/repositories/streakRepo'
import { collectSignals } from './signals'
import { evaluate, type DdaState, type DdaSnapshot } from './score'
import { DDA } from './constants'

export type { DdaState }

type StateFile = Record<string, DdaSnapshot>

function statePath(): string {
  return join(app.getPath('userData'), 'dda-state.json')
}

function readAll(): StateFile {
  const p = statePath()
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return {}
  }
}

function runEval(pid: string): DdaSnapshot {
  const all = readAll()
  const next = evaluate(collectSignals(), all[pid] ?? null)
  const snap: DdaSnapshot = { ...next, lastEvalAt: new Date().toISOString() }
  all[pid] = snap
  writeFileSync(statePath(), JSON.stringify(all))
  return snap
}

const IDLE: DdaSnapshot = {
  state: 'flow',
  pendingState: null,
  pendingCount: 0,
  challenge: 0,
  capacity: 1,
  lastEvalAt: ''
}

// 只有真实事件（force）或快照陈旧（超过 debounce）才重新评估并推进迟滞计数；
// 期内的纯 UI 轮询复用快照，不重评、不推进计数。
function currentSnapshot(force: boolean): DdaSnapshot {
  const pid = getActivePlayerId()
  if (!pid) return IDLE
  const prev = readAll()[pid]
  const stale = !prev || Date.now() - Date.parse(prev.lastEvalAt) > DDA.debounceMs
  return force || stale ? runEval(pid) : prev
}

export function analyzePlayerState(force = false): DdaState {
  return currentSnapshot(force).state
}

export function getDdaAdjustment(state: DdaState): { xpMultiplier: number; suggestion: string } {
  if (state === 'anxious') return { xpMultiplier: 1.5, suggestion: '全力鏖战，不妨拆解强敌' }
  if (state === 'bored') return { xpMultiplier: 0.8, suggestion: '余力充沛，可迎更强之敌' }
  return { xpMultiplier: 1.0, suggestion: '心流正盛，保持节奏' }
}

export function getStreakMultiplier(): number {
  const count = getStreak()?.currentCount ?? 0
  if (count >= 30) return 1.25
  if (count >= 7) return 1.1
  return 1.0
}

// DDA_GET_STATE 用：只读快照 + 附加 challenge/capacity（P3 状态框可显示双色微条）。
export function getDdaState(): {
  state: DdaState
  xpMultiplier: number
  suggestion: string
  challenge: number
  capacity: number
} {
  const snap = currentSnapshot(false)
  return { state: snap.state, ...getDdaAdjustment(snap.state), challenge: snap.challenge, capacity: snap.capacity }
}
