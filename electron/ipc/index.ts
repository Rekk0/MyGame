import { registerQuestHandlers } from './questHandlers'
import { registerPlayerHandlers } from './playerHandlers'
import { registerStreakHandlers } from './streakHandlers'

export function registerAllHandlers(): void {
  registerQuestHandlers()
  registerPlayerHandlers()
  registerStreakHandlers()
}
