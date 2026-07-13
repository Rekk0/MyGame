import { describe, it, expect } from 'vitest'
import { computeDeltas, difficultyFactor, energyStateFactor, finalXp } from './settlement'

describe('computeDeltas', () => {
  it('高精力 + 强迫 + 厌恶 → 扣精力/意志力，掉精神', () => {
    const d = computeDeltas({ E: 80, D: 1, L: 1 })
    expect(d.energy).toBe(-80)
    expect(d.willpower).toBeLessThan(0)
    expect(d.spirit).toBeLessThan(0)
  })

  it('低驱动缺口为 0 时不扣意志力', () => {
    const d = computeDeltas({ E: 50, D: 5, L: 5 })
    expect(d.willpower).toBe(0)
    expect(d.spirit).toBe(0)
  })

  it('高喜爱 → 精神为正', () => {
    const d = computeDeltas({ E: 20, D: 8, L: 9 })
    expect(d.spirit).toBeGreaterThan(0)
    expect(d.willpower).toBe(0)
  })
})

describe('difficultyFactor / finalXp', () => {
  it('难度系数落在 [base, base+span] 区间', () => {
    const low = difficultyFactor({ E: 0, D: 10, L: 10 })
    const high = difficultyFactor({ E: 100, D: 0, L: 0 })
    expect(low).toBeCloseTo(0.8, 5)
    expect(high).toBeCloseTo(1.6, 5)
  })

  it('精力越满 XP 加成越高', () => {
    expect(energyStateFactor(100, 100)).toBeGreaterThan(energyStateFactor(0, 100))
  })

  it('finalXp 随难度/倍率单调', () => {
    const r = { E: 50, D: 3, L: 4 }
    expect(finalXp(100, r, 100, 100, 1.5, 1)).toBeGreaterThan(finalXp(100, r, 100, 100, 1.0, 1))
  })
})
