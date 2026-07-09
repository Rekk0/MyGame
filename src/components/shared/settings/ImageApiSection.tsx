import { useState, useEffect } from 'react'
import { Button } from '../Button'
import { fieldClass } from './styles'
import { useT } from '../../../utils/i18n'
import type { ImageGenProvider } from '../../../types/background'

const IMAGE_PROVIDERS: {
  value: ImageGenProvider
  label: string
  defaultModel: string
  officialBase: string
}[] = [
  {
    value: 'openai',
    label: 'OpenAI (gpt-image-1 / DALL·E)',
    defaultModel: 'gpt-image-1',
    officialBase: 'https://api.openai.com/v1'
  },
  {
    value: 'zhipu',
    label: '智谱 CogView',
    defaultModel: 'cogview-3-flash',
    officialBase: 'https://open.bigmodel.cn/api/paas/v4'
  },
  {
    value: 'doubao',
    label: '豆包 · 火山方舟 (Seedream)',
    defaultModel: 'doubao-seedream-3-0-t2i-250415',
    officialBase: 'https://ark.cn-beijing.volces.com/api/v3'
  },
  {
    value: 'qwen',
    label: '通义万相 (DashScope)',
    defaultModel: 'wanx2.1-t2i-turbo',
    officialBase: 'https://dashscope.aliyuncs.com/api/v1'
  },
  {
    value: 'baidu',
    label: '百度千帆 (iRAG)',
    defaultModel: 'irag-1.0',
    officialBase: 'https://qianfan.baidubce.com/v2'
  },
  {
    value: 'minimax',
    label: 'MiniMax',
    defaultModel: 'image-01',
    officialBase: 'https://api.minimax.chat/v1'
  },
  {
    value: 'siliconflow',
    label: '硅基流动 SiliconFlow',
    defaultModel: 'Kwai-Kolors/Kolors',
    officialBase: 'https://api.siliconflow.cn/v1'
  }
]

/** Text-to-image API config — loads and saves independently of the background actions below it. */
export function ImageApiSection(): JSX.Element {
  const t = useT()
  const [provider, setProvider] = useState<ImageGenProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-image-1')
  const [baseUrl, setBaseUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.backgroundAPI.getConfig().then(({ config }) => {
      if (config) {
        setProvider(config.provider)
        setApiKey(config.apiKey)
        setModel(config.model)
        setBaseUrl(config.baseUrl ?? '')
      }
    })
  }, [])

  const handleProviderChange = (val: string): void => {
    const entry = IMAGE_PROVIDERS.find((p) => p.value === val)
    setProvider(val as ImageGenProvider)
    setModel(entry?.defaultModel ?? '')
    setBaseUrl('')
  }

  const handleSave = async (): Promise<void> => {
    await window.backgroundAPI.setConfig({
      provider,
      apiKey,
      model,
      baseUrl: baseUrl.trim() || undefined
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const officialBase = IMAGE_PROVIDERS.find((p) => p.value === provider)?.officialBase ?? ''

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-ink">{t('imageApiSection')}</h3>
      <label className="text-xs text-ink-dim">{t('imageProvider')}</label>
      <select
        value={provider}
        onChange={(e) => handleProviderChange(e.target.value)}
        className={fieldClass}
      >
        {IMAGE_PROVIDERS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <label className="text-xs text-ink-dim">{t('apiKey')}</label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API Key"
        className={fieldClass}
      />
      <label className="text-xs text-ink-dim">{t('modelName')}</label>
      <input
        type="text"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className={fieldClass}
      />
      <label className="text-xs text-ink-dim">{t('imageBaseUrl')}</label>
      <input
        type="text"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        placeholder={officialBase}
        className={fieldClass}
      />
      <Button variant="secondary" onClick={handleSave}>
        {saved ? t('saved') : t('save')}
      </Button>
    </div>
  )
}
