import type { WorldStyle } from '../../../../src/types/player'
import type { ProfileSummary } from '../../../../src/types/profile'

const SKILL_STYLE_HINTS: Record<WorldStyle, string> = {
  wuxia: '技能名用武侠气质（如「气吞山河」「一苇渡江」）',
  xianxia: '技能名用修仙气质（如「神识外放」「点石成金」）',
  realistic: '技能名用军事/职业气质（如「战术统筹」「精准打击」）',
  apocalypse: '技能名用末世生存气质（如「废土求生」「资源嗅觉」）',
  scifi: '技能名用科技气质（如「算力超频」「协议解析」）',
  fantasy: '技能名用奇幻气质（如「秘法领悟」「巨龙之心」）',
}

export function buildSkillGenSystemPrompt(worldStyle: WorldStyle): string {
  return `你是一个 RPG 技能设计师。根据用户画像，为其量身设计 1~2 个专属技能，反映他实际在做/学的事。${SKILL_STYLE_HINTS[worldStyle]}。
严格返回以下 JSON 数组格式（不要包含任何其他文字）：
[{"name":"技能名(不超过8字)","category":"core|universal|hidden","description":"1句话技能描述","parentSkillName":"现有技能名之一或null","maxXp":100}]
要求：技能名不得与「现有技能」或「已婉拒技能」列表中的任何名称重复；maxXp 在 100~250 之间；parentSkillName 只能填现有技能名或 null；技能要贴合画像里的领域与学习主题，不要泛泛而谈。`
}

export function buildSkillGenPrompt(
  profile: ProfileSummary,
  existingNames: string[],
  rejectedNames: string[]
): string {
  return `用户画像：${JSON.stringify(profile)}
现有技能：${existingNames.join('、') || '无'}
已婉拒技能（不要再生成）：${rejectedNames.join('、') || '无'}
请设计新技能。`
}
