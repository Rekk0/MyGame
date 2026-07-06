import { registerQuestHandlers } from './questHandlers'
import { registerPlayerHandlers } from './playerHandlers'
import { registerStreakHandlers } from './streakHandlers'
import { registerAiHandlers } from './aiHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerAchievementHandlers } from './achievementHandlers'
import { registerMedalHandlers } from './medalHandlers'
import { registerSkillHandlers } from './skillHandlers'
import { registerDdaHandlers } from './ddaHandlers'
import { registerPlotHandlers } from './plotHandlers'
import { registerResourceHandlers } from './resourceHandlers'

export function registerAllHandlers(): void {
  registerQuestHandlers()
  registerPlayerHandlers()
  registerStreakHandlers()
  registerAiHandlers()
  registerSettingsHandlers()
  registerAchievementHandlers()
  registerMedalHandlers()
  registerSkillHandlers()
  registerDdaHandlers()
  registerPlotHandlers()
  registerResourceHandlers()
}
