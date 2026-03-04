export type MedalCategory = 'streak' | 'mastery' | 'adventure' | 'oath'

export interface Medal {
  id: string
  name: string
  category: MedalCategory
  svgCode: string
  seed: string
  unlockedAt: string
  description: string
}
