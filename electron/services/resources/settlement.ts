import { R } from './constants'
import type { Ratings, ResourceDelta } from '../../../src/types/resource'
import type { Quest } from '../../../src/types/quest'

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function resolveRatings(q: Pick<Quest,
  'userEnergyPct' | 'aiEnergyPct' | 'userDrive' | 'aiDrive' | 'userLike' | 'aiLike' | 'epCost'>): Ratings {
  const E = q.userEnergyPct ?? q.aiEnergyPct ?? clamp(q.epCost, 0, 100)
  const D = q.userDrive ?? q.aiDrive ?? 5
  const L = q.userLike ?? q.aiLike ?? 5
  return { E, D, L }
}

function normZero(n: number): number {
  return Object.is(n, -0) ? 0 : n
}

export function computeDeltas({ E, D, L }: Ratings): Required<ResourceDelta> {
  const forced = clamp((5 - D) / 5, 0, 1)
  const joy = clamp((L - 5) / 5, -1, 1)
  return {
    energy: -E,
    willpower: normZero(-Math.round(R.willpowerMaxCost * forced * (0.5 + 0.5 * E / 100))),
    spirit: normZero(Math.round(R.spiritJoyGain * joy)
      - Math.round(R.spiritViolationLoss * forced * (1 - L / 10))),
  }
}

export function difficultyFactor({ E, D, L }: Ratings): number {
  const forced = clamp((5 - D) / 5, 0, 1)
  const dislike = clamp((5 - L) / 5, 0, 1)
  const difficulty = 0.5 * (E / 100) + 0.3 * forced + 0.2 * dislike
  return R.difficultyBase + R.difficultySpan * difficulty
}

export function energyStateFactor(cur: number, max: number): number {
  return R.energyFloor + R.energySpan * (cur / max)
}

export function finalXp(baseXp: number, r: Ratings, curEnergy: number,
  maxEnergy: number, ddaMult: number, streakMult: number): number {
  return Math.round(baseXp * difficultyFactor(r)
    * energyStateFactor(curEnergy, maxEnergy) * ddaMult * streakMult)
}

export function computeSleep(hours: number, curWill: number,
  maxEnergy: number, maxWill: number): { ep: number; willpower: number } {
  return {
    ep: Math.round(maxEnergy * clamp(hours / 8, 0.5, 1)),
    willpower: clamp(curWill + Math.round(R.sleepWillpowerBase * clamp(hours / 8, 0.3, 1.2)), 0, maxWill),
  }
}

export function computeRest(ep: number, will: number,
  maxEnergy: number, maxWill: number): { ep: number; willpower: number } {
  return {
    ep: clamp(ep + R.restEnergy, 0, maxEnergy),
    willpower: clamp(will + R.restWillpower, 0, maxWill),
  }
}

export function computePassive(will: number, maxWill: number, hours: number): number {
  return clamp(will + Math.round(R.passiveWillpowerPerHour * hours), 0, maxWill)
}
