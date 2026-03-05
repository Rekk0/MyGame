import type { WorldStyle } from '../../../../src/types/player'
import type { Skill } from '../../../../src/types/skill'

const SKILL_STYLE_CONTEXTS: Record<WorldStyle, string> = {
  wuxia: '技能提升应体现内功修为、武学境界的突破感，使用武侠术语如「功力精进」「武学小成」等',
  xianxia: '技能提升应体现修为精进、法力精纯的蜕变感，使用修仙术语如「道行精深」「神识圆满」等',
  realistic: '技能提升应体现专业能力、职业素养的量化成长，使用职场术语如「效率提升」「胜任力增强」等',
  apocalypse: '技能提升应体现生存本能、战斗意志的磨砺，使用末世术语如「适应性强化」「求生意志淬炼」等',
  scifi: '技能提升应体现算法优化、系统升级的精准感，使用科技术语如「模块性能提升」「处理效率优化」等',
  fantasy: '技能提升应体现魔法领悟、战斗经验的传奇感，使用奇幻术语如「魔力觉醒」「战斗直觉升华」等',
}

export function buildSkillUpgradeSystemPrompt(worldStyle: WorldStyle): string {
  const context = SKILL_STYLE_CONTEXTS[worldStyle]
  return `你是一个游戏技能成长描述师。${context}。
严格返回以下 JSON 格式（不要包含任何其他文字）：
{"description":"1句话描述该等级的技能状态","newTrait":"1个被动特质名称（4-8字）"}`
}

export function buildSkillUpgradePrompt(skill: Skill, playerName: string): string {
  return `玩家「${playerName}」的技能「${skill.name}」已升至 ${skill.level} 级。原描述：${skill.description}。请生成新的等级描述和解锁的被动特质。`
}
