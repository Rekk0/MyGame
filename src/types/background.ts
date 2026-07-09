export type ImageGenProvider =
  | 'openai'
  | 'zhipu'
  | 'doubao'
  | 'qwen'
  | 'baidu'
  | 'minimax'
  | 'siliconflow'

export interface ImageGenConfig {
  provider: ImageGenProvider
  apiKey: string
  model: string
  /** Optional endpoint override, e.g. an Alibaba MaaS dedicated instance. Empty = official. */
  baseUrl?: string
}
