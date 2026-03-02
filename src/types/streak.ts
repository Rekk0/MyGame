export interface Streak {
  id: string
  type: 'daily'
  currentCount: number
  bestCount: number
  lastActiveDate: string // YYYY-MM-DD format
}
