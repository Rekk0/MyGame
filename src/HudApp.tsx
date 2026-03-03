import { useEffect } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useStreakStore } from './stores/streakStore'
import { useQuestStore } from './stores/questStore'
import HUD from './components/HUD'

export default function HudApp() {
  const fetchPlayer = usePlayerStore((s) => s.fetchPlayer)
  const fetchStreak = useStreakStore((s) => s.fetchStreak)
  const fetchQuests = useQuestStore((s) => s.fetchQuests)

  useEffect(() => {
    fetchPlayer()
    fetchStreak()
    fetchQuests()
  }, [])

  useEffect(() => {
    return window.dataAPI.onUpdated(() => {
      fetchPlayer()
      fetchStreak()
      fetchQuests()
    })
  }, [])

  return <HUD />
}
