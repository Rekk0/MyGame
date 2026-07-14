import type { Skill } from '../../types/skill'

/** 星盘虚拟画布尺寸（d3-zoom 在其上平移缩放）。 */
export const VW = 720
export const VH = 460

const UNIT = Math.min(VW, VH)
/** 预置节点的分类环半径：core 内、universal 中、hidden/AI 外。 */
export const RING_RADII: Record<string, number> = {
  core: UNIT * 0.12,
  universal: UNIT * 0.26,
  hidden: UNIT * 0.42,
}

const ORDER = ['core', 'universal', 'hidden'] as const
/** AI 技能每向外生长一层的半径增量。 */
const STEP = 74

const isAI = (s: Skill): boolean => s.id.includes('-ai-')
const byId = (a: Skill, b: Skill): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

type Pos = Map<string, { x: number; y: number }>

/** 预置节点：分类分环、环内按 id 稳定排序均匀铺开。 */
function placePresets(skills: Skill[], cx: number, cy: number, pos: Pos): void {
  const groups: Record<string, Skill[]> = { core: [], universal: [], hidden: [] }
  for (const s of skills) if (!isAI(s)) (groups[s.category] ?? groups.hidden).push(s)
  for (const cat of ORDER) {
    const g = groups[cat].slice().sort(byId)
    const n = g.length
    if (n === 0) continue
    if (cat === 'core' && n === 1) {
      pos.set(g[0].id, { x: cx, y: cy })
      continue
    }
    const r = RING_RADII[cat]
    const start = -Math.PI / 2
    g.forEach((s, i) => {
      const a = start + (i / n) * 2 * Math.PI
      pos.set(s.id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
    })
  }
}

/** AI 技能：沿「中心→父」的方向继续向外摆放，兄弟扇形展开 —— 打造扩散生长。 */
function placeAiOutward(skills: Skill[], cx: number, cy: number, pos: Pos): void {
  let pending = skills.filter(isAI)
  let guard = 0
  while (pending.length && guard++ < 30) {
    const ready = pending.filter((s) => s.parentSkillId && pos.has(s.parentSkillId))
    if (ready.length === 0) break
    const byParent = new Map<string, Skill[]>()
    for (const s of ready) {
      const list = byParent.get(s.parentSkillId!) ?? []
      list.push(s)
      byParent.set(s.parentSkillId!, list)
    }
    for (const [parentId, kids] of byParent) {
      const pp = pos.get(parentId)!
      const base = Math.atan2(pp.y - cy, pp.x - cx)
      const r = Math.hypot(pp.x - cx, pp.y - cy) + STEP
      kids.sort(byId)
      const m = kids.length
      const spread = Math.min(1.2, 0.45 * m)
      kids.forEach((s, i) => {
        const a = m === 1 ? base : base - spread / 2 + (i / (m - 1)) * spread
        pos.set(s.id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
      })
    }
    pending = pending.filter((s) => !pos.has(s.id))
  }
  // 兜底：父不可达的 AI → 外环按 id 散布
  const start = -Math.PI / 2
  const r = RING_RADII.hidden + STEP
  pending.sort(byId).forEach((s, i) => {
    const a = start + (i / Math.max(1, pending.length)) * 2 * Math.PI
    pos.set(s.id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  })
}

/**
 * 确定性星盘布局：预置分类分环 + AI 技能沿父方向外扩生长。
 * 无随机、无力导 —— 每次打开布局一致（避免 D3 原地 mutate，规避坑#17）。
 */
export function computeLayout(skills: Skill[], w: number, h: number): Pos {
  const cx = w / 2
  const cy = h / 2
  const pos: Pos = new Map()
  placePresets(skills, cx, cy, pos)
  placeAiOutward(skills, cx, cy, pos)
  return pos
}
