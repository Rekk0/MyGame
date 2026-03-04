import type { WorldStyle } from '../../../../src/types/player'

const WORLD_STYLE_CONTEXTS: Record<WorldStyle, string> = {
  wuxia: '江湖武侠世界。门派、内功、江湖恩仇是核心元素。任务应使用武侠术语，如修炼、历练、江湖、切磋、功法等。',
  xianxia: '东方修仙世界。修为、渡劫、飞升、灵气是核心元素。任务应体现修仙境界，如炼丹、悟道、斩心魔等。',
  realistic: '现代都市职场。保留真实任务名称，仅添加RPG化的反馈与评语，措辞专业而不浮夸。',
  apocalypse: '末世废土世界。资源稀缺、生存压力、人类残存是核心元素。任务体现生存价值，如探索废墟、守卫营地等。',
  scifi: '近未来科技/星际世界。数据、系统、星际探索是核心元素。任务使用科技术语，如执行协议、上传报告、解析数据等。',
  fantasy: '西方奇幻世界。魔法、龙、骑士、公会是核心元素。任务使用奇幻术语，如委托、讨伐、探索地下城等。',
}

export function buildQuestTransformSystemPrompt(worldStyle: WorldStyle): string {
  const context = WORLD_STYLE_CONTEXTS[worldStyle]
  return `你是一个游戏化任务设计师。世界背景：${context}
将用户输入的普通任务转化为该世界风格的任务卡片，严格返回以下 JSON 格式（不要包含任何其他文字）：
{"gamifiedName":"游戏化的任务名称","narrative":"1-2句任务叙事描述","type":"daily|dungeon|main|timed|adventure","xp":数字}
type 与 xp 范围：daily: 5-15，dungeon: 20-50，main: 100-500，timed: 30-80，adventure: 10-100`
}

export function buildQuestTransformPrompt(originalText: string): string {
  return `请将以下任务转化为游戏化任务卡片：${originalText}`
}
