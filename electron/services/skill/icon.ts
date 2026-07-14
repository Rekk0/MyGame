import { callAI } from '../ai/client'
import { buildSkillIconPrompt, buildSkillIconSystemPrompt } from '../ai/prompts/skillIconSvg'
import type { SkillCategory } from '../../../src/types/skill'

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

/** 生成技能图标（AI 技能 accept 时用）。失败静默返回 null —— 节点降级为纯符文框，不阻塞入库。 */
export async function generateSkillIcon(skill: {
  name: string
  category: SkillCategory
  description: string
}): Promise<string | null> {
  try {
    const raw = await callAI(buildSkillIconPrompt(skill), buildSkillIconSystemPrompt())
    return sanitizeSvg(raw)
  } catch {
    return null
  }
}
