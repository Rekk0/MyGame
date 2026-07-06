import assert from 'node:assert/strict'
import {
  resolveRatings, computeDeltas, finalXp,
  computeSleep, computeRest, computePassive,
} from '../electron/services/resources/settlement'

let pass = 0
const eq = (a: unknown, b: unknown, msg: string) => { assert.deepEqual(a, b, msg); pass++ }

// —— computeDeltas ——
eq(computeDeltas({ E: 60, D: 1, L: 1 }), { energy: -60, willpower: -16, spirit: -13 }, 'deltas 讨厌硬啃')
eq(computeDeltas({ E: 30, D: 8, L: 9 }), { energy: -30, willpower: 0, spirit: 6 }, 'deltas 喜欢有劲')
eq(computeDeltas({ E: 40, D: 5, L: 5 }), { energy: -40, willpower: 0, spirit: 0 }, 'deltas 中性')

// —— finalXp（dda=streak=1, base=10, energy=100/100）——
eq(finalXp(10, { E: 60, D: 1, L: 1 }, 100, 100, 1, 1), 14, 'xp 讨厌硬啃')
eq(finalXp(10, { E: 30, D: 8, L: 9 }, 100, 100, 1, 1), 9, 'xp 喜欢有劲')
eq(finalXp(10, { E: 40, D: 5, L: 5 }, 100, 100, 1, 1), 10, 'xp 中性')
// 精力见底最多削 15%
eq(finalXp(10, { E: 40, D: 5, L: 5 }, 0, 100, 1, 1), Math.round(10 * 0.96 * 0.85), 'xp 精力见底')

// —— resolveRatings 优先级：用户 > AI > 兜底 ——
eq(resolveRatings({ userEnergyPct: 80, aiEnergyPct: 40, userDrive: null, aiDrive: 6, userLike: null, aiLike: 5, epCost: 10 }),
  { E: 80, D: 6, L: 5 }, 'resolve 用户优先')
eq(resolveRatings({ userEnergyPct: null, aiEnergyPct: null, userDrive: null, aiDrive: null, userLike: null, aiLike: null, epCost: 10 }),
  { E: 10, D: 5, L: 5 }, 'resolve 全空兜底 epCost')

// —— computeSleep（缩放）——
eq(computeSleep(8, 40, 100, 100), { ep: 100, willpower: 100 }, 'sleep 8h 回满')
eq(computeSleep(4, 40, 100, 100), { ep: 50, willpower: 70 }, 'sleep 4h 半')
eq(computeSleep(2, 40, 100, 100), { ep: 50, willpower: 58 }, 'sleep 2h 下限')

// —— computeRest / computePassive（含封顶）——
eq(computeRest(40, 84, 100, 100), { ep: 55, willpower: 94 }, 'rest 常规')
eq(computeRest(95, 95, 100, 100), { ep: 100, willpower: 100 }, 'rest 封顶')
eq(computePassive(50, 100, 3), 65, 'passive 3h')
eq(computePassive(98, 100, 1), 100, 'passive 封顶')

console.log(`✅ verify-phase1: ${pass} assertions passed`)
