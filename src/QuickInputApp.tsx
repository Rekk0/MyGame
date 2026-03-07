import { useEffect } from 'react'
import QuickInput from './components/QuickInput'
import { useQuestStore } from './stores/questStore'
import { useLanguageStore } from './stores/languageStore'

export default function QuickInputApp() {
  const loadSettings = useQuestStore((s) => s.loadSettings)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  useEffect(() => {
    loadSettings()
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg?.language) setLanguage(cfg.language)
    }).catch(() => {})
  }, [])

  return (
    <div className="w-full h-screen">
      <QuickInput />
    </div>
  )
}
