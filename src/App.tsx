import { useEffect, useState } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import { useStreakStore } from './stores/streakStore'
import { useAchievementStore } from './stores/achievementStore'
import { useMedalStore } from './stores/medalStore'
import { useSkillStore } from './stores/skillStore'
import { CharacterCard } from './components/CharacterCard'
import { CharacterManager } from './components/CharacterCard/CharacterManager'
import { QuestInput } from './components/QuestBoard/QuestInput'
import { QuestList } from './components/QuestBoard/QuestList'
import { CreateCharacter } from './components/CharacterCard/CreateCharacter'
import { Settings } from './components/shared/Settings'
import { AchievementList } from './components/Achievement/AchievementList'
import { MedalGallery } from './components/MedalGallery'
import { SkillTree } from './components/SkillTree'
import { PlotScrollButton, PlotModal } from './components/PlotScroll'

type DdaState = 'anxious' | 'flow' | 'bored'
interface DdaInfo { state: DdaState; xpMultiplier: number; suggestion: string }
interface DdaSuggestion { mood: string; tips: string[]; suggestedQuestTypes: string[] }

const DDA_ICONS: Record<DdaState, string> = { anxious: '😰', flow: '🌊', bored: '😴' }
const DDA_COLORS: Record<DdaState, string> = { anxious: 'text-red-400', flow: 'text-cyan-400', bored: 'text-yellow-400' }
const DDA_LABELS: Record<DdaState, string> = { anxious: '焦虑', flow: '心流', bored: '无聊' }

function getMondayISO(): string {
  const d = new Date()
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  return monday.toISOString().slice(0, 10)
}

