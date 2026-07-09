import { useState, useEffect } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { Button } from './Button'
import { HotkeyInput } from './HotkeyInput'
import { ModalShell } from './Panel'
import { useQuestStore } from '../../stores/questStore'
import { useLanguageStore, type Language } from '../../stores/languageStore'
import { useUIStore, type Theme } from '../../stores/uiStore'
import { useT } from '../../utils/i18n'

const PROVIDERS = [
  {
    value: 'claude',
    label: 'Claude (Anthropic)',
    defaultModel: 'claude-sonnet-4-5'
  },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini' },
  { value: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat' },
  { value: 'kimi', label: 'Kimi (Moonshot)', defaultModel: 'moonshot-v1-8k' },
  { value: 'minimax', label: 'MiniMax', defaultModel: 'abab6.5s-chat' },
  { value: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-2.0-flash' },
  { value: 'groq', label: 'Groq', defaultModel: 'llama-3.3-70b-versatile' },
  { value: 'qwen', label: '通义千问 (Qwen)', defaultModel: 'qwen-plus' },
  { value: 'zhipu', label: '智谱 GLM', defaultModel: 'glm-4-flash' },
  { value: 'grok', label: 'xAI Grok', defaultModel: 'grok-3-mini' },
  { value: 'ollama', label: 'Ollama (本地)', defaultModel: 'llama3.2' }
]

const fieldClass =
  'rounded border border-edge bg-abyss-deep px-3 py-2 text-sm text-ink-hi outline-none focus:border-edge-strong'
const pillClass = (active: boolean): string =>
  `text-xs px-3 py-1 rounded-full border transition-colors ${
    active ? 'border-gold text-gold' : 'border-edge text-ink-dim hover:text-ink-hi'
  }`

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps): JSX.Element {
  const [provider, setProvider] = useState('claude')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-5')
  const [autoTransform, setAutoTransform] = useState(true)
  const [saved, setSaved] = useState(false)
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null)
  const [hudBgOpacity, setHudBgOpacity] = useState(75)
  const [hudTextOpacity, setHudTextOpacity] = useState(100)
  const [quickInputHotkey, setQuickInputHotkey] = useState('Ctrl+Shift+Q')
  const { language, setLanguage } = useLanguageStore()
  const { theme, setTheme, reducedMotion, setReducedMotion } = useUIStore()
  const t = useT()

  useEffect(() => {
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg) {
        setProvider(cfg.provider)
        setApiKey(cfg.apiKey)
        setModel(cfg.model)
        setAutoTransform(cfg.autoTransform ?? true)
        if (cfg.quickInputHotkey) setQuickInputHotkey(cfg.quickInputHotkey)
      }
    })
    window.windowAPI.getHudConfig().then((cfg) => {
      setHudBgOpacity(Math.round((cfg.hudBgOpacity ?? 0.75) * 100))
      setHudTextOpacity(Math.round((cfg.hudTextOpacity ?? 1.0) * 100))
    })
  }, [])

  const handleProviderChange = (val: string): void => {
    setProvider(val)
    const def = PROVIDERS.find((p) => p.value === val)?.defaultModel ?? ''
    setModel(def)
  }

  const handleToggleClick = (): void => setPendingToggle(!autoTransform)

  const handleConfirm = (): void => {
    if (pendingToggle !== null) setAutoTransform(pendingToggle)
    setPendingToggle(null)
  }

  const handleHudOpacityChange = (bg: number, text: number): void => {
    void window.windowAPI.saveHudConfig({
      hudBgOpacity: bg / 100,
      hudTextOpacity: text / 100
    })
  }

  const handleSave = async (): Promise<void> => {
    await window.settingsAPI.setAiConfig({
      provider,
      apiKey,
      model,
      autoTransform,
      language,
      theme,
      quickInputHotkey
    })
    useQuestStore.getState().setAutoTransform(autoTransform)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ModalShell title={t('aiSettings')} onClose={onClose} className="max-h-[88vh] w-96">
      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-dim">{t('aiProvider')}</label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className={fieldClass}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-dim">{t('apiKey')}</label>
          {provider === 'ollama' ? (
            <p className="px-3 py-2 text-xs text-ink-dim">Ollama 本地服务无需 API Key</p>
          ) : (
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
              className={fieldClass}
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-dim">{t('modelName')}</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">{t('autoGameify')}</span>
          <button
            onClick={handleToggleClick}
            className={`h-6 w-11 rounded-full border transition-colors ${autoTransform ? 'border-edge-strong bg-gold' : 'border-edge bg-panel-raised'}`}
          >
            <span
              className={`m-0.5 block h-5 w-5 rounded-full bg-ink-hi transition-transform ${autoTransform ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
        {pendingToggle !== null && (
          <div className="flex flex-col gap-2 rounded-lg border border-edge bg-panel-raised p-3">
            <p className="text-xs text-ink">{pendingToggle ? t('autoOnHint') : t('autoOffHint')}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingToggle(null)}
                className="px-2 py-1 text-xs text-ink-dim hover:text-ink-hi"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="px-2 py-1 text-xs text-gold hover:brightness-125"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        )}
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
        <div className="flex flex-col gap-3 border-t border-edge pt-3">
          <h3 className="text-sm font-semibold text-ink">{t('hudAppearance')}</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-ink-dim">{t('bgOpacity')}</label>
              <span className="w-8 text-right text-xs tabular-nums text-ink">{hudBgOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={hudBgOpacity}
              onChange={(e) => {
                const v = Number(e.target.value)
                setHudBgOpacity(v)
                handleHudOpacityChange(v, hudTextOpacity)
              }}
              className="w-full accent-(--rpg-gold)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-ink-dim">{t('textOpacity')}</label>
              <span className="w-8 text-right text-xs tabular-nums text-ink">
                {hudTextOpacity}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={hudTextOpacity}
              onChange={(e) => {
                const v = Number(e.target.value)
                setHudTextOpacity(v)
                handleHudOpacityChange(hudBgOpacity, v)
              }}
              className="w-full accent-(--rpg-gold)"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-edge pt-3">
          <h3 className="text-sm font-semibold text-ink">{t('shortcuts')}</h3>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-dim">{t('quickInputShortcut')}</label>
            <HotkeyInput value={quickInputHotkey} onChange={setQuickInputHotkey} />
          </div>
        </div>
        <Button variant="primary" onClick={handleSave}>
          {saved ? t('saved') : t('save')}
        </Button>
      </div>
    </ModalShell>
  )
}
