import { useEffect, useState } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import { useStreakStore } from './stores/streakStore'
import { CharacterCard } from './components/CharacterCard'
import { QuestInput } from './components/QuestBoard/QuestInput'
import { QuestList } from './components/QuestBoard/QuestList'
import { CreateCharacter } from './components/CharacterCard/CreateCharacter'

function App(): JSX.Element {
  const { player, fetchPlayer } = usePlayerStore()
  const { quests, fetchQuests, createQuest, completeQuest, deleteQuest } = useQuestStore()
  const { streak, fetchStreak } = useStreakStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    Promise.all([fetchPlayer(), fetchQuests(), fetchStreak()]).then(() => {
      setInitialized(true)
    })
  }, [])

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <CreateCharacter onCreated={fetchPlayer} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-900 p-6 gap-6">
      <CharacterCard player={player} />
      <div className="flex flex-1 flex-col gap-4">
        <QuestInput onSubmit={createQuest} />
        <QuestList quests={quests} onComplete={completeQuest} onDelete={deleteQuest} />
      </div>
      <div className="flex w-28 flex-col items-center pt-2">
        <p className="text-2xl font-bold text-orange-400">🔥 {streak?.currentCount ?? 0}</p>
        <p className="mt-1 text-xs text-gray-500">连胜天数</p>
        {streak && streak.bestCount > 0 && (
          <p className="mt-1 text-xs text-gray-600">最高 {streak.bestCount} 天</p>
        )}
      </div>
    </div>
  )
}

export default App
