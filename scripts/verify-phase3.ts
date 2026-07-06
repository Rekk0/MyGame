import assert from 'node:assert/strict'
import {
  classifySignals, topSignal, shouldTrigger, isThrottled, shouldNotify,
  actionsForSignal, avatarMood, energyTier, buildCacheKey, pickRecommended,
} from '../electron/services/companion/policy'
import { selectOfflineReply } from '../electron/services/companion/templates'
import type { Snapshot } from '../electron/services/companion/types'

let pass = 0
const eq = (a: unknown, b: unknown, m: string): void => { assert.deepEqual(a, b, m); pass++ }
const ok = (c: boolean, m: string): void => { assert.equal(c, true, m); pass++ }

// —— 快照样本 ——
const A: Snapshot = { energy: 100, willpower: 100, spirit: 70, dEnergy: 0, dWillpower: 0, dSpirit: 0, pendingTasks: 3, streak: 0, hour: 14, event: 'quest_completed' }
const B: Snapshot = { energy: 50, willpower: 15, spirit: 25, dEnergy: -10, dWillpower: -20, dSpirit: -5, pendingTasks: 5, streak: 3, hour: 23, event: 'threshold' }
const D: Snapshot = { energy: 5, willpower: 6, spirit: 8, dEnergy: -40, dWillpower: -30, dSpirit: -20, pendingTasks: 10, streak: 0, hour: 3, event: 'threshold' }
const E: Snapshot = { energy: 90, willpower: 90, spirit: 90, dEnergy: 0, dWillpower: 0, dSpirit: 0, pendingTasks: 0, streak: 14, hour: 9, event: 'quest_completed' }
const F: Snapshot = { energy: 60, willpower: 60, spirit: 40, dEnergy: 0, dWillpower: 0, dSpirit: 0, pendingTasks: 2, streak: 5, hour: 8, event: 'startup' }

const sA = classifySignals(A), sB = classifySignals(B), sD = classifySignals(D)
const sE = classifySignals(E), sF = classifySignals(F)

// —— classifySignals（5）——
eq(sA, [{ kind: 'quest_completed', severity: 'info' }, { kind: 'state_good', severity: 'info' }], 'classify A')
eq(sB, [{ kind: 'willpower_low', severity: 'warning' }, { kind: 'spirit_low', severity: 'warning' }], 'classify B')
eq(sD, [{ kind: 'energy_low', severity: 'danger' }, { kind: 'willpower_low', severity: 'danger' }, { kind: 'spirit_low', severity: 'danger' }, { kind: 'late_night', severity: 'warning' }], 'classify D')
eq(sE, [{ kind: 'quest_completed', severity: 'info' }, { kind: 'streak_milestone', severity: 'info' }, { kind: 'state_good', severity: 'info' }], 'classify E')
eq(sF, [{ kind: 'greeting', severity: 'info' }], 'classify F')

// —— shouldTrigger（12）——
ok(shouldTrigger(sA, 'high') === true, 'trigger A high')
ok(shouldTrigger(sA, 'medium') === false, 'trigger A medium')
ok(shouldTrigger(sA, 'low') === false, 'trigger A low')
ok(shouldTrigger(sB, 'high') === true, 'trigger B high')
ok(shouldTrigger(sB, 'medium') === true, 'trigger B medium')
ok(shouldTrigger(sB, 'low') === false, 'trigger B low')
ok(shouldTrigger(sD, 'low') === true, 'trigger D low')
ok(shouldTrigger(sD, 'medium') === true, 'trigger D medium')
ok(shouldTrigger(sE, 'medium') === true, 'trigger E medium (streak)')
ok(shouldTrigger(sF, 'medium') === true, 'trigger F medium (greeting)')
ok(shouldTrigger([], 'high') === false, 'trigger empty high')
ok(shouldTrigger([], 'low') === false, 'trigger empty low')

// —— isThrottled（4）——
ok(isThrottled(null, 1000, 900000, false) === false, 'throttle null')
ok(isThrottled(0, 899999, 900000, false) === true, 'throttle within')
ok(isThrottled(0, 900000, 900000, false) === false, 'throttle at boundary')
ok(isThrottled(0, 1000, 900000, true) === false, 'throttle danger bypass')

