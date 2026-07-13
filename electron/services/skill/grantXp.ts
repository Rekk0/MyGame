import { addSkillXp, getSkillById, updateSkillDescription } from '../db/repositories/skillRepo'
import { getPlayer } from '../db/repositories/playerRepo'
import { callAI } from '../ai/client'
import { buildSkillUpgradePrompt, buildSkillUpgradeSystemPrompt } from '../ai/prompts/skillUpgrade'
import type { WorldStyle } from '../../../src/types/player'

/** 给技能加 XP；升级时走 AI 描述/特质更新链路（失败静默保留原描述）。 */
export async function grantSkillXp(id: string, amount: number): Promise<{ leveledUp: boolean }> {
  const result = addSkillXp(id, amount)
  if (result.leveledUp) {
    const skill = getSkillById(id)
    const player = getPlayer()
    if (skill && player) {
      const worldStyle = (player.worldStyle ?? 'realistic') as WorldStyle
      try {
        const raw = await callAI(
          buildSkillUpgradePrompt(skill, player.name),
          buildSkillUpgradeSystemPrompt(worldStyle)
        )
        const parsed = JSON.parse(raw.trim()) as { description: string; newTrait: string }
        updateSkillDescription(id, parsed.description, [...skill.traits, parsed.newTrait])
      } catch {
        // AI 失败时保留原描述
      }
    }
  }
  return { leveledUp: result.leveledUp }
}
