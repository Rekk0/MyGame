import { describe, it, expect } from 'vitest'
import { computeScores, deriveState, evaluate, rawState, type Signals, type DdaSnapshot } from './score'

const full: Omit<Signals, 'pendingEnergyTotal' | 'overdueCount' | 'recentPace'> = {
  avgDifficulty: 1.2,
  epPct: 1,
  willPct: 1,
  spiritPct: 1,
  streakCount: 0
}

function sig(over: Partial<Signals>): Signals {
  return {
    pendingEnergyTotal: 0,
    overdueCount: 0,
    recentPace: 0.6,
    ...full,
    ...over
  }
}

function snap(state: DdaSnapshot['state'], over: Partial<DdaSnapshot> = {}): DdaSnapshot {
  return { state, pendingState: null, pendingCount: 0, challenge: 0, capacity: 1, lastEvalAt: '', ...over }
}

describe('computeScores', () => {
  it('空数据新玩家 → 低挑战高承载，但无清任务节奏 → flow（非 bored）', () => {
    const s = sig({})
    const { challenge, capacity } = computeScores(s)
    expect(challenge).toBeLessThan(0.2)
    expect(capacity).toBeGreaterThan(0.7)
    expect(deriveState(computeScores(s).ratio, s)).toBe('flow')
  })

  it('高 E 待办堆积 + 低资源 → anxious', () => {
    const { ratio } = computeScores(
      sig({ pendingEnergyTotal: 400, overdueCount: 3, epPct: 0.1, willPct: 0.1, spiritPct: 0.2, recentPace: 0.2 })
    )
    expect(rawState(ratio)).toBe('anxious')
  })

  it('全完成 + 低难度 + 满资源 → bored', () => {
    const { ratio } = computeScores(sig({ avgDifficulty: 0.8, recentPace: 1, streakCount: 30 }))
    expect(rawState(ratio)).toBe('bored')
  })
})

describe('evaluate 迟滞', () => {
  it('无前态 → 直接采用原始状态', () => {
    const r = evaluate(sig({ pendingEnergyTotal: 400, overdueCount: 3, epPct: 0.1, willPct: 0.1 }), null)
    expect(r.state).toBe('anxious')
  })

  it('边界内小幅抖动 → 状态不切换（第一次候选不切）', () => {
    // 从 flow 出发，一次轻微越界（非 hardCross）→ 保持 flow，记候选
    const s = sig({ pendingEnergyTotal: 250, overdueCount: 1, epPct: 0.6, willPct: 0.6, recentPace: 0.5 })
    const r = evaluate(s, snap('flow'))
    expect(r.state).toBe('flow')
    expect(r.pendingState).not.toBeNull()
    expect(r.pendingCount).toBe(1)
  })

  it('候选连续 2 次成立 → 切换', () => {
    const s = sig({ pendingEnergyTotal: 250, overdueCount: 1, epPct: 0.6, willPct: 0.6, recentPace: 0.5 })
    const first = evaluate(s, snap('flow'))
    const second = evaluate(s, { ...snap('flow'), pendingState: first.pendingState, pendingCount: first.pendingCount })
    expect(second.state).toBe(first.pendingState)
  })

  it('越界外加裕量 → 免连续确认直接切换', () => {
    const s = sig({ pendingEnergyTotal: 500, overdueCount: 3, epPct: 0.05, willPct: 0.05, spiritPct: 0.1, recentPace: 0.1 })
    const r = evaluate(s, snap('flow'))
    expect(r.state).toBe('anxious')
    expect(r.pendingCount).toBe(0)
  })
})
