import { actionsForSignal } from './policy'
import type { ActionId, Signal, SignalKind } from './types'
import type { WorldStyle } from '../../../src/types/player'

// 每 worldStyle 一条兜底，保证选择器永远非空
const GENERIC: Record<WorldStyle, string> = {
  wuxia: '歇口气，江湖不急这一时。',
  xianxia: '道心为重，莫要强求。',
  realistic: '稳住节奏，战线还长。',
  apocalypse: '保存体力，废土之下活下去要紧。',
  scifi: '系统提示：建议进入低功耗待机。',
  fantasy: '冒险者，先照顾好自己再上路。',
}

// signalKind → worldStyle → 台词候选（可由 echo/atelier 后续扩写；至少 1 条）
const OFFLINE: Partial<Record<SignalKind, Partial<Record<WorldStyle, string[]>>>> = {
  spirit_low: {
    wuxia: ['心魔渐生，去做件让你舒心的事吧。', '侠客也需快意，寻件喜欢的事做做。'],
    xianxia: ['道心蒙尘，需以喜乐之事温养。'],
  },
  energy_low: {
    wuxia: ['内力将枯，且去歇息。'],
    xianxia: ['灵力见底，打坐调息片刻。'],
  },
  late_night: {
    wuxia: ['夜深了，早些安寝方是正道。'],
  },
}

export function selectOfflineReply(
  top: Signal | null, worldStyle: WorldStyle, variantIndex: number,
): { line: string; actions: ActionId[] } {
  const kind: SignalKind = top?.kind ?? 'greeting'
  const arr = OFFLINE[kind]?.[worldStyle] ?? [GENERIC[worldStyle] ?? '……']
  const line = arr[Math.abs(variantIndex) % arr.length]
  return { line, actions: actionsForSignal(kind) }
}
