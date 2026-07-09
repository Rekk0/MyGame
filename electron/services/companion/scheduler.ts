import { powerMonitor } from 'electron'
import { getPlayer } from '../db/repositories/playerRepo'
import { getAllQuests } from '../db/repositories/questRepo'
import { getStreak } from '../db/repositories/streakRepo'
import { getProactivity } from '../../ipc/settingsHandlers'
import { sendNotification } from '../notification'
import { pushCompanionReply } from '../../windows/companionWindow'
import { makeReply } from '../../ipc/companionHandlers'
import { classifySignals, shouldTrigger, isThrottled, shouldNotify, topSignal } from './policy'
import { C, COMPANION_ENABLED } from './constants'
import type { Snapshot, TriggerEvent } from './types'

let lastFiredAt: number | null = null
let prev = { energy: 100, willpower: 100, spirit: 70 }

function buildSnapshot(event: TriggerEvent, lastName?: string): Snapshot | null {
  const p = getPlayer(); if (!p) return null
  const pending = getAllQuests().filter((q) => q.status !== 'completed').length
  const snap: Snapshot = {
    energy: p.ep, willpower: p.willpower, spirit: p.spirit,
    dEnergy: p.ep - prev.energy, dWillpower: p.willpower - prev.willpower, dSpirit: p.spirit - prev.spirit,
    pendingTasks: pending, streak: getStreak()?.currentCount ?? 0,
    hour: new Date().getHours(), event, lastCompletedName: lastName,
  }
  prev = { energy: p.ep, willpower: p.willpower, spirit: p.spirit }
  return snap
}

export async function evaluate(event: TriggerEvent, lastName?: string): Promise<void> {
  if (!COMPANION_ENABLED) return
  const p = getPlayer(); if (!p) return
  const snap = buildSnapshot(event, lastName); if (!snap) return
  const signals = classifySignals(snap)
  const level = getProactivity()
  const hasDanger = signals.some((s) => s.severity === 'danger')
  if (!shouldTrigger(signals, level)) return
  if (isThrottled(lastFiredAt, Date.now(), C.minIntervalMs, hasDanger)) return

  const reply = await makeReply(snap, signals, p.worldStyle as never)
  lastFiredAt = Date.now()
  pushCompanionReply(reply)
  if (shouldNotify(signals, level)) {
    const t = topSignal(signals)
    if (t) sendNotification('伴侣提醒', reply.line)
  }
}

export function startCompanionScheduler(): void {
  if (!COMPANION_ENABLED) return
  setInterval(() => {
    const idle = powerMonitor.getSystemIdleTime()
    void evaluate(idle >= C.idleSeconds ? 'idle' : 'threshold')
  }, C.pollIntervalMs)
}
