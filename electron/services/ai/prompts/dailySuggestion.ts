import type { WorldStyle } from '../../../../src/types/player'
import type { DdaState } from '../../dda'

type Quest = { originalText: string; status: string; type: string }

const STYLE_CONTEXTS: Record<WorldStyle, { voice: string; moodWords: Record<DdaState, string> }> = {
  wuxia:     { voice: '以门主或长老的口吻，用武侠语境给出今日修炼建议', moodWords: { anxious: '根基未稳', flow: '内功精进', bored: '待寻突破' } },
  xianxia:   { voice: '以天道意志或前辈散仙的口吻，给出渡劫建议',     moodWords: { anxious: '道心受扰', flow: '道心稳固', bored: '修为停滞' } },
  realistic: { voice: '以职业教练或高效能导师的口吻，给出务实的执行建议', moodWords: { anxious: '压力过大', flow: '状态极佳', bored: '需要挑战' } },
  apocalypse:{ voice: '以营地指挥官的口吻，给出今日生存优先级建议',   moodWords: { anxious: '资源告急', flow: '战意充沛', bored: '需拓疆域' } },
  scifi:     { voice: '以AI助手或指挥舰长的口吻，输出任务优化方案',   moodWords: { anxious: '系统过载', flow: '运行最优', bored: '算力冗余' } },
  fantasy:   { voice: '以公会长或先知的口吻，给出今日冒险建议',       moodWords: { anxious: '魔力不稳', flow: '冒险顺遂', bored: '期待征途' } },
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
  recentQuests: Quest[]
): string {
  const ctx = STYLE_CONTEXTS[player.worldStyle]
  const mood = ctx.moodWords[state]
  const completedCount = recentQuests.filter(q => q.status === 'completed').length
  const types = [...new Set(recentQuests.map(q => q.type))].join('、') || '无'
  return `玩家「${player.name}」，${player.level}级，当前状态：${mood}。近7天完成${completedCount}/${recentQuests.length}个任务，涉及类型：${types}。请给出今日建议。`
}