function App(): JSX.Element {
  const { player, fetchPlayer, fetchAllPlayers } = usePlayerStore()
  const { quests, fetchQuests, createQuest, completeQuest, deleteQuest, transformQuest, autoTransform, transformingIds, loadSettings } = useQuestStore()
  const { streak, fetchStreak } = useStreakStore()
  const { achievements, fetchAchievements } = useAchievementStore()
  const { medals, fetchMedals } = useMedalStore()
  const { skills, fetchSkills } = useSkillStore()
  const [initialized, setInitialized] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showMedals, setShowMedals] = useState(false)
  const [showSkillTree, setShowSkillTree] = useState(false)
  const [ddaInfo, setDdaInfo] = useState<DdaInfo | null>(null)
  const [ddaSuggestion, setDdaSuggestion] = useState<DdaSuggestion | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  const [showDailyPlot, setShowDailyPlot] = useState(false)
  const [showWeeklyPlot, setShowWeeklyPlot] = useState(false)
  const [dailyPlotSummary, setDailyPlotSummary] = useState<string | undefined>()
  const [weeklyPlotSummary, setWeeklyPlotSummary] = useState<string | undefined>()
  const [loadingDailyPlot, setLoadingDailyPlot] = useState(false)
  const [loadingWeeklyPlot, setLoadingWeeklyPlot] = useState(false)
  const [dailyPlotError, setDailyPlotError] = useState<string | undefined>()
  const [weeklyPlotError, setWeeklyPlotError] = useState<string | undefined>()

  useEffect(() => {
    Promise.all([fetchPlayer(), fetchAllPlayers(), fetchQuests(), fetchStreak(), loadSettings(), fetchAchievements(), fetchMedals(), fetchSkills()]).then(() => {
      setInitialized(true)
      window.ddaAPI.getState().then(setDdaInfo).catch(() => {})
    })
  }, [])

  useEffect(() => {
    return window.dataAPI.onUpdated(() => {
      fetchQuests(); fetchAchievements(); fetchMedals(); fetchSkills()
      window.ddaAPI.getState().then(setDdaInfo).catch(() => {})
    })
  }, [])

  const handleSwitched = async (): Promise<void> => {
    setDdaSuggestion(null)
    setDailyPlotSummary(undefined)
    setWeeklyPlotSummary(undefined)
    await Promise.all([fetchPlayer(), fetchAllPlayers(), fetchQuests(), fetchStreak(), fetchAchievements(), fetchMedals(), fetchSkills()])
    window.ddaAPI.getState().then(setDdaInfo).catch(() => {})
  }

  const handleShowSuggestion = async (): Promise<void> => {
    setShowSuggestion(true)
    if (!ddaSuggestion) {
      setLoadingSuggestion(true)
      try {
        const s = await window.ddaAPI.getSuggestion()
        setDdaSuggestion(s)
      } catch { /* ignore */ }
      setLoadingSuggestion(false)
    }
  }

  const handleOpenDailyPlot = async (): Promise<void> => {
    setDailyPlotError(undefined)
    setShowDailyPlot(true)
    if (dailyPlotSummary) return
    setLoadingDailyPlot(true)
    try {
      const summary = await window.plotAPI.generateDaily()
      setDailyPlotSummary(summary)
      fetchAchievements(); fetchMedals()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setDailyPlotError(msg.includes('configured') ? '请先配置 AI（点击 ⚙ 设置）' : msg)
    }
    setLoadingDailyPlot(false)
  }

  const handleOpenWeeklyPlot = async (): Promise<void> => {
    setWeeklyPlotError(undefined)
    setShowWeeklyPlot(true)
    if (weeklyPlotSummary) return
    setLoadingWeeklyPlot(true)
    try {
      const summary = await window.plotAPI.generateWeekly()
      setWeeklyPlotSummary(summary)
      fetchAchievements(); fetchMedals()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setWeeklyPlotError(msg.includes('configured') ? '请先配置 AI（点击 ⚙ 设置）' : msg)
    }
    setLoadingWeeklyPlot(false)
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
  const streakCount = streak?.currentCount ?? 0
  const streakBonus = streakCount >= 30 ? 25 : streakCount >= 7 ? 10 : 0

  const today = new Date().toISOString().slice(0, 10)
  const todayCompletedCount = quests.filter(
    (q) => q.status === 'completed' && q.completedAt?.startsWith(today)
  ).length

  const weekStart = getMondayISO()
  const weekCompletedCount = quests.filter(
    (q) => q.status === 'completed' && q.completedAt && q.completedAt >= weekStart
  ).length

  return (
    <div className="flex h-screen bg-gray-900 p-4 gap-4 overflow-hidden">
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
      {showMedals && (
        <MedalGallery medals={medals} onClose={() => setShowMedals(false)} />
      )}
      {showSkillTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl w-[700px] h-[500px] flex flex-col p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-bold text-lg">技能树</h2>
              <button onClick={() => setShowSkillTree(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1">
              <SkillTree skills={skills} />
            </div>
          </div>
        </div>
      )}
      {showSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowSuggestion(false)}>
          <div className="bg-gray-800 rounded-xl p-5 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">今日建议</h3>
              <button onClick={() => setShowSuggestion(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {loadingSuggestion ? (
              <p className="text-gray-400 text-sm">AI 生成中...</p>
            ) : ddaSuggestion ? (
              <>
                <p className="text-cyan-300 text-sm mb-2">状态：{ddaSuggestion.mood}</p>
                <ul className="space-y-1">
                  {ddaSuggestion.tips.map((tip, i) => (
                    <li key={i} className="text-gray-300 text-sm">• {tip}</li>
                  ))}
                </ul>
                {ddaSuggestion.suggestedQuestTypes.length > 0 && (
                  <p className="text-gray-500 text-xs mt-3">推荐类型：{ddaSuggestion.suggestedQuestTypes.join('、')}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">暂无建议（需配置 AI）</p>
            )}
          </div>
        </div>
      )}
      {showDailyPlot && (
        <PlotModal
          type="daily"
          onClose={() => setShowDailyPlot(false)}
          summary={dailyPlotSummary}
          loading={loadingDailyPlot}
          error={dailyPlotError}
        />
      )}
      {showWeeklyPlot && (
        <PlotModal
          type="weekly"
          onClose={() => setShowWeeklyPlot(false)}
          summary={weeklyPlotSummary}
          loading={loadingWeeklyPlot}
          error={weeklyPlotError}
        />
      )}
      <CharacterCard player={player} onManage={() => setShowManager(true)} />
      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <QuestInput onSubmit={createQuest} />
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <QuestList quests={quests} autoTransform={autoTransform} transformingIds={transformingIds}
            onComplete={completeQuest} onDelete={deleteQuest} onTransform={transformQuest} />
        </div>
      </div>
      <div className="flex w-28 shrink-0 flex-col items-center pt-2">
        <p className="text-2xl font-bold text-orange-400">🔥 {streakCount}</p>
        <p className="mt-1 text-xs text-gray-500">连胜天数</p>
        {streak && streak.bestCount > 0 && (
          <p className="mt-1 text-xs text-gray-600">最高 {streak.bestCount} 天</p>
        )}
        {streakBonus > 0 && (
          <p className="mt-1 text-xs text-green-400">+{streakBonus}% XP</p>
        )}
        {ddaInfo && (
          <button
            onClick={handleShowSuggestion}
            className={`mt-3 text-sm font-medium ${DDA_COLORS[ddaInfo.state]} hover:opacity-80`}
            title={ddaInfo.suggestion}
          >
            {DDA_ICONS[ddaInfo.state]} {DDA_LABELS[ddaInfo.state]}
          </button>
        )}
        <button
          onClick={() => setShowSkillTree(true)}
          className="mt-4 text-gray-600 hover:text-green-400 text-lg"
          title="技能树"
        >
          🌳
        </button>
        <button
          onClick={() => setShowAchievements(true)}
          className="mt-2 text-gray-600 hover:text-yellow-400 text-lg"
          title="成就"
        >
          🏆 {unlockedCount}
        </button>
        <button
          onClick={() => setShowMedals(true)}
          className="mt-2 text-gray-600 hover:text-yellow-300 text-lg"
          title="勋章"
        >
          🎖 {medals.length}
        </button>
        <div className="flex-1" />
        {todayCompletedCount >= 3 && (
          <PlotScrollButton type="daily" onOpen={handleOpenDailyPlot} />
        )}
        {weekCompletedCount >= 15 && (
          <PlotScrollButton type="weekly" onOpen={handleOpenWeeklyPlot} />
        )}
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
