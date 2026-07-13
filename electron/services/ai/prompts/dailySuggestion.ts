import type { WorldStyle } from '../../../../src/types/player'
import type { DdaState, Signals } from '../../dda/score'

type Quest = { originalText: string; status: string; type: string }

const STYLE_CONTEXTS: Record<WorldStyle, { voice: string; moodWords: Record<DdaState, string> }> = {
  wuxia:     { voice: '以门主或长老的口吻，用武侠语境给出今日修炼建议', moodWords: { anxious: '鏖战正酣', flow: '内功精进', bored: '蓄劲待发' } },
  xianxia:   { voice: '以天道意志或前辈散仙的口吻，给出渡劫建议',     moodWords: { anxious: '渡劫正炽', flow: '道心稳固', bored: '蓄元待发' } },
  realistic: { voice: '以职业教练或高效能导师的口吻，给出务实的执行建议', moodWords: { anxious: '全力冲刺', flow: '状态极佳', bored: '余力充沛' } },
  apocalypse:{ voice: '以营地指挥官的口吻，给出今日生存优先级建议',   moodWords: { anxious: '前线鏖战', flow: '战意充沛', bored: '整备扩张' } },
  scifi:     { voice: '以AI助手或指挥舰长的口吻，输出任务优化方案',   moodWords: { anxious: '满载运转', flow: '运行最优', bored: '算力充沛' } },
  fantasy:   { voice: '以公会长或先知的口吻，给出今日冒险建议',       moodWords: { anxious: '战意正炽', flow: '冒险顺遂', bored: '蓄势待征' } },
}

export function buildDailySuggestionSystemPrompt(worldStyle: WorldStyle): string {
  const ctx = STYLE_CONTEXTS[worldStyle]
  return `你是一位游戏化个人助手，${ctx.voice}。
根据玩家当前状态和任务，输出 JSON：{"mood":"<状态词>","tips":["<建议1>","<建议2>","<建议3>"],"suggestedQuestTypes":["<类型>","<类型>"]}
mood 使用对应世界观的状态词汇。tips 最多3条，简短有力。suggestedQuestTypes 从 daily/dungeon/main/adventure 中选择。只输出 JSON，不要其他文字。`
}

export function buildDailySuggestionPrompt(
  player: { name: string; level: number; worldStyle: WorldStyle },
  state: DdaState,
  recentQuests: Quest[],
  signals?: Signals
): string {
  const ctx = STYLE_CONTEXTS[player.worldStyle]
  const mood = ctx.moodWords[state]
  const completedCount = recentQuests.filter(q => q.status === 'completed').length
  const types = [...new Set(recentQuests.map(q => q.type))].join('、') || '无'
  const detail = signals
    ? `处境明细：过期未完成${signals.overdueCount}个，精力${Math.round(signals.epPct * 100)}%、意志力${Math.round(signals.willPct * 100)}%、精神${Math.round(signals.spiritPct * 100)}%，近期任务难度${signals.avgDifficulty.toFixed(2)}。`
    : ''
  return `玩家「${player.name}」，${player.level}级，当前状态：${mood}。近7天完成${completedCount}/${recentQuests.length}个任务，涉及类型：${types}。${detail}请给出今日建议。`
}
