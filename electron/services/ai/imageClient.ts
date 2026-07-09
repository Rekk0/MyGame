import { readImageGenConfig } from '../backgroundConfig'
import {
  openaiCompatGenerate,
  siliconflowGenerate,
  minimaxGenerate,
  dashscopeGenerate
} from './imageProviders'

export async function generateImage(prompt: string): Promise<Buffer> {
  const config = readImageGenConfig()
  if (!config?.apiKey) throw new Error('Image generation API not configured')
  switch (config.provider) {
    case 'qwen':
      return dashscopeGenerate(config, prompt)
    case 'minimax':
      return minimaxGenerate(config, prompt)
    case 'siliconflow':
      return siliconflowGenerate(config, prompt)
    default:
      // openai / zhipu / doubao / baidu — OpenAI images-compatible
      return openaiCompatGenerate(config, prompt)
  }
}
