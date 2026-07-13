// P4 心流机制 v2 参数。全部初值，跑一周真实数据后再调，禁止散落魔法数。
export const DDA = {
  // —— 挑战度 C 权重 ——
  wBacklog: 0.5, // 近 3 日待办 E 值总量
  wOverdue: 0.3, // 过期未完成任务压力
  wDifficulty: 0.2, // 近 7 天完成任务平均难度
  backlogRefEp: 300, // 待办 E 总量饱和参考（≈3 个满精力任务）
  overdueCap: 3, // 过期数封顶
  diffMin: 0.8, // difficultyFactor 下界（= settlement difficultyBase）
  diffSpan: 0.8, // difficultyFactor 跨度（= settlement difficultySpan）

  // —— 承载力 S 权重 ——
  wResource: 0.5, // 三资源水位
  wPace: 0.35, // 近 3 天完成节奏
  wStreak: 0.15, // 连胜动量
  epWeight: 0.4, // 资源内部：精力
  willWeight: 0.4, // 资源内部：意志力
  spiritWeight: 0.2, // 资源内部：精神
  streakRef: 30, // 连胜饱和参考

  // —— 状态判定 + 迟滞 ——
  ratioUpper: 1.15, // ratio 越此 → 焦虑倾向
  ratioLower: 0.7, // ratio 低此 → 无聊倾向
  hardMargin: 0.15, // 越界外再加 15% 裕量 → 免连续确认直接切换
  confirmEvals: 2, // 否则新状态需连续 2 次评估成立
  boredMinPace: 0.8, // 「无聊」需有实际清任务的证据（近期节奏达标），否则空白新玩家会被误判无聊
  eps: 0.15, // ratio 分母保护，防承载力趋零时爆炸
  debounceMs: 60_000, // 两次评估最小间隔；期内复用快照不重评（迟滞防抖核心）

  // —— 缺数据时的中性回退 ——
  neutralPace: 0.6,
  neutralDifficulty: 1.2,
} as const
