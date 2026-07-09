import OpenAI from 'openai'
import type { ImageGenConfig } from '../../../src/types/background'

// Providers that speak the OpenAI images/generations dialect verbatim.
const OPENAI_COMPAT_BASE_URLS: Record<string, string | undefined> = {
  openai: undefined,
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3',
  baidu: 'https://qianfan.baidubce.com/v2'
}

// Landscape where the provider allows it, otherwise its safest square size.
const COMPAT_SIZES: Record<string, string> = {
  zhipu: '1344x768',
  doubao: '1280x720',
  baidu: '1024x1024'
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download generated image: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// User-supplied endpoint override (dedicated instances, proxies) wins over the official URL.
function baseOf(config: ImageGenConfig, official: string): string {
  return (config.baseUrl?.trim() || official).replace(/\/+$/, '')
}

export async function openaiCompatGenerate(config: ImageGenConfig, prompt: string): Promise<Buffer> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl?.trim() || OPENAI_COMPAT_BASE_URLS[config.provider],
    timeout: 120000
  })
  const size =
    COMPAT_SIZES[config.provider] ??
    (config.model.startsWith('dall-e') ? '1792x1024' : '1536x1024')
  const resp = await client.images.generate({
    model: config.model,
    prompt,
    n: 1,
    size: size as OpenAI.Images.ImageGenerateParams['size']
  })
  const item = resp.data?.[0]
  if (item?.b64_json) return Buffer.from(item.b64_json, 'base64')
  if (item?.url) return downloadImage(item.url)
  throw new Error('Image generation returned no data')
}

export async function siliconflowGenerate(config: ImageGenConfig, prompt: string): Promise<Buffer> {
  const res = await fetch(`${baseOf(config, 'https://api.siliconflow.cn/v1')}/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.model, prompt, image_size: '1024x1024', batch_size: 1 })
  })
  if (!res.ok) throw new Error(`SiliconFlow ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as { images?: { url?: string }[] }
  const url = json.images?.[0]?.url
  if (!url) throw new Error('Image generation returned no data')
  return downloadImage(url)
}

export async function minimaxGenerate(config: ImageGenConfig, prompt: string): Promise<Buffer> {
  const res = await fetch(`${baseOf(config, 'https://api.minimax.chat/v1')}/image_generation`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt,
      aspect_ratio: '16:9',
      response_format: 'url',
      n: 1
    })
  })
  if (!res.ok) throw new Error(`MiniMax ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as {
    data?: { image_urls?: string[] }
    base_resp?: { status_code?: number; status_msg?: string }
  }
  if (json.base_resp?.status_code) throw new Error(`MiniMax: ${json.base_resp.status_msg}`)
  const url = json.data?.image_urls?.[0]
  if (!url) throw new Error('Image generation returned no data')
  return downloadImage(url)
}

// DashScope text-to-image is async: submit a task, then poll until it settles.
export async function dashscopeGenerate(config: ImageGenConfig, prompt: string): Promise<Buffer> {
  const auth = { Authorization: `Bearer ${config.apiKey}` }
  const base = baseOf(config, 'https://dashscope.aliyuncs.com/api/v1')
  const submit = await fetch(
    `${base}/services/aigc/text2image/image-synthesis`,
    {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json', 'X-DashScope-Async': 'enable' },
      body: JSON.stringify({
        model: config.model,
        input: { prompt },
        parameters: { size: '1280*720', n: 1 }
      })
    }
  )
  if (!submit.ok) throw new Error(`DashScope ${submit.status}: ${await submit.text()}`)
  const taskId = ((await submit.json()) as { output?: { task_id?: string } }).output?.task_id
  if (!taskId) throw new Error('DashScope: no task id returned')
  for (let i = 0; i < 40; i++) {
    await sleep(3000)
    const poll = await fetch(`${base}/tasks/${taskId}`, {
      headers: auth
    })
    const out = ((await poll.json()) as {
      output?: { task_status?: string; message?: string; results?: { url?: string }[] }
    }).output
    if (out?.task_status === 'SUCCEEDED') {
      const url = out.results?.[0]?.url
      if (!url) throw new Error('Image generation returned no data')
      return downloadImage(url)
    }
    if (out?.task_status === 'FAILED') {
      throw new Error(`DashScope: ${out.message ?? 'generation failed'}`)
    }
  }
  throw new Error('DashScope: generation timed out')
}
