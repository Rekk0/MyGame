import { useEffect } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import { useLanguageStore } from './stores/languageStore'
import QuestHudPanel from './components/HUD/QuestHudPanel'

export default function QuestHudApp() {
  const fetchPlayer = usePlayerStore((s) => s.fetchPlayer)
  const fetchQuests = useQuestStore((s) => s.fetchQuests)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  useEffect(() => {
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg?.language) setLanguage(cfg.language)
    }).catch(() => {})
    fetchPlayer()
    fetchQuests()
  }, [])

  useEffect(() => {
    return window.dataAPI.onUpdated(() => {
      fetchPlayer()
      fetchQuests()
    })
  }, [])

  return <QuestHudPanel />
}
