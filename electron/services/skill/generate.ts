import { callAI } from '../ai/client'
import { getAllSkills } from '../db/repositories/skillRepo'
import { getProfile, getRejectedNames } from '../db/repositories/userProfileRepo'
import { getPlayer } from '../db/repositories/playerRepo'
import { buildSkillGenPrompt, buildSkillGenSystemPrompt } from '../ai/prompts/skillGen'
import type { WorldStyle } from '../../../src/types/player'
import type { SkillCategory } from '../../../src/types/skill'
import type { ProfileSummary, SkillPreview } from '../../../src/types/profile'

const VALID_CATEGORIES: SkillCategory[] = ['core', 'universal', 'hidden']

/** 调 AI 生成技能预览并校验；脏数据一律拒收返回 []。不写库。 */
export async function generateSkillPreviews(): Promise<SkillPreview[]> {
  const profileRow = getProfile()
  const player = getPlayer()
  if (!profileRow || !player) return []

  let profile: ProfileSummary
  try {
    profile = JSON.parse(profileRow.summary) as ProfileSummary
  } catch {
    return []
  }

  const existing = getAllSkills()
  const existingNames = existing.map((s) => s.name)
  const rejected = getRejectedNames()
  const worldStyle = (player.worldStyle ?? 'realistic') as WorldStyle

  let raw: string
  try {
    raw = await callAI(
      buildSkillGenPrompt(profile, existingNames, rejected),
      buildSkillGenSystemPrompt(worldStyle)
    )
  } catch {
    return []
  }

  return validate(raw, existingNames, rejected)
}

function validate(raw: string, existingNames: string[], rejected: string[]): SkillPreview[] {
  let arr: unknown
  try {
    arr = JSON.parse(raw.trim())
  } catch {
    return []
  }
  if (!Array.isArray(arr)) return []

  const taken = new Set([...existingNames, ...rejected])
  const out: SkillPreview[] = []
  for (const item of arr) {
    const o = item as Record<string, unknown>
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const category = o.category as SkillCategory
    const description = typeof o.description === 'string' ? o.description.trim() : ''
    if (!name || name.length > 8 || taken.has(name)) continue
    if (!VALID_CATEGORIES.includes(category)) continue
    if (!description) continue
    const parentName = typeof o.parentSkillName === 'string' ? o.parentSkillName : null
    const parentSkillName = parentName && existingNames.includes(parentName) ? parentName : null
    const maxXpRaw = typeof o.maxXp === 'number' ? o.maxXp : 100
    const maxXp = Math.min(250, Math.max(100, Math.round(maxXpRaw)))
    out.push({ name, category, description, parentSkillName, maxXp })
    taken.add(name)
    if (out.length >= 2) break
  }
  return out
}
