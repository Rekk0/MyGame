import { registerQuestHandlers } from './questHandlers'
import { registerPlayerHandlers } from './playerHandlers'
import { registerStreakHandlers } from './streakHandlers'
import { registerAiHandlers } from './aiHandlers'
import { registerSettingsHandlers } from './settingsHandlers'

export function registerAllHandlers(): void {
  registerQuestHandlers()
  registerPlayerHandlers()
  registerStreakHandlers()
  registerAiHandlers()
  registerSettingsHandlers()
}
