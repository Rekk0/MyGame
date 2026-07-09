/** Shared date helpers used by App & Journal. */

export function getMondayISO(): string {
  const d = new Date()
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  return monday.toISOString().slice(0, 10)
}

export interface QuestForCount {
  status: string
  completedAt?: string | null
}

export function countTodayCompleted(quests: QuestForCount[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return quests.filter(
    (q) => q.status === 'completed' && q.completedAt?.startsWith(today)
  ).length
}

export function countWeekCompleted(quests: QuestForCount[]): number {
  const weekStart = getMondayISO()
  return quests.filter(
    (q) => q.status === 'completed' && q.completedAt && q.completedAt >= weekStart
  ).length
}
