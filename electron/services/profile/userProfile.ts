import { BrowserWindow } from 'electron'
import { IPC } from '../../../src/types/ipc'
import { callAI } from '../ai/client'
import { getAllQuests } from '../db/repositories/questRepo'
import { getProfile, upsertProfile } from '../db/repositories/userProfileRepo'
import { getActivePlayerId } from '../db/repositories/playerRepo'
import {
  buildUserProfilePrompt,
  buildUserProfileSystemPrompt,
  type ProfileTaskInput,
} from '../ai/prompts/userProfile'
import type { ProfileSummary } from '../../../src/types/profile'

const REBUILD_THRESHOLD = 10
const MAX_TASKS = 100

/** 达到阈值则后台重建画像。fire-and-forget：失败静默，绝不阻塞任务创建。 */
export function buildProfileIfDue(): void {
  void rebuildIfDue().catch(() => {})
}

async function rebuildIfDue(): Promise<void> {
  const playerId = getActivePlayerId()
  const quests = getAllQuests()
  const count = quests.length
  const profile = getProfile(playerId)
  const since = profile ? count - profile.questCountAtBuild : count
  if (since < REBUILD_THRESHOLD) return

  const tasks: ProfileTaskInput[] = quests.slice(-MAX_TASKS).map((q) => ({
    originalText: q.originalText,
    type: q.type,
    E: q.userEnergyPct ?? q.aiEnergyPct,
    D: q.userDrive ?? q.aiDrive,
    L: q.userLike ?? q.aiLike,
    completed: q.status === 'completed',
  }))

  const raw = await callAI(buildUserProfilePrompt(tasks), buildUserProfileSystemPrompt())
  const parsed = parseProfile(raw)
  if (!parsed) return
  upsertProfile(playerId, JSON.stringify(parsed), count)
  // 画像重建成功（skillClaimed 已重置为 0）→ 通知渲染层自动占卜弹窗
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(IPC.SKILL_PROFILE_READY))
}

function parseProfile(raw: string): ProfileSummary | null {
  try {
    const obj = JSON.parse(raw.trim()) as Partial<ProfileSummary>
    if (!obj || typeof obj.summary !== 'string') return null
    return {
      domains: Array.isArray(obj.domains) ? obj.domains.slice(0, 6) : [],
      activities: Array.isArray(obj.activities) ? obj.activities.slice(0, 6) : [],
      learningTopics: Array.isArray(obj.learningTopics) ? obj.learningTopics.slice(0, 6) : [],
      workStyle: typeof obj.workStyle === 'string' ? obj.workStyle : '',
      summary: obj.summary,
    }
  } catch {
    return null
  }
}
