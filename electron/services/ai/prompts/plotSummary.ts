import type { WorldStyle } from '../../../../src/types/player'

const WORLD_STYLE_NAMES: Record<WorldStyle, string> = {
  wuxia: '武侠',
  xianxia: '仙侠',
  realistic: '现实',
  apocalypse: '末世',
  scifi: '科幻',
  fantasy: '奇幻',
}

export function buildPlotSystemPrompt(worldStyle: WorldStyle): string {
  const style = WORLD_STYLE_NAMES[worldStyle] ?? '奇幻'
  return `你是一位${style}风格的故事叙述者。
请用第二人称"你"，以${style}世界观的语言和意象，将玩家今日/本周完成的任务编织成一段沉浸式的冒险故事。
要求：
- 200字左右，写成流畅的故事段落，不罗列任务
- 将平凡的日常任务升华为对应风格的冒险经历
- 语言生动，富有画面感，营造身临其境的代入感`
}

export function buildDailyPlotPrompt(
  questNames: string[],
  playerName: string
): string {
  const list = questNames.map((n) => `- ${n}`).join('\n')
  return `今日完成的任务：
${list}

角色名：${playerName}

请将这些经历编织成一段今日冒险日志。`
}

export function buildWeeklyPlotPrompt(
  questNames: string[],
  playerName: string
): string {
  const list = questNames.map((n) => `- ${n}`).join('\n')
  return `本周完成的任务：
${list}

角色名：${playerName}

请将这些经历编织成一段本周史诗故事，展现这一周的成长与征途。`
}
