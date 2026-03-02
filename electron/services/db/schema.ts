import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
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
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
})

export const streaks = sqliteTable('streaks', {
  id: text('id').primaryKey(),
  type: text('type').notNull().default('daily'),
  currentCount: integer('current_count').notNull().default(0),
  bestCount: integer('best_count').notNull().default(0),
  lastActiveDate: text('last_active_date').notNull()
})
