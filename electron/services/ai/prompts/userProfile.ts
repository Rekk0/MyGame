export interface ProfileTaskInput {
  originalText: string
  type: string
  E: number | null
  D: number | null
  L: number | null
  completed: boolean
}

export function buildUserProfileSystemPrompt(): string {
  return `你是一个用户行为分析师。根据用户的真实任务记录，提炼他在做什么、学什么、如何工作。
严格返回以下 JSON 格式（不要包含任何其他文字）：
{"domains":["领域1","领域2"],"activities":["活动1","活动2"],"learningTopics":["学习主题1"],"workStyle":"一句话工作风格","summary":"2-3句画像总结"}
要求：domains 是宏观领域（如「软件开发」「健身」），activities 是具体在做的事，learningTopics 是正在学习的知识；均用中文，各数组不超过 6 项，去重，贴合原文语义，不要编造未出现的内容。`
}

export function buildUserProfilePrompt(tasks: ProfileTaskInput[]): string {
  const lines = tasks
    .map((t) => {
      const done = t.completed ? '已完成' : '未完成'
      const rating = t.E != null ? ` [精力${t.E}/驱动${t.D}/喜欢${t.L}]` : ''
      return `- (${t.type}·${done}${rating}) ${t.originalText}`
    })
    .join('\n')
  return `以下是用户最近的任务记录，请分析并输出画像：\n${lines}`
}
