import { clamp, computeDeltas } from './settlement'
import type { DeltaCoeffs } from './settlement'
import { correctRatings, scaledCoeffs, selectHistory } from './calibration'
import { historyForQuest } from '../db/repositories/calibrationRepo'
import { getScales } from './profile'
import type { Ratings, ResourceDelta } from '../../../src/types/resource'

// 结算与预览共用的评分解析：用户实填 → 直接用；未填 → 历史修正 AI 隐藏预估。
// 与 QUEST_COMPLETE 原内联逻辑逐行等价，保证「显示值 = 结算值」。
export interface RatingSource {
  originalText: string
  type: string
  epCost: number
  aiEnergyPct: number | null
  aiDrive: number | null
  aiLike: number | null
  userEnergyPct: number | null
  userDrive: number | null
  userLike: number | null
}

export function resolveQuestRatings(q: RatingSource): Ratings {
  if (q.userDrive != null) {
    return {
      E: q.userEnergyPct ?? clamp(q.epCost, 0, 100),
      D: q.userDrive,
      L: q.userLike ?? 5,
    }
  }
  const rawAi: Ratings = {
    E: q.aiEnergyPct ?? clamp(q.epCost, 0, 100),
    D: q.aiDrive ?? 5,
    L: q.aiLike ?? 5,
  }
  const { byText, byType } = historyForQuest(q.type, q.originalText)
  const hist = selectHistory(byText, byType)
  return correctRatings(rawAi, hist.mean, hist.n)
}

// scaledCoeffs(getScales()) 是玩家级常量：列表批量预览时由调用方提一次传入，避免逐任务重算。
export function previewQuestDeltas(q: RatingSource, coeffs?: DeltaCoeffs): Required<ResourceDelta> {
  return computeDeltas(resolveQuestRatings(q), coeffs ?? scaledCoeffs(getScales()))
}
