import { useEffect, useState } from 'react'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import { useAchievementStore } from './stores/achievementStore'
import { useMedalStore } from './stores/medalStore'
import { useSkillStore } from './stores/skillStore'
import { useLanguageStore } from './stores/languageStore'
import { useUIStore } from './stores/uiStore'
import { useT } from './utils/i18n'
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
import { ApiKeyWarningDialog } from './components/shared/ApiKeyWarningDialog'
import { ModalShell } from './components/shared/Panel'
import { MenuDock, type ScreenId } from './components/shell/MenuDock'

function getMondayISO(): string {
  const d = new Date()
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  return monday.toISOString().slice(0, 10)
}

function App(): JSX.Element {
  const { player, fetchPlayer, fetchAllPlayers } = usePlayerStore()
  const {
    quests,
    fetchQuests,
    createQuest,
    completeQuest,
    deleteQuest,
    transformQuest,
    autoTransform,
    transformingIds,
    loadSettings
  } = useQuestStore()
  const { achievements, fetchAchievements } = useAchievementStore()
  const { medals, fetchMedals } = useMedalStore()
  const { skills, fetchSkills } = useSkillStore()
  const { setLanguage } = useLanguageStore()
  const { setTheme } = useUIStore()
  const t = useT()
  const [initialized, setInitialized] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showMedals, setShowMedals] = useState(false)
  const [showSkillTree, setShowSkillTree] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenId>('board')

  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false)

  const [showDailyPlot, setShowDailyPlot] = useState(false)
  const [showWeeklyPlot, setShowWeeklyPlot] = useState(false)
  const [dailyPlotSummary, setDailyPlotSummary] = useState<string | undefined>()
  const [weeklyPlotSummary, setWeeklyPlotSummary] = useState<string | undefined>()
  const [loadingDailyPlot, setLoadingDailyPlot] = useState(false)
  const [loadingWeeklyPlot, setLoadingWeeklyPlot] = useState(false)
  const [dailyPlotError, setDailyPlotError] = useState<string | undefined>()
  const [weeklyPlotError, setWeeklyPlotError] = useState<string | undefined>()

  useEffect(() => {
    window.settingsAPI
      .getAiConfig()
      .then((cfg) => {
        setLanguage(cfg?.language ?? 'zh')
        if (cfg?.theme) setTheme(cfg.theme)
      })
      .catch(() => {})
    Promise.all([
      fetchPlayer(),
      fetchAllPlayers(),
      fetchQuests(),
      loadSettings(),
      fetchAchievements(),
      fetchMedals(),
      fetchSkills()
    ]).then(() => {
      setInitialized(true)
      const currentPlayer = usePlayerStore.getState().player
      if (currentPlayer) {
        window.settingsAPI
          .getAiConfig()
          .then((cfg) => {
            const hasKey =
              cfg?.provider === 'ollama' || (!!cfg?.apiKey && cfg.apiKey.trim().length > 0)
            if (!hasKey) setShowApiKeyWarning(true)
          })
          .catch(() => {})
      }
    })
  }, [])

  useEffect(() => {
    return window.dataAPI.onUpdated(() => {
      fetchQuests()
      fetchAchievements()
      fetchMedals()
      fetchSkills()
    })
  }, [])

  useEffect(() => {
    return window.companionAPI.onNavigate((target: unknown) => {
      const t = target as { target?: string }
      if (t?.target === 'plot') setShowDailyPlot(true)
    })
  }, [])

  const handleSwitched = async (): Promise<void> => {
    setDailyPlotSummary(undefined)
    setWeeklyPlotSummary(undefined)
    setActiveScreen('board')
    await Promise.all([
      fetchPlayer(),
      fetchAllPlayers(),
      fetchQuests(),
      fetchAchievements(),
      fetchMedals(),
      fetchSkills()
    ])
  }

  const handleOpenDailyPlot = async (): Promise<void> => {
    setDailyPlotError(undefined)
    setShowDailyPlot(true)
    if (dailyPlotSummary) return
    setLoadingDailyPlot(true)
    try {
      const summary = await window.plotAPI.generateDaily()
      setDailyPlotSummary(summary)
      fetchAchievements()
      fetchMedals()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setDailyPlotError(msg.includes('configured') ? t('configureAI') : msg)
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
      fetchAchievements()
      fetchMedals()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setWeeklyPlotError(msg.includes('configured') ? t('configureAI') : msg)
    }
    setLoadingWeeklyPlot(false)
  }

  if (!initialized) {
    return (
      <div className="rpg-scene flex min-h-screen items-center justify-center">
        <p className="text-ink-dim">{t('loading')}</p>
      </div>
    )
  }

  if (!player || showCreate) {
    return (
      <div className="rpg-scene flex min-h-screen items-center justify-center">
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

  const today = new Date().toISOString().slice(0, 10)
  const todayCompletedCount = quests.filter(
    (q) => q.status === 'completed' && q.completedAt?.startsWith(today)
  ).length

  const weekStart = getMondayISO()
  const weekCompletedCount = quests.filter(
    (q) => q.status === 'completed' && q.completedAt && q.completedAt >= weekStart
  ).length

  return (
    <div className="rpg-scene flex h-screen gap-4 overflow-hidden p-4">
      {showApiKeyWarning && <ApiKeyWarningDialog onClose={() => setShowApiKeyWarning(false)} />}
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
      {showMedals && <MedalGallery medals={medals} onClose={() => setShowMedals(false)} />}
      {showSkillTree && (
        <ModalShell
          title={t('skillTreeTitle')}
          onClose={() => setShowSkillTree(false)}
          className="h-[540px] w-[720px]"
        >
          <div className="min-h-0 flex-1 p-4">
            <SkillTree skills={skills} />
          </div>
        </ModalShell>
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
      <CharacterCard key={player.id} player={player} onManage={() => setShowManager(true)} />
      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <QuestInput onSubmit={createQuest} />
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <QuestList
            quests={quests}
            autoTransform={autoTransform}
            transformingIds={transformingIds}
            onComplete={completeQuest}
            onDelete={deleteQuest}
            onTransform={transformQuest}
          />
        </div>
      </div>
      <MenuDock
        active={activeScreen}
        onNavigate={(s) => {
          if (s === 'skills') setShowSkillTree(true)
          else if (s === 'achievements') setShowAchievements(true)
          else if (s === 'medals') setShowMedals(true)
          // journal: no-op in P1, plot handled via plotSlot
        }}
        onOpenSettings={() => setShowSettings(true)}
        achievementCount={unlockedCount}
        medalCount={medals.length}
        plotBadge={false}
        plotSlot={
          <>
            {todayCompletedCount >= 3 && (
              <PlotScrollButton type="daily" onOpen={handleOpenDailyPlot} />
            )}
            {weekCompletedCount >= 15 && (
              <PlotScrollButton type="weekly" onOpen={handleOpenWeeklyPlot} />
            )}
          </>
        }
      />
    </div>
  )
}

export default App
