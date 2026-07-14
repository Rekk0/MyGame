import { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { usePlayerStore } from './stores/playerStore'
import { useQuestStore } from './stores/questStore'
import { useAchievementStore } from './stores/achievementStore'
import { useMedalStore } from './stores/medalStore'
import { useSkillStore } from './stores/skillStore'
import { useLanguageStore } from './stores/languageStore'
import { useUIStore } from './stores/uiStore'
import { useBackgroundStore } from './stores/backgroundStore'
import { useT } from './utils/i18n'
import { CharacterCard } from './components/CharacterCard'
import { CharacterManager } from './components/CharacterCard/CharacterManager'
import { QuestInput } from './components/QuestBoard/QuestInput'
import { QuestList } from './components/QuestBoard/QuestList'
import { CreateCharacter } from './components/CharacterCard/CreateCharacter'
import { Settings } from './components/shared/Settings'
import { AchievementsScreen } from './components/Achievement/AchievementList'
import { MedalsScreen } from './components/MedalGallery'
import { SkillTree } from './components/SkillTree'
import { SkillRevealModal } from './components/SkillTree/SkillRevealModal'
import { SkillLevelUpModal } from './components/SkillTree/SkillLevelUpModal'
import { JournalScreen } from './components/Journal'
import { ApiKeyWarningDialog } from './components/shared/ApiKeyWarningDialog'
import { ScreenShell } from './components/shared/ScreenShell'
import { MenuDock, type ScreenId } from './components/shell/MenuDock'

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
  const { setTheme, reducedMotion } = useUIStore()
  const t = useT()
  const [initialized, setInitialized] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenId>('board')
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false)
  const bgUrl = useBackgroundStore((s) => s.bgUrl)

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
      if (t?.target === 'plot') setActiveScreen('journal')
    })
  }, [])

  // 画像重建成功 → 自动占卜并弹「即将习得」（跨页面，SkillRevealModal 挂在 App 根）
  useEffect(() => {
    return window.skillAPI.onProfileReady(() => {
      void useSkillStore.getState().divine()
    })
  }, [])

  // 技能升级 → 弹「技能精进」并刷新技能（节点视觉随等级更新）
  useEffect(() => {
    return window.skillAPI.onLeveledUp((e) => {
      useSkillStore.getState().showLevelUp(e)
      void useSkillStore.getState().fetchSkills()
    })
  }, [])

  // AI 技能图标后台生成完成 → 刷新技能让图标显现
  useEffect(() => {
    return window.skillAPI.onUpdated(() => {
      void useSkillStore.getState().fetchSkills()
    })
  }, [])

  useEffect(() => {
    if (player) document.documentElement.setAttribute('data-world', player.worldStyle)
    else document.documentElement.removeAttribute('data-world')
    if (player) void useBackgroundStore.getState().fetchBackground(player.worldStyle)
  }, [player?.worldStyle])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeScreen !== 'board') {
        setActiveScreen('board')
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [activeScreen])

  const handleSwitched = async (): Promise<void> => {
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

  function renderScreen(): JSX.Element {
    switch (activeScreen) {
      case 'achievements':
        return <AchievementsScreen achievements={achievements} />
      case 'skills':
        return (
          <ScreenShell title={t('skillTreeTitle')} fullBleed>
            <SkillTree skills={skills} />
          </ScreenShell>
        )
      case 'medals':
        return <MedalsScreen medals={medals} />
      case 'journal':
        return <JournalScreen />
      case 'board':
      default:
        return (
          <>
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
          </>
        )
    }
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

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
      <div
        className={`${bgUrl ? 'rpg-scene-custom' : 'rpg-scene'} flex h-screen gap-4 overflow-hidden p-4`}
        style={bgUrl ? ({ '--scene-bg-image': `url("${bgUrl}")` } as React.CSSProperties) : undefined}
      >
        {showApiKeyWarning && <ApiKeyWarningDialog onClose={() => setShowApiKeyWarning(false)} />}
        <SkillRevealModal />
        <SkillLevelUpModal />
        {showManager && (
          <CharacterManager
            currentPlayer={player}
            onClose={() => setShowManager(false)}
            onCreateNew={() => setShowCreate(true)}
            onSwitched={handleSwitched}
          />
        )}
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        <CharacterCard key={player.id} player={player} onManage={() => setShowManager(true)} />
        <div className="flex flex-1 flex-col gap-4 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeScreen}-${player.id}`}
              className="flex flex-1 flex-col gap-4 min-h-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
        <MenuDock
          active={activeScreen}
          onNavigate={(s) => setActiveScreen(s)}
          onOpenSettings={() => setShowSettings(true)}
          achievementCount={unlockedCount}
          medalCount={medals.length}
        />
      </div>
    </MotionConfig>
  )
}

export default App
