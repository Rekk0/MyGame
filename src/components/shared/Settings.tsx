import { useState, useEffect } from 'react'
import { Button } from './Button'
import { useQuestStore } from '../../stores/questStore'
import { useLanguageStore, type Language } from '../../stores/languageStore'
import { useUIStore, type Theme } from '../../stores/uiStore'
import { useT } from '../../utils/i18n'

const PROVIDERS = [
  { value: 'claude', label: 'Claude (Anthropic)', defaultModel: 'claude-sonnet-4-5' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini' },
  { value: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat' },
  { value: 'kimi', label: 'Kimi (Moonshot)', defaultModel: 'moonshot-v1-8k' },
  { value: 'minimax', label: 'MiniMax', defaultModel: 'abab6.5s-chat' },
  { value: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-2.0-flash' },
  { value: 'groq', label: 'Groq', defaultModel: 'llama-3.3-70b-versatile' },
  { value: 'qwen', label: '通义千问 (Qwen)', defaultModel: 'qwen-plus' },
  { value: 'zhipu', label: '智谱 GLM', defaultModel: 'glm-4-flash' },
  { value: 'grok', label: 'xAI Grok', defaultModel: 'grok-3-mini' },
  { value: 'ollama', label: 'Ollama (本地)', defaultModel: 'llama3.2' },
]

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
  const { language, setLanguage } = useLanguageStore()
  const { theme, setTheme } = useUIStore()
  const t = useT()

  useEffect(() => {
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg) {
        setProvider(cfg.provider)
        setApiKey(cfg.apiKey)
        setModel(cfg.model)
        setAutoTransform(cfg.autoTransform ?? true)
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
    void window.windowAPI.saveHudConfig({ hudBgOpacity: bg / 100, hudTextOpacity: text / 100 })
  }

  const handleLanguageChange = (lang: Language): void => {
    setLanguage(lang)
  }

  const handleThemeChange = (t: Theme): void => {
    setTheme(t)
  }

  const handleSave = async (): Promise<void> => {
    await window.settingsAPI.setAiConfig({ provider, apiKey, model, autoTransform, language, theme })
    useQuestStore.getState().setAutoTransform(autoTransform)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="rounded-xl bg-gray-800 p-6 w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t('aiSettings')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">{t('aiProvider')}</label>
          <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}
            className="rounded bg-gray-700 text-white px-3 py-2 text-sm">
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">{t('apiKey')}</label>
          {provider === 'ollama' ? (
            <p className="text-xs text-gray-500 px-3 py-2">Ollama 本地服务无需 API Key</p>
          ) : (
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key" className="rounded bg-gray-700 text-white px-3 py-2 text-sm outline-none" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">{t('modelName')}</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
            className="rounded bg-gray-700 text-white px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{t('autoGameify')}</span>
          <button onClick={handleToggleClick}
            className={`w-11 h-6 rounded-full transition-colors ${autoTransform ? 'bg-blue-500' : 'bg-gray-600'}`}>
            <span className={`block w-5 h-5 m-0.5 rounded-full bg-white transition-transform ${autoTransform ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {pendingToggle !== null && (
          <div className="rounded-lg bg-gray-700 p-3 flex flex-col gap-2">
            <p className="text-xs text-gray-300">
              {pendingToggle ? t('autoOnHint') : t('autoOffHint')}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPendingToggle(null)} className="text-xs text-gray-400 hover:text-white px-2 py-1">{t('cancel')}</button>
              <button onClick={handleConfirm} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">{t('confirm')}</button>
            </div>
          </div>
        )}
        <div className="border-t border-gray-700 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">{t('language')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('zh')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${language === 'zh' ? 'border-blue-500 text-blue-400' : 'border-gray-600 text-gray-400 hover:text-white'}`}
              >中文</button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${language === 'en' ? 'border-blue-500 text-blue-400' : 'border-gray-600 text-gray-400 hover:text-white'}`}
              >English</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">{t('theme')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${theme === 'dark' ? 'border-blue-500 text-blue-400' : 'border-gray-600 text-gray-400 hover:text-white'}`}
              >🌙</button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${theme === 'light' ? 'border-blue-500 text-blue-400' : 'border-gray-600 text-gray-400 hover:text-white'}`}
              >☀️</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-3 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-300">{t('hudAppearance')}</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">{t('bgOpacity')}</label>
              <span className="text-xs text-gray-300 w-8 text-right">{hudBgOpacity}%</span>
            </div>
            <input type="range" min={0} max={100} value={hudBgOpacity}
              onChange={(e) => {
                const v = Number(e.target.value)
                setHudBgOpacity(v)
                handleHudOpacityChange(v, hudTextOpacity)
              }}
              className="w-full accent-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">{t('textOpacity')}</label>
              <span className="text-xs text-gray-300 w-8 text-right">{hudTextOpacity}%</span>
            </div>
            <input type="range" min={0} max={100} value={hudTextOpacity}
              onChange={(e) => {
                const v = Number(e.target.value)
                setHudTextOpacity(v)
                handleHudOpacityChange(hudBgOpacity, v)
              }}
              className="w-full accent-blue-500" />
          </div>
        </div>
        <Button variant="primary" onClick={handleSave}>{saved ? t('saved') : t('save')}</Button>
      </div>
    </div>
  )
}
