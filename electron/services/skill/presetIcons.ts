/**
 * 预置技能的 SVG 符文徽记（暗金编年史风：扁平线性、viewBox 0 0 24 24、stroke=currentColor）。
 * 由 Claude 手绘、编译期打进包 —— 各角色/各世界观通用，离线可用、运行时零 AI 成本。
 * 键为 skillRepo.PRESET_SKILLS 的 skillKey。
 */
const S = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

export const PRESET_ICONS: Record<string, string> = {
  // 时间管理 —— 沙漏
  'time-mgmt': S(
    '<path d="M6 4h12"/><path d="M6 20h12"/><path d="M8 4l4 8 4-8"/><path d="M8 20l4-8 4 8"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/>'
  ),
  // 深度专注 —— 同心靶
  'deep-focus': S(
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'
  ),
  // 生产力 —— 上扬趋势 + 箭头
  productivity: S('<path d="M4 15l6-6 4 4 6-7"/><path d="M15 6h5v5"/>'),
  // 心流状态（隐藏）—— 流动波纹
  'flow-state': S(
    '<path d="M3 10c3-5 6-5 9 0s6 5 9 0"/><path d="M3 15c3-5 6-5 9 0s6 5 9 0"/>'
  ),
  // 快速学习 —— 翻开的书
  learning: S(
    '<path d="M12 6v14"/><path d="M12 6C9.5 4 5.5 4.5 4 5.5V18c1.5-1 5.5-1.5 8 0.5"/><path d="M12 6c2.5-2 6.5-1.5 8-0.5V18c-1.5-1-5.5-1.5-8 0.5"/>'
  ),
  // 韧性（核心）—— 盾牌 + 守护刻痕
  resilience: S(
    '<path d="M12 3l8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>'
  ),
}
