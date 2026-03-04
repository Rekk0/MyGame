import { useEffect, useState } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import { useStreakStore } from './stores/streakStore'
import { useAchievementStore } from './stores/achievementStore'
import { CharacterCard } from './components/CharacterCard'
import { CharacterManager } from './components/CharacterCard/CharacterManager'
import { QuestInput } from './components/QuestBoard/QuestInput'
import { QuestList } from './components/QuestBoard/QuestList'
import { CreateCharacter } from './components/CharacterCard/CreateCharacter'
import { Settings } from './components/shared/Settings'
import { AchievementList } from './components/Achievement/AchievementList'

function App(): JSX.Element {
  const { player, fetchPlayer, fetchAllPlayers } = usePlayerStore()
  const { quests, fetchQuests, createQuest, completeQuest, deleteQuest, transformQuest, autoTransform, transformingIds, loadSettings } = useQuestStore()
  const { streak, fetchStreak } = useStreakStore()
  const { achievements, fetchAchievements } = useAchievementStore()
  const [initialized, setInitialized] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  useEffect(() => {
    Promise.all([fetchPlayer(), fetchAllPlayers(), fetchQuests(), fetchStreak(), loadSettings(), fetchAchievements()]).then(() => {
      setInitialized(true)
    })
  }, [])

  useEffect(() => {
    return window.dataAPI.onUpdated(() => { fetchQuests(); fetchAchievements() })
  }, [])

  const handleSwitched = async (): Promise<void> => {
    await Promise.all([fetchPlayer(), fetchAllPlayers(), fetchQuests(), fetchStreak(), fetchAchievements()])
  }

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  if (!player || showCreate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <CreateCharacter
          onCreated={async () => {
            await handleSwitched()
            setShowCreate(false)
          }}
        />
      </div>
    )
  }

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length

  return (
    <div className="flex min-h-screen bg-gray-900 p-6 gap-6">
      {showManager && (
        <CharacterManager
          currentPlayer={player}
          onClose={() => setShowManager(false)}
          onCreateNew={() => setShowCreate(true)}
          onSwitched={handleSwitched}
        />
      )}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showAchievements && (
        <AchievementList achievements={achievements} onClose={() => setShowAchievements(false)} />
      )}
      <CharacterCard player={player} onManage={() => setShowManager(true)} />
      <div className="flex flex-1 flex-col gap-4">
        <QuestInput onSubmit={createQuest} />
        <QuestList quests={quests} autoTransform={autoTransform} transformingIds={transformingIds}
          onComplete={completeQuest} onDelete={deleteQuest} onTransform={transformQuest} />
      </div>
      <div className="flex w-28 flex-col items-center pt-2">
        <p className="text-2xl font-bold text-orange-400">🔥 {streak?.currentCount ?? 0}</p>
        <p className="mt-1 text-xs text-gray-500">连胜天数</p>
        {streak && streak.bestCount > 0 && (
          <p className="mt-1 text-xs text-gray-600">最高 {streak.bestCount} 天</p>
        )}
        <button
          onClick={() => setShowAchievements(true)}
          className="mt-4 text-gray-600 hover:text-yellow-400 text-lg"
          title="成就"
        >
          🏆 {unlockedCount}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="mt-2 text-gray-600 hover:text-gray-400 text-lg"
          title="AI 设置"
        >
          ⚙
        </button>
      </div>
    </div>
  )
}

export default App
