// 功能开关：AI 陪伴尚在需求整理阶段，暂时对用户隐藏。
// 需求确定、功能完成后改回 true 即可整体启用（阿凡达窗口 + 主动调度 + 完成推送/通知）。
export const COMPANION_ENABLED = false

export const C = {
  energyWarn: 15,   energyDanger: 8,
  willpowerWarn: 20, willpowerDanger: 8,
  spiritWarn: 30,   spiritDanger: 12,
  lateNightStart: 1, lateNightEnd: 5,   // [01:00, 05:00)
  streakStep: 7,                        // 连胜里程碑步长
  goodThreshold: 70,                    // 三值皆 >= 此值 = 状态好
  minIntervalMs: 15 * 60 * 1000,        // 节流最小间隔
  pollIntervalMs: 5 * 60 * 1000,        // 轮询间隔
  idleSeconds: 30 * 60,                 // 空闲阈值（秒）
} as const