// —— shouldNotify（5）——
ok(shouldNotify(sA, 'high') === false, 'notify A high')
ok(shouldNotify(sB, 'high') === true, 'notify B high (warning)')
ok(shouldNotify(sB, 'medium') === false, 'notify B medium')
ok(shouldNotify(sD, 'medium') === true, 'notify D medium (danger)')
ok(shouldNotify(sD, 'low') === true, 'notify D low (danger)')

// —— actionsForSignal（7）——
eq(actionsForSignal('energy_low'), ['rest'], 'act energy')
eq(actionsForSignal('willpower_low'), ['sleep', 'recommend_task'], 'act willpower')
eq(actionsForSignal('spirit_low'), ['recommend_liked'], 'act spirit')
eq(actionsForSignal('late_night'), ['sleep'], 'act late_night')
eq(actionsForSignal('state_good'), ['add_task', 'view_plot'], 'act state_good')
eq(actionsForSignal('quest_completed'), ['add_task'], 'act quest_completed')
eq(actionsForSignal('greeting'), ['add_task'], 'act greeting')

// —— topSignal（3）——
eq(topSignal(sA), { kind: 'quest_completed', severity: 'info' }, 'top A')
eq(topSignal(sB), { kind: 'willpower_low', severity: 'warning' }, 'top B')
eq(topSignal(sD), { kind: 'energy_low', severity: 'danger' }, 'top D')

// —— avatarMood（5）——
eq(avatarMood(null), 'neutral', 'mood null')
eq(avatarMood({ kind: 'quest_completed', severity: 'info' }), 'happy', 'mood happy')
eq(avatarMood({ kind: 'energy_low', severity: 'danger' }), 'alert', 'mood danger→alert')
eq(avatarMood({ kind: 'energy_low', severity: 'warning' }), 'tired', 'mood tired')
eq(avatarMood({ kind: 'willpower_low', severity: 'warning' }), 'worried', 'mood worried')

// —— energyTier（3）——
eq(energyTier(60), 'high', 'tier high')
eq(energyTier(25), 'mid', 'tier mid')
eq(energyTier(10), 'low', 'tier low')

// —— buildCacheKey（2）——
eq(buildCacheKey(B, 'wuxia', 'willpower_low'), 'wuxia|threshold|e5|w1|s2|willpower_low', 'key B')
eq(buildCacheKey(D, 'xianxia', 'energy_low'), 'xianxia|threshold|e0|w0|s0|energy_low', 'key D')

// —— selectOfflineReply（4）——
const r1 = selectOfflineReply({ kind: 'spirit_low', severity: 'warning' }, 'wuxia', 0)
eq(r1.actions, ['recommend_liked'], 'offline spirit actions')
ok(r1.line.length > 0, 'offline spirit line non-empty')
ok(selectOfflineReply({ kind: 'spirit_low', severity: 'warning' }, 'wuxia', 2).line === r1.line, 'offline rotation stable (2 % 2 == 0)')
eq(selectOfflineReply({ kind: 'energy_low', severity: 'danger' }, 'wuxia', 0).actions, ['rest'], 'offline energy actions')

// —— pickRecommended（2）——
const quests = [
  { id: 'q1', status: 'active', userLike: null, aiLike: 3, userEnergyPct: null, aiEnergyPct: 70 },
  { id: 'q2', status: 'active', userLike: 9, aiLike: 2, userEnergyPct: 20, aiEnergyPct: 50 },
  { id: 'q3', status: 'completed', userLike: 10, aiLike: 10, userEnergyPct: 5, aiEnergyPct: 5 },
]
eq(pickRecommended(quests, 'like')?.id, 'q2', 'recommend like → q2 (userLike 9)')
eq(pickRecommended(quests, 'easy')?.id, 'q2', 'recommend easy → q2 (energy 20)')

console.log(`✅ verify-phase3: ${pass} assertions passed`)
