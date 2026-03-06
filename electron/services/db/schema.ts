import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().default(''),
  originalText: text('original_text').notNull(),
  gamifiedName: text('gamified_name'),
  narrative: text('narrative'),
  xp: integer('xp').notNull().default(10),
  type: text('type').notNull().default('test'),
  status: text('status').notNull().default('pending'),
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
})

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title'),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  gold: integer('gold').notNull().default(0),
  ep: integer('ep').notNull().default(100),
  maxEp: integer('max_ep').notNull().default(100),
  worldStyle: text('world_style').notNull().default('realistic'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
})

export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().default(''),
  title: text('title').notNull(),
  description: text('description').notNull(),
  tier: text('tier').notNull(),
  triggerCondition: text('trigger_condition').notNull(),
  unlockText: text('unlock_text'),
  unlockedAt: text('unlocked_at'),
  isUnlocked: integer('is_unlocked').notNull().default(0),
})

export const medals = sqliteTable('medals', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().default(''),
  name: text('name').notNull(),
  category: text('category').notNull(),
  svgCode: text('svg_code').notNull(),
  seed: text('seed').notNull(),
  description: text('description').notNull(),
  unlockedAt: text('unlocked_at').notNull(),
})

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().default(''),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  maxXp: integer('max_xp').notNull().default(100),
  traits: text('traits').notNull().default('[]'),
  parentSkillId: text('parent_skill_id'),
  isUnlocked: integer('is_unlocked').notNull().default(0),
})

export const streaks = sqliteTable('streaks', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().default(''),
  type: text('type').notNull().default('daily'),
  currentCount: integer('current_count').notNull().default(0),
  bestCount: integer('best_count').notNull().default(0),
  lastActiveDate: text('last_active_date').notNull()
})

export const plotLogs = sqliteTable('plot_logs', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().default(''),
  type: text('type').notNull(),
  periodKey: text('period_key').notNull(),
  summary: text('summary').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})
