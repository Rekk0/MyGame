import { useEffect } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import QuestHudPanel from './components/HUD/QuestHudPanel'

export default function QuestHudApp() {
  const fetchPlayer = usePlayerStore((s) => s.fetchPlayer)
  const fetchQuests = useQuestStore((s) => s.fetchQuests)

  useEffect(() => {
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
