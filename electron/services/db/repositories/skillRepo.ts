import { and, eq } from 'drizzle-orm'
import { db } from '../index'
import { skills } from '../schema'
import { getActivePlayerId } from './playerRepo'
import type { Skill, SkillCategory } from '../../../../src/types/skill'

const pid = () => getActivePlayerId() ?? ''

type SkillRow = typeof skills.$inferSelect

function rowToSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    playerId: row.playerId,
    name: row.name,
    category: row.category as SkillCategory,
    description: row.description,
    level: row.level,
    xp: row.xp,
    maxXp: row.maxXp,
    traits: JSON.parse(row.traits || '[]') as string[],
    parentSkillId: row.parentSkillId,
    isUnlocked: row.isUnlocked === 1,
  }
}

const PRESET_SKILLS = [
  { skillKey: 'time-mgmt', name: '时间管理', category: 'universal' as SkillCategory, description: '合理规划时间，提升日常效率', maxXp: 100, parentSkillId: null, isUnlocked: 1 },
  { skillKey: 'deep-focus', name: '深度专注', category: 'universal' as SkillCategory, description: '进入专注心流，排除一切干扰', maxXp: 150, parentSkillId: 'time-mgmt', isUnlocked: 0 },
  { skillKey: 'productivity', name: '生产力', category: 'universal' as SkillCategory, description: '高效完成复杂任务，突破瓶颈', maxXp: 100, parentSkillId: null, isUnlocked: 1 },
  { skillKey: 'flow-state', name: '心流状态', category: 'hidden' as SkillCategory, description: '神秘技能：达到物我两忘的巅峰状态', maxXp: 200, parentSkillId: 'productivity', isUnlocked: 0 },
  { skillKey: 'learning', name: '快速学习', category: 'universal' as SkillCategory, description: '快速吸收新知识，触类旁通', maxXp: 100, parentSkillId: null, isUnlocked: 1 },
  { skillKey: 'resilience', name: '韧性', category: 'core' as SkillCategory, description: '面对逆境不屈不挠，越挫越勇', maxXp: 100, parentSkillId: null, isUnlocked: 1 },
]

export function initSkills(playerId: string): void {
  const existing = db.select().from(skills).where(eq(skills.playerId, playerId)).all()
  if (existing.length > 0) return
  for (const s of PRESET_SKILLS) {
    const parentId = s.parentSkillId ? `${playerId}-${s.parentSkillId}` : null
    db.insert(skills).values({
      id: `${playerId}-${s.skillKey}`,
      playerId,
      name: s.name,
      category: s.category,
      description: s.description,
      maxXp: s.maxXp,
      parentSkillId: parentId,
      isUnlocked: s.isUnlocked,
      xp: 0,
      level: 1,
      traits: '[]',
    }).run()
  }
}

export function getAllSkills(): Skill[] {
  return db.select().from(skills).where(eq(skills.playerId, pid())).all().map(rowToSkill)
}

export function getSkillById(id: string): Skill | undefined {
  const row = db.select().from(skills).where(and(eq(skills.id, id), eq(skills.playerId, pid()))).get()
  return row ? rowToSkill(row) : undefined
}

export function addSkillXp(id: string, amount: number): { leveledUp: boolean; newLevel: number; newDescription: string } {
  const skill = db.select().from(skills).where(eq(skills.id, id)).get()
  if (!skill) return { leveledUp: false, newLevel: 1, newDescription: '' }
  let { xp, level, maxXp, description } = skill
  xp += amount
  let leveledUp = false
  while (xp >= maxXp) {
    xp -= maxXp
    level += 1
    maxXp = Math.ceil(maxXp * 1.5)
    leveledUp = true
  }
  db.update(skills).set({ xp, level, maxXp }).where(eq(skills.id, id)).run()
  return { leveledUp, newLevel: level, newDescription: description }
}

export function unlockSkill(id: string): void {
  db.update(skills).set({ isUnlocked: 1 }).where(eq(skills.id, id)).run()
}

export function updateSkillDescription(id: string, description: string, traits: string[]): void {
  db.update(skills).set({ description, traits: JSON.stringify(traits) }).where(eq(skills.id, id)).run()
}
