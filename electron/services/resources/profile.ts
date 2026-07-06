import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { getActivePlayerId } from '../db/repositories/playerRepo'
import { biasSamples } from '../db/repositories/calibrationRepo'
import { biasToScales, computeBias, IDENTITY_SCALES } from './calibration'
import type { CoeffScales } from './calibration'

interface ProfileEntry { scales: CoeffScales; sampleCount: number; updatedAt: string }
type ProfileFile = Record<string, ProfileEntry>

function profilePath(): string {
  return join(app.getPath('userData'), 'calibration-profile.json')
}

function readAll(): ProfileFile {
  const p = profilePath()
  if (!existsSync(p)) return {}
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return {} }
}

export function getScales(): CoeffScales {
  const entry = readAll()[getActivePlayerId()]
  return entry?.scales ?? IDENTITY_SCALES
}

export function recomputeProfile(): CoeffScales {
  const samples = biasSamples()
  const scales = biasToScales(computeBias(samples), samples.length)
  const all = readAll()
  all[getActivePlayerId()] = { scales, sampleCount: samples.length, updatedAt: new Date().toISOString() }
  writeFileSync(profilePath(), JSON.stringify(all))
  return scales
}
