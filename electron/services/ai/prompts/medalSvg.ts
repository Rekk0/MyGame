import type { WorldStyle } from '../../../../src/types/player'
import type { MedalCategory } from '../../../../src/types/medal'

const MEDAL_STYLE_HINTS: Record<WorldStyle, string> = {
  wuxia: '使用太极、剑、竹、扇等东方图案，配色古朴（金、墨绿、朱红）',
  xianxia: '使用仙鹤、莲花、八卦、灵丹图案，配色空灵（青、白、紫）',
  realistic: '使用简约几何图形、奖章形状，配色专业（深蓝、银、金）',
  apocalypse: '使用齿轮、骷髅、链条、残破边框，配色暗沉（锈红、灰、黑）',
  scifi: '使用六边形、电路、光环、AI纹路，配色科技感（青蓝、白、霓虹绿）',
  fantasy: '使用盾牌、骑士纹章、龙、魔法阵，配色史诗（皇家蓝、金、深紫）',
}

export function buildMedalSvgSystemPrompt(worldStyle: WorldStyle): string {
  const hint = MEDAL_STYLE_HINTS[worldStyle]
  return `你是一位SVG勋章设计师。风格要求：${hint}。\n生成自包含的SVG代码，使用viewBox="0 0 80 80"。\n禁止使用外部资源和<image>标签。只返回SVG代码，不要包含任何解释或markdown。`
}

export function buildMedalSvgPrompt(medal: {
  name: string
  category: MedalCategory
  seed: string
}): string {
  return `为"${medal.name}"设计一枚精美勋章。类别：${medal.category}。种子：${medal.seed}。要求图案独特，只返回SVG代码。`
}
