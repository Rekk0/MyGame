import { DDA } from './constants'

export type DdaState = 'anxious' | 'flow' | 'bored'

// 纯函数层：signals → C/S → 状态（含迟滞）。不碰 DB / Electron，可单测。
export interface Signals {
  pendingEnergyTotal: number // 近 3 日待办任务 E 值总量
  overdueCount: number // 过期未完成任务数
  avgDifficulty: number // 近 7 天完成任务平均 difficultyFactor（0.8~1.6）
  epPct: number // 三资源水位 0~1
  willPct: number
  spiritPct: number
  recentPace: number // 近 3 天完成节奏 0~1（只统计满 24h 或已到期的任务）
  streakCount: number
}

export interface DdaScores {
  challenge: number // C 0~1
  capacity: number // S 0~1
  ratio: number // C / max(S, eps)
}

export interface DdaSnapshot {
  state: DdaState
  pendingState: DdaState | null // 待确认的候选状态
  pendingCount: number // 候选连续成立次数
  challenge: number
  capacity: number
  lastEvalAt: string
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

export function computeScores(s: Signals): DdaScores {
  const backlog = clamp01(s.pendingEnergyTotal / DDA.backlogRefEp)
  const overdue = clamp01(s.overdueCount / DDA.overdueCap)
  const difficulty = clamp01((s.avgDifficulty - DDA.diffMin) / DDA.diffSpan)
  const challenge = clamp01(
    DDA.wBacklog * backlog + DDA.wOverdue * overdue + DDA.wDifficulty * difficulty
  )

  const resource = DDA.epWeight * s.epPct + DDA.willWeight * s.willPct + DDA.spiritWeight * s.spiritPct
  const streak = clamp01(s.streakCount / DDA.streakRef)
  const capacity = clamp01(DDA.wResource * resource + DDA.wPace * s.recentPace + DDA.wStreak * streak)

  const ratio = challenge / Math.max(capacity, DDA.eps)
  return { challenge, capacity, ratio }
}

export function rawState(ratio: number): DdaState {
  if (ratio > DDA.ratioUpper) return 'anxious'
  if (ratio < DDA.ratioLower) return 'bored'
  return 'flow'
}

// 带承载证据的状态：低挑战本身不等于无聊——空白新玩家（无清任务节奏）应判 flow 而非 bored。
export function deriveState(ratio: number, s: Signals): DdaState {
  const raw = rawState(ratio)
  if (raw === 'bored' && s.recentPace < DDA.boredMinPace) return 'flow'
  return raw
}

// 越界外裕量：满足则免「连续 2 次」直接切换
function hardCross(raw: DdaState, ratio: number): boolean {
  if (raw === 'anxious') return ratio > DDA.ratioUpper * (1 + DDA.hardMargin)
  if (raw === 'bored') return ratio < DDA.ratioLower * (1 - DDA.hardMargin)
  // flow：需稳稳落回中带内侧
  return ratio < DDA.ratioUpper * (1 - DDA.hardMargin) && ratio > DDA.ratioLower * (1 + DDA.hardMargin)
}

// 迟滞：状态切换需新状态连续 confirmEvals 次成立，或 ratio 越界外加裕量。
export function evaluate(s: Signals, prev: DdaSnapshot | null): Omit<DdaSnapshot, 'lastEvalAt'> {
  const { challenge, capacity, ratio } = computeScores(s)
  const raw = deriveState(ratio, s)
  const base = { challenge, capacity }

  if (!prev || raw === prev.state) {
    return { state: raw, pendingState: null, pendingCount: 0, ...base }
  }
  if (hardCross(raw, ratio)) {
    return { state: raw, pendingState: null, pendingCount: 0, ...base }
  }
  const count = prev.pendingState === raw ? prev.pendingCount + 1 : 1
  if (count >= DDA.confirmEvals) {
    return { state: raw, pendingState: null, pendingCount: 0, ...base }
  }
  return { state: prev.state, pendingState: raw, pendingCount: count, ...base }
}
