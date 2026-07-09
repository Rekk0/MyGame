import { app } from 'electron'
import { join, extname } from 'path'
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  unlinkSync
} from 'fs'

import type { ImageGenConfig } from '../../src/types/background'

export type { ImageGenConfig }

const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
}

function getConfigPath(): string {
  return join(app.getPath('userData'), 'background-settings.json')
}

function getBackgroundDir(): string {
  const dir = join(app.getPath('userData'), 'backgrounds')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function readImageGenConfig(): ImageGenConfig | null {
  const p = getConfigPath()
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return null
  }
}

export function writeImageGenConfig(config: ImageGenConfig): void {
  writeFileSync(getConfigPath(), JSON.stringify(config))
}

export function getBackgroundPath(worldStyle: string): string | null {
  const dir = getBackgroundDir()
  for (const ext of EXTENSIONS) {
    const p = join(dir, `${worldStyle}${ext}`)
    if (existsSync(p)) return p
  }
  return null
}

export function clearBackground(worldStyle: string): void {
  const p = getBackgroundPath(worldStyle)
  if (p) unlinkSync(p)
}

export function saveGeneratedBackground(worldStyle: string, image: Buffer): string {
  clearBackground(worldStyle)
  const p = join(getBackgroundDir(), `${worldStyle}.png`)
  writeFileSync(p, image)
  return p
}

export function saveUploadedBackground(worldStyle: string, sourcePath: string): string | null {
  const ext = extname(sourcePath).toLowerCase()
  if (!MIME_TYPES[ext]) return null
  clearBackground(worldStyle)
  const p = join(getBackgroundDir(), `${worldStyle}${ext}`)
  copyFileSync(sourcePath, p)
  return p
}

export function getBackgroundDataUrl(worldStyle: string): string | null {
  const p = getBackgroundPath(worldStyle)
  if (!p) return null
  const mime = MIME_TYPES[extname(p).toLowerCase()]
  return `data:${mime};base64,${readFileSync(p).toString('base64')}`
}
