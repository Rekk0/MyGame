/** AI 生成的用户画像结构（存 user_profiles.summary 的 JSON）。 */
export interface ProfileSummary {
  domains: string[]
  activities: string[]
  learningTopics: string[]
  workStyle: string
  summary: string
}

/** 技能占卜按钮的可用性状态（渲染层据此启用/置灰）。 */
export interface DivinationState {
  hasProfile: boolean
  claimed: boolean
  divinationsLeft: number
}

/** SKILL_GENERATE 返回的技能预览（未入库）。 */
export interface SkillPreview {
  name: string
  category: 'core' | 'universal' | 'hidden'
  description: string
  parentSkillName: string | null
  maxXp: number
}
