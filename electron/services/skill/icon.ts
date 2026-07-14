import { BrowserWindow } from 'electron'
import { callAI } from '../ai/client'
import { buildSkillIconPrompt, buildSkillIconSystemPrompt } from '../ai/prompts/skillIconSvg'
import { updateSkillIcon } from '../db/repositories/skillRepo'
import { getPlayer } from '../db/repositories/playerRepo'
import { IPC } from '../../../src/types/ipc'
import type { SkillCategory } from '../../../src/types/skill'
import type { WorldStyle } from '../../../src/types/player'

/**
 * 消毒 AI 产出的 SVG：只保留一个 <svg>…</svg>，剥除脚本 / 事件属性 / 外链 / 内嵌 HTML。
 * 无法提取合法 <svg> 时返回 null。预置图标可信、无需过此。
 */
export function sanitizeSvg(raw: string): string | null {
  const match = raw.match(/<svg[\s\S]*?<\/svg>/i)
  if (!match) return null
  let svg = match[0]
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '')
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
  svg = svg.replace(/<(image|use|iframe|a)\b[\s\S]*?>/gi, '')
  svg = svg.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  svg = svg.replace(/(href|xlink:href|src)\s*=\s*("[^"]*"|'[^']*')/gi, '')
  svg = svg.replace(/javascript:/gi, '')
  if (svg.length > 4000) return null
  return svg
}

/** 生成技能图标（走用户配置的 AI）。失败静默返回 null —— 节点降级为纯符文框。 */
export async function generateSkillIcon(skill: {
  name: string
  category: SkillCategory
  description: string
}): Promise<string | null> {
  try {
    const worldStyle = (getPlayer()?.worldStyle ?? 'realistic') as WorldStyle
    // 部分模型（如 deepseek 慢档）出图标可达 2 分钟，远超默认 30s；后台异步不阻塞 UI，给足超时。
    const raw = await callAI(buildSkillIconPrompt(skill), buildSkillIconSystemPrompt(worldStyle), {
      timeoutMs: 180000,
    })
    return sanitizeSvg(raw)
  } catch {
    return null
  }
}

/**
 * 后台生成图标并回填入库，成功后广播 SKILL_UPDATED 让渲染层刷新。
 * fire-and-forget：不阻塞技能入库/弹窗（AI 慢或失败都不影响技能立即出现）。
 */
export async function generateAndAttachIcon(
  id: string,
  skill: { name: string; category: SkillCategory; description: string }
): Promise<void> {
  const svg = await generateSkillIcon(skill)
  if (!svg) return
  updateSkillIcon(id, svg)
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(IPC.SKILL_UPDATED))
}
