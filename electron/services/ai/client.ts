import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

interface AISettings {
  provider: 'claude' | 'openai' | 'deepseek' | 'kimi' | 'minimax'
  apiKey: string
  model: string
}

const BASE_URLS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com',
  kimi: 'https://api.moonshot.cn/v1',
  minimax: 'https://api.minimax.chat/v1',
}

function loadSettings(): AISettings | null {
  const p = join(app.getPath('userData'), 'ai-settings.json')
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return null }
}

async function callClaude(prompt: string, system: string, apiKey: string, model: string): Promise<string> {
  const client = new Anthropic({ apiKey, timeout: 30000 })
  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content[0]
  if (block.type !== 'text') throw new Error('Unexpected content type')
  return block.text
}

async function callOpenAICompatible(prompt: string, system: string, apiKey: string, model: string, provider: string): Promise<string> {
  const baseURL = BASE_URLS[provider]
  const client = new OpenAI({ apiKey, baseURL, timeout: 30000 })
  const resp = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
  })
  return resp.choices[0]?.message?.content ?? ''
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  const settings = loadSettings()
  if (!settings?.apiKey) throw new Error('AI service not configured')
  if (settings.provider === 'claude') {
    return callClaude(prompt, systemPrompt, settings.apiKey, settings.model)
  }
  return callOpenAICompatible(prompt, systemPrompt, settings.apiKey, settings.model, settings.provider)
}
