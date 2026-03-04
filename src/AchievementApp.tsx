import { useEffect, useState } from 'react'
import type { Achievement } from './types/achievement'
import { AchievementPopup } from './components/Achievement'

export default function AchievementApp(): JSX.Element {
  const [achievement, setAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    return window.achievementAPI.onShow((a: Achievement) => setAchievement(a))
  }, [])

  if (!achievement) return <></>
  return <AchievementPopup achievement={achievement} />
}
