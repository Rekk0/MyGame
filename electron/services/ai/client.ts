import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

interface AISettings {
  provider: 'claude' | 'openai' | 'deepseek' | 'kimi' | 'minimax' | 'gemini' | 'groq' | 'qwen' | 'zhipu' | 'grok' | 'ollama'
  apiKey: string
  model: string
  language?: 'zh' | 'en'
}

const BASE_URLS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com',
  kimi: 'https://api.moonshot.cn/v1',
  minimax: 'https://api.minimax.chat/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  groq: 'https://api.groq.com/openai/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  grok: 'https://api.x.ai/v1',
  ollama: 'http://localhost:11434/v1',
}

function loadSettings(): AISettings | null {
  const p = join(app.getPath('userData'), 'ai-settings.json')
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return null }
}

async function callClaude(prompt: string, system: string, apiKey: string, model: string, timeoutMs: number): Promise<string> {
  const client = new Anthropic({ apiKey, timeout: timeoutMs })
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

async function callOpenAICompatible(prompt: string, system: string, apiKey: string, model: string, provider: string, timeoutMs: number): Promise<string> {
  const baseURL = BASE_URLS[provider]
  const client = new OpenAI({ apiKey: apiKey || 'ollama', baseURL, timeout: timeoutMs })
  const resp = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
  })
  return resp.choices[0]?.message?.content ?? ''
}

export async function callAI(
  prompt: string,
  systemPrompt: string,
  opts?: { timeoutMs?: number }
): Promise<string> {
  const settings = loadSettings()
  if (!settings?.apiKey && settings?.provider !== 'ollama') throw new Error('AI service not configured')
  const system = settings.language === 'en'
    ? `${systemPrompt}\nPlease respond in English.`
    : systemPrompt
  const timeoutMs = opts?.timeoutMs ?? 30000
  if (settings.provider === 'claude') {
    return callClaude(prompt, system, settings.apiKey, settings.model, timeoutMs)
  }
  return callOpenAICompatible(prompt, system, settings.apiKey, settings.model, settings.provider, timeoutMs)
}
