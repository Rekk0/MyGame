import { clamp } from './settlement'
import type { DeltaCoeffs } from './settlement'
import { R } from './constants'
import type { Ratings } from '../../../src/types/resource'

export const CAL = {
  histMinSamples: 3,
  histPseudocount: 3,
  histMaxWeight: 0.8,
  biasMinSamples: 5,
  biasSensitivity: 0.5,
  scaleMin: 0.7,
  scaleMax: 1.3,
  moodSpiritSpan: 10,
  historyWindow: 500,
} as const

export interface Bias { D: number; L: number }
export interface CoeffScales { willpower: number; spiritJoy: number; spiritLoss: number }
export const IDENTITY_SCALES: CoeffScales = { willpower: 1, spiritJoy: 1, spiritLoss: 1 }

function round3(x: number): number {
  return Math.round(x * 1000) / 1000
}

// —— 归一化（v1 分组键，决策 1）——
export function normalizeText(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// —— v1：隐藏预估校正 ——
export function meanRatings(samples: Ratings[]): Ratings {
  const n = samples.length
  if (n === 0) return { E: 0, D: 0, L: 0 }
  let e = 0, d = 0, l = 0
  for (const s of samples) { e += s.E; d += s.D; l += s.L }
  return { E: e / n, D: d / n, L: l / n }
}

export function historyWeight(n: number): number {
  if (n < CAL.histMinSamples) return 0
  return Math.min(CAL.histMaxWeight, n / (n + CAL.histPseudocount))
}

export function blendScalar(aiVal: number, histMean: number, n: number): number {
  const w = historyWeight(n)
  return Math.round(w * histMean + (1 - w) * aiVal)
}

export function correctRatings(ai: Ratings, hist: Ratings, n: number): Ratings {
  return {
    E: clamp(blendScalar(ai.E, hist.E, n), 0, 100),
    D: clamp(blendScalar(ai.D, hist.D, n), 0, 10),
    L: clamp(blendScalar(ai.L, hist.L, n), 0, 10),
  }
}

export function selectHistory(
  byText: { mean: Ratings; n: number },
  byType: { mean: Ratings; n: number },
): { mean: Ratings; n: number } {
  if (byText.n >= CAL.histMinSamples) return byText
  if (byType.n >= CAL.histMinSamples) return byType
  return byText.n >= byType.n ? byText : byType
}

// —— v2：系数自适应 ——
export function computeBias(
  samples: { aiD: number; userD: number; aiL: number; userL: number }[],
): Bias {
  const n = samples.length
  if (n === 0) return { D: 0, L: 0 }
  let sd = 0, sl = 0
  for (const s of samples) { sd += s.userD - s.aiD; sl += s.userL - s.aiL }
  return { D: sd / n, L: sl / n }
}

export function biasToScales(bias: Bias, n: number): CoeffScales {
  if (n < CAL.biasMinSamples) return IDENTITY_SCALES
  const k = CAL.biasSensitivity
  return {
    willpower: round3(clamp(1 - k * (bias.D / 10), CAL.scaleMin, CAL.scaleMax)),
    spiritJoy: round3(clamp(1 + k * (bias.L / 10), CAL.scaleMin, CAL.scaleMax)),
    spiritLoss: round3(clamp(1 - k * (bias.L / 10), CAL.scaleMin, CAL.scaleMax)),
  }
}

export function scaledCoeffs(scales: CoeffScales): DeltaCoeffs {
  return {
    willpowerMaxCost: R.willpowerMaxCost * scales.willpower,
    spiritJoyGain: R.spiritJoyGain * scales.spiritJoy,
    spiritViolationLoss: R.spiritViolationLoss * scales.spiritLoss,
  }
}

// —— 情绪波动 → spirit delta ——
export function moodToSpiritDelta(score: number): number {
  return Math.round(CAL.moodSpiritSpan * clamp(score, -5, 5) / 5)
}
