import { C } from './constants'
import type {
  Snapshot, Signal, SignalKind, Proactivity, ActionId, Mood, EnergyTier,
} from './types'

const RANK: Record<Signal['severity'], number> = { danger: 0, warning: 1, info: 2 }

export function classifySignals(s: Snapshot): Signal[] {
  const out: Signal[] = []
  const band = (v: number, danger: number, warn: number, kind: SignalKind): void => {
    if (v < danger) out.push({ kind, severity: 'danger' })
    else if (v < warn) out.push({ kind, severity: 'warning' })
  }
  band(s.energy, C.energyDanger, C.energyWarn, 'energy_low')
  band(s.willpower, C.willpowerDanger, C.willpowerWarn, 'willpower_low')
  band(s.spirit, C.spiritDanger, C.spiritWarn, 'spirit_low')
  if (s.hour >= C.lateNightStart && s.hour < C.lateNightEnd)
    out.push({ kind: 'late_night', severity: 'warning' })
  if (s.event === 'quest_completed') out.push({ kind: 'quest_completed', severity: 'info' })
  if (s.event === 'quest_completed' && s.streak > 0 && s.streak % C.streakStep === 0)
    out.push({ kind: 'streak_milestone', severity: 'info' })
  if (s.event === 'idle') out.push({ kind: 'idle', severity: 'info' })
  if (s.event === 'startup' || s.event === 'timer') out.push({ kind: 'greeting', severity: 'info' })
  if (s.energy >= C.goodThreshold && s.willpower >= C.goodThreshold && s.spirit >= C.goodThreshold)
    out.push({ kind: 'state_good', severity: 'info' })
  return out
}

export function topSignal(signals: Signal[]): Signal | null {
  return signals.slice().sort((a, b) => RANK[a.severity] - RANK[b.severity])[0] ?? null
}

export function shouldTrigger(signals: Signal[], level: Proactivity): boolean {
  if (signals.length === 0) return false
  if (level === 'high') return true
  if (level === 'low') return signals.some((s) => s.severity === 'danger')
  return signals.some((s) =>
    s.severity === 'danger' || s.severity === 'warning'
    || s.kind === 'streak_milestone' || s.kind === 'greeting')
}

export function isThrottled(
  lastAt: number | null, now: number, minInterval: number, hasDanger: boolean,
): boolean {
  if (hasDanger) return false
  if (lastAt == null) return false
  return now - lastAt < minInterval
}

export function shouldNotify(signals: Signal[], level: Proactivity): boolean {
  if (level === 'high') return signals.some((s) => s.severity === 'danger' || s.severity === 'warning')
  return signals.some((s) => s.severity === 'danger')
}

export function actionsForSignal(kind: SignalKind): ActionId[] {
  switch (kind) {
    case 'energy_low': return ['rest']
    case 'willpower_low': return ['sleep', 'recommend_task']
    case 'spirit_low': return ['recommend_liked']
    case 'late_night': return ['sleep']
    case 'state_good': return ['add_task', 'view_plot']
    case 'quest_completed': return ['add_task']
    case 'streak_milestone': return ['view_plot']
    case 'idle': return ['add_task']
    case 'greeting': return ['add_task']
    case 'mood': return ['record_mood']
    default: return []
  }
}

export function avatarMood(top: Signal | null): Mood {
  if (!top) return 'neutral'
  if (top.severity === 'danger') return 'alert'
  switch (top.kind) {
    case 'quest_completed': case 'streak_milestone': case 'state_good': return 'happy'
    case 'energy_low': return 'tired'
    case 'willpower_low': case 'spirit_low': case 'late_night': return 'worried'
    default: return 'neutral'
  }
}

export function energyTier(energy: number): EnergyTier {
  if (energy >= 60) return 'high'
  if (energy >= 25) return 'mid'
  return 'low'
}

export function buildCacheKey(s: Snapshot, worldStyle: string, topKind: string): string {
  const b = (v: number): number => Math.floor(v / 10)
  return `${worldStyle}|${s.event}|e${b(s.energy)}|w${b(s.willpower)}|s${b(s.spirit)}|${topKind}`
}

export function pickRecommended(
  quests: { id: string; status: string; userLike: number | null; aiLike: number | null;
            userEnergyPct: number | null; aiEnergyPct: number | null }[],
  mode: 'like' | 'easy',
): { id: string } | null {
  const open = quests.filter((q) => q.status !== 'completed')
  if (open.length === 0) return null
  const score = (q: (typeof open)[number]): number =>
    mode === 'like' ? (q.userLike ?? q.aiLike ?? 5) : -(q.userEnergyPct ?? q.aiEnergyPct ?? 50)
  return open.slice().sort((a, b) => score(b) - score(a))[0]
}
