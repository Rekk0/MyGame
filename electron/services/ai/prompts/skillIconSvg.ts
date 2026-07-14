import type { WorldStyle } from '../../../../src/types/player'
import type { SkillCategory } from '../../../../src/types/skill'

/** 各世界观的图标风味（同名技能在不同世界观出不同风格，与 medalSvg 体系一致）。 */
const ICON_STYLE_HINTS: Record<WorldStyle, string> = {
  wuxia: '融入刀剑、竹叶、太极等武侠意象，线条遒劲有力',
  xianxia: '融入仙鹤、莲花、云纹、八卦等仙侠意象，线条飘逸空灵',
  realistic: '采用简约几何与现代符号，线条利落克制',
  apocalypse: '融入齿轮、裂纹、链条等废土意象，线条粗粝硬朗',
  scifi: '融入六边形、电路、能量环等科技意象，线条锐利精密',
  fantasy: '融入盾徽、魔法阵、龙纹等奇幻意象，线条华丽考究',
}

export function buildSkillIconSystemPrompt(worldStyle: WorldStyle): string {
  const hint = ICON_STYLE_HINTS[worldStyle] ?? ICON_STYLE_HINTS.realistic
  return [
    '你是一位符文徽记设计师，为技能树节点设计极简的线性图标。',
    `世界观风格：${hint}。`,
    '严格要求：',
    '- 生成自包含 SVG，使用 viewBox="0 0 24 24"。',
    '- 扁平线性风格：fill="none"、stroke="currentColor"、stroke-width 约 1.6、圆角端点。',
    '- 图形居中、留边约 3 单位；线条简洁，识别度高（单一核心符号即可）。',
    '- 禁止 <script>、<image>、<foreignObject>、外部资源、事件属性、文字。',
    '只返回 SVG 代码，不要任何解释或 markdown。',
  ].join('\n')
}

export function buildSkillIconPrompt(skill: {
  name: string
  category: SkillCategory
  description: string
}): string {
  return `为技能"${skill.name}"设计一枚符文图标。类别：${skill.category}。含义：${skill.description}。只返回 SVG 代码。`
}
