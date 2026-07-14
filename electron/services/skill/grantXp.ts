import { BrowserWindow } from 'electron'
import { addSkillXp, getSkillById, updateSkillDescription } from '../db/repositories/skillRepo'
import { getPlayer } from '../db/repositories/playerRepo'
import { callAI } from '../ai/client'
import { buildSkillUpgradePrompt, buildSkillUpgradeSystemPrompt } from '../ai/prompts/skillUpgrade'
import { IPC } from '../../../src/types/ipc'
import type { WorldStyle } from '../../../src/types/player'
import type { SkillLevelUpEvent } from '../../../src/types/skill'

function broadcastLevelUp(e: SkillLevelUpEvent): void {
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(IPC.SKILL_LEVELED_UP, e))
}

/** 给技能加 XP；升级时更新 AI 描述/特质并广播「技能精进」事件（失败静默保留原描述）。 */
export async function grantSkillXp(id: string, amount: number): Promise<{ leveledUp: boolean }> {
  const result = addSkillXp(id, amount)
  if (!result.leveledUp) return { leveledUp: false }

  const skill = getSkillById(id)
  if (!skill) return { leveledUp: true }

  let newTrait: string | null = null
  const player = getPlayer()
  if (player) {
    const worldStyle = (player.worldStyle ?? 'realistic') as WorldStyle
    try {
      const raw = await callAI(
        buildSkillUpgradePrompt(skill, player.name),
        buildSkillUpgradeSystemPrompt(worldStyle)
      )
      const parsed = JSON.parse(raw.trim()) as { description: string; newTrait: string }
      newTrait = parsed.newTrait
      updateSkillDescription(id, parsed.description, [...skill.traits, parsed.newTrait])
    } catch {
      // AI 失败时保留原描述
    }
  }

  const fresh = getSkillById(id) ?? skill
  broadcastLevelUp({
    id: fresh.id,
    name: fresh.name,
    category: fresh.category,
    level: fresh.level,
    description: fresh.description,
    newTrait,
    iconSvg: fresh.iconSvg,
  })
  return { leveledUp: true }
}
