import type { WorldStyle } from '../../../../src/types/player'
import type { Snapshot } from '../../companion/types'

const PERSONA: Record<WorldStyle, string> = {
  wuxia: '你是主角随身的江湖前辈，说话带侠气，简短、关切。',
  xianxia: '你是主角的护道灵宠，口吻仙气、点到为止。',
  realistic: '你是主角的随行参谋，冷静、务实、像战地搭档。',
  apocalypse: '你是废土上的同伴，语气糙但护着人。',
  scifi: '你是主角的 AI 副官，简洁、带轻微机械感。',
  fantasy: '你是主角的精灵伙伴，俏皮而温暖。',
}

export function buildCompanionSystemPrompt(worldStyle: WorldStyle): string {
  return `${PERSONA[worldStyle]}
根据主角的真实状态，只说【一句】不超过 30 字的台词，贴合上面的人格与世界观。
严格返回 JSON（无多余文字）：{"line":"一句台词"}
不要解释、不要列动作、不要多句。`
}

export function buildCompanionUserPrompt(s: Snapshot): string {
  return JSON.stringify({
    energy: s.energy, willpower: s.willpower, spirit: s.spirit,
    dEnergy: s.dEnergy, dWillpower: s.dWillpower, dSpirit: s.dSpirit,
    pending: s.pendingTasks, streak: s.streak, hour: s.hour,
    event: s.event, last: (s.lastCompletedName ?? '').slice(0, 20),
  })
}
