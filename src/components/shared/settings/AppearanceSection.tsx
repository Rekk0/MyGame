import { Moon, Sun } from '@phosphor-icons/react'
import { pillClass } from './styles'
import { useLanguageStore, type Language } from '../../../stores/languageStore'
import { useUIStore, type Theme } from '../../../stores/uiStore'
import { useT } from '../../../utils/i18n'

/** Language / theme / reduced-motion — all backed directly by zustand stores. */
export function AppearanceSection(): JSX.Element {
  const { language, setLanguage } = useLanguageStore()
  const { theme, setTheme, reducedMotion, setReducedMotion } = useUIStore()
  const t = useT()

  return (
    <div className="flex flex-col gap-2 border-t border-edge pt-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-ink">{t('language')}</label>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('zh' as Language)}
            className={pillClass(language === 'zh')}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage('en' as Language)}
            className={pillClass(language === 'en')}
          >
            English
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm text-ink">{t('theme')}</label>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('dark' as Theme)}
            className={pillClass(theme === 'dark')}
            title="暗色"
          >
            <Moon size={14} weight={theme === 'dark' ? 'fill' : 'regular'} />
          </button>
          <button
            onClick={() => setTheme('light' as Theme)}
            className={pillClass(theme === 'light')}
            title="羊皮纸"
          >
            <Sun size={14} weight={theme === 'light' ? 'fill' : 'regular'} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink">{t('reducedMotion')}</span>
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          className={`h-6 w-11 rounded-full border transition-colors ${reducedMotion ? 'border-edge-strong bg-gold' : 'border-edge bg-panel-raised'}`}
        >
          <span
            className={`m-0.5 block h-5 w-5 rounded-full bg-ink-hi transition-transform ${reducedMotion ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  )
}
