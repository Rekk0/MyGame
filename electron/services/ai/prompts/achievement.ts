import type { WorldStyle } from '../../../../src/types/player'

const WORLD_STYLE_UNLOCK_CONTEXTS: Record<WorldStyle, string> = {
  wuxia: '江湖武侠风格。用侠义豪情的语气，引用武侠意象（刀光剑影、江湖、功法）',
  xianxia: '东方修仙风格。用飘逸超然的语气，引用修仙意象（渡劫、飞升、道心）',
  realistic: '现代职场风格。用简洁鼓励的语气，专业而真诚',
  apocalypse: '末世废土风格。用坚毅沧桑的语气，强调生存与意志',
  scifi: '科幻星际风格。用系统通知口吻，引用科技术语（协议、数据、里程碑）',
  fantasy: '西方奇幻风格。用史诗传奇的语气，引用骑士、魔法、荣耀等意象',
}

export function buildAchievementSystemPrompt(worldStyle: WorldStyle): string {
  const ctx = WORLD_STYLE_UNLOCK_CONTEXTS[worldStyle]
  return `你是一个游戏成就解锁台词生成器。${ctx}。
为玩家生成成就解锁时的祝贺台词，50字以内，符合世界观风格，个性化且有情感共鸣。
只返回台词文本，不含任何其他内容。`
}

export function buildAchievementPrompt(
  achievement: { title: string; description: string; tier: string },
  player: { name: string; level: number }
): string {
  return `玩家"${player.name}"（${player.level}级）解锁了成就【${achievement.title}】（${achievement.tier}级）：${achievement.description}。请生成解锁台词。`
}
