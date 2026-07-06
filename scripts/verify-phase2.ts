import assert from 'node:assert/strict'
import {
  normalizeText, meanRatings, historyWeight, blendScalar,
  correctRatings, selectHistory, computeBias, biasToScales,
  scaledCoeffs, moodToSpiritDelta, IDENTITY_SCALES,
} from '../electron/services/resources/calibration'
import { computeDeltas } from '../electron/services/resources/settlement'

let pass = 0
function eq(a: unknown, b: unknown, msg: string): void { assert.deepEqual(a, b, msg); pass++ }

// —— A. normalizeText ——
eq(normalizeText('  Write Code!!  '), 'write code', 'norm 英文去标点折叠')
eq(normalizeText('Read/Write-Tests'), 'read write tests', 'norm 斜杠连字符→空格')
eq(normalizeText('读书、写作'), '读书 写作', 'norm 中文顿号→空格')
eq(normalizeText('每日 锻炼'), '每日 锻炼', 'norm 中文含空格保留')

// —— B. meanRatings ——
eq(meanRatings([{ E: 60, D: 2, L: 1 }, { E: 80, D: 4, L: 3 }]), { E: 70, D: 3, L: 2 }, 'mean 两样本')
eq(meanRatings([]), { E: 0, D: 0, L: 0 }, 'mean 空')

// —— C. historyWeight ——
eq(historyWeight(2), 0, 'weight 冷启动<N=0')
eq(historyWeight(3), 0.5, 'weight n=3')
eq(historyWeight(5), 0.625, 'weight n=5')
eq(historyWeight(20), 0.8, 'weight n=20 封顶')

// —— D. blendScalar ——
eq(blendScalar(30, 70, 2), 30, 'blend n<N 纯 AI')
eq(blendScalar(30, 70, 3), 50, 'blend n=3')
eq(blendScalar(30, 70, 5), 55, 'blend n=5')
eq(blendScalar(30, 70, 20), 62, 'blend n=20')

// —— E. correctRatings ——
eq(correctRatings({ E: 30, D: 5, L: 5 }, { E: 70, D: 8, L: 2 }, 5), { E: 55, D: 7, L: 3 }, 'correct n=5 混合')
eq(correctRatings({ E: 30, D: 5, L: 5 }, { E: 70, D: 8, L: 2 }, 2), { E: 30, D: 5, L: 5 }, 'correct n<N 纯 AI')

// —— F. selectHistory ——
eq(selectHistory({ mean: { E: 1, D: 1, L: 1 }, n: 5 }, { mean: { E: 2, D: 2, L: 2 }, n: 10 }),
  { mean: { E: 1, D: 1, L: 1 }, n: 5 }, 'select 文本达阈值优先')
eq(selectHistory({ mean: { E: 1, D: 1, L: 1 }, n: 2 }, { mean: { E: 2, D: 2, L: 2 }, n: 8 }),
  { mean: { E: 2, D: 2, L: 2 }, n: 8 }, 'select 文本不足退类别')
eq(selectHistory({ mean: { E: 1, D: 1, L: 1 }, n: 1 }, { mean: { E: 2, D: 2, L: 2 }, n: 2 }),
  { mean: { E: 2, D: 2, L: 2 }, n: 2 }, 'select 皆不足取样本多者')

// —— G. computeBias ——
eq(computeBias([{ aiD: 2, userD: 5, aiL: 8, userL: 6 }, { aiD: 3, userD: 5, aiL: 7, userL: 5 }]),
  { D: 2.5, L: -2 }, 'bias 两样本')
eq(computeBias([]), { D: 0, L: 0 }, 'bias 空')

// —— H. biasToScales ——
eq(biasToScales({ D: 2, L: -2 }, 6), { willpower: 0.9, spiritJoy: 0.9, spiritLoss: 1.1 }, 'scales 常规')
eq(biasToScales({ D: 2, L: -2 }, 4), IDENTITY_SCALES, 'scales 样本不足→identity')
eq(biasToScales({ D: 10, L: 0 }, 10), { willpower: 0.7, spiritJoy: 1, spiritLoss: 1 }, 'scales 触下限 0.7')

// —— I. scaledCoeffs → computeDeltas ——
eq(computeDeltas({ E: 60, D: 1, L: 1 }, scaledCoeffs({ willpower: 0.9, spiritJoy: 0.9, spiritLoss: 1.1 })),
  { energy: -60, willpower: -14, spirit: -14 }, 'delta 缩放后')
eq(computeDeltas({ E: 60, D: 1, L: 1 }, scaledCoeffs(IDENTITY_SCALES)),
  { energy: -60, willpower: -16, spirit: -13 }, 'delta identity=Phase1')
eq(computeDeltas({ E: 60, D: 1, L: 1 }),
  { energy: -60, willpower: -16, spirit: -13 }, 'delta 默认参数=Phase1（向后兼容）')

// —— J. moodToSpiritDelta ——
eq(moodToSpiritDelta(5), 10, 'mood +5')
eq(moodToSpiritDelta(-5), -10, 'mood -5')
eq(moodToSpiritDelta(3), 6, 'mood +3')
eq(moodToSpiritDelta(-2), -4, 'mood -2')
eq(moodToSpiritDelta(0), 0, 'mood 0')
eq(moodToSpiritDelta(8), 10, 'mood 越界 clamp')

console.log(`✅ verify-phase2: ${pass} assertions passed`)
