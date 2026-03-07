import { useEffect } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useStreakStore } from './stores/streakStore'
import { useQuestStore } from './stores/questStore'
import { useLanguageStore } from './stores/languageStore'
import HUD from './components/HUD'

export default function HudApp() {
  const fetchPlayer = usePlayerStore((s) => s.fetchPlayer)
  const fetchStreak = useStreakStore((s) => s.fetchStreak)
  const fetchQuests = useQuestStore((s) => s.fetchQuests)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  useEffect(() => {
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg?.language) setLanguage(cfg.language)
    }).catch(() => {})
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
