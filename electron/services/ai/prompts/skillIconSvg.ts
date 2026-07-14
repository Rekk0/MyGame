import type { SkillCategory } from '../../../../src/types/skill'

/** 技能图标 world-agnostic：只表达技能语义，不随世界观变（与预置图标同一套视觉规范）。 */
export function buildSkillIconSystemPrompt(): string {
  return [
    '你是一位符文徽记设计师，为技能树节点设计极简的线性图标。',
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
