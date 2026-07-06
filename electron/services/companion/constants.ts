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
