import { useState, useEffect } from 'react'
import { Button } from './Button'
import { useQuestStore } from '../../stores/questStore'

const PROVIDERS = [
  { value: 'claude', label: 'Claude (Anthropic)', defaultModel: 'claude-sonnet-4-5' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini' },
  { value: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat' },
  { value: 'kimi', label: 'Kimi (Moonshot)', defaultModel: 'moonshot-v1-8k' },
  { value: 'minimax', label: 'MiniMax', defaultModel: 'abab6.5s-chat' },
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

  useEffect(() => {
    window.settingsAPI.getAiConfig().then((cfg) => {
      if (cfg) {
        setProvider(cfg.provider)
        setApiKey(cfg.apiKey)
        setModel(cfg.model)
        setAutoTransform(cfg.autoTransform ?? true)
      }
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

  const handleSave = async (): Promise<void> => {
    await window.settingsAPI.setAiConfig({ provider, apiKey, model, autoTransform })
    useQuestStore.getState().setAutoTransform(autoTransform)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="rounded-xl bg-gray-800 p-6 w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">AI 设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">AI 服务商</label>
          <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}
            className="rounded bg-gray-700 text-white px-3 py-2 text-sm">
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">API Key</label>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入 API Key" className="rounded bg-gray-700 text-white px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">模型名称</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
            className="rounded bg-gray-700 text-white px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">自动游戏化</span>
          <button onClick={handleToggleClick}
            className={`w-11 h-6 rounded-full transition-colors ${autoTransform ? 'bg-blue-500' : 'bg-gray-600'}`}>
            <span className={`block w-5 h-5 m-0.5 rounded-full bg-white transition-transform ${autoTransform ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {pendingToggle !== null && (
          <div className="rounded-lg bg-gray-700 p-3 flex flex-col gap-2">
            <p className="text-xs text-gray-300">
              {pendingToggle ? '开启后会自动消耗AI配额以游戏化任务' : '关闭后需要手动允许任务AI游戏化'}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPendingToggle(null)} className="text-xs text-gray-400 hover:text-white px-2 py-1">取消</button>
              <button onClick={handleConfirm} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">确定</button>
            </div>
          </div>
        )}
        <Button variant="primary" onClick={handleSave}>{saved ? '已保存 ✓' : '保存'}</Button>
      </div>
    </div>
  )
}
