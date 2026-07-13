import { ipcMain } from 'electron'
import { IPC } from '../../src/types/ipc'
import { getAllSkills, getSkillById, unlockSkill, createSkill } from '../services/db/repositories/skillRepo'
import {
  getProfile,
  consumeDivination,
  divinationsLeft,
  addRejectedName,
  markSkillClaimed,
} from '../services/db/repositories/userProfileRepo'
import { grantSkillXp } from '../services/skill/grantXp'
import { generateSkillPreviews } from '../services/skill/generate'
import type { DivinationState, SkillPreview } from '../../src/types/profile'

function localDate(): string {
  return new Date().toLocaleDateString('en-CA')
}

function divinationState(): DivinationState {
  const profile = getProfile()
  return {
    hasProfile: !!profile,
    claimed: profile?.skillClaimed === 1,
    divinationsLeft: divinationsLeft(localDate()),
  }
}

export function registerSkillHandlers(): void {
  ipcMain.handle(IPC.SKILL_GET_ALL, () => getAllSkills())

  ipcMain.handle(IPC.SKILL_ADD_XP, async (_e, id: string, amount: number) => {
    const { leveledUp } = await grantSkillXp(id, amount)
    return { skill: getSkillById(id), leveledUp, newTrait: undefined }
  })

  ipcMain.handle(IPC.SKILL_UNLOCK, (_e, id: string) => {
    unlockSkill(id)
    return getSkillById(id)
  })

  ipcMain.handle(IPC.SKILL_GET_DIVINATION_STATE, () => divinationState())

  // 占卜：频控 +1，调 AI 生成预览（不写库）。超限/无画像返回 { error }。
  ipcMain.handle(IPC.SKILL_GENERATE, async () => {
    const state = divinationState()
    if (!state.hasProfile) return { error: 'no-profile', previews: [] }
    if (state.claimed) return { error: 'claimed', previews: [] }
    if (consumeDivination(localDate()) < 0) return { error: 'rate-limited', previews: [] }
    const previews = await generateSkillPreviews()
    if (previews.length === 0) return { error: 'ai-failed', previews: [] }
    return { error: null, previews }
  })

  // 确认学习：入库 + 消耗该画像版本配额。
  ipcMain.handle(IPC.SKILL_ACCEPT, (_e, preview: SkillPreview) => {
    const skill = createSkill(preview)
    markSkillClaimed()
    return { skill, divination: divinationState() }
  })

  // 婉拒：记入排除名单，不消耗配额。
  ipcMain.handle(IPC.SKILL_REJECT, (_e, name: string) => {
    addRejectedName(name)
    return divinationState()
  })
}
