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

/** Local wall-clock date as YYYY-MM-DD (not UTC). */
export function localToday(): string {
  const d = new Date()
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 10)
}

/** True if quest is not completed and its due date has passed (same day is not overdue). */
export function isOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'completed') return false
  return dueDate.slice(0, 10) < localToday()
}
