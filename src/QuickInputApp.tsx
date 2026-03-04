import { useEffect } from 'react'
import QuickInput from './components/QuickInput'
import { useQuestStore } from './stores/questStore'

export default function QuickInputApp() {
  const loadSettings = useQuestStore((s) => s.loadSettings)

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div className="w-full h-screen">
      <QuickInput />
    </div>
  )
}
