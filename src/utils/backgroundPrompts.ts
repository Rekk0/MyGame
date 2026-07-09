import type { WorldStyle } from '../types/player'

// Default text-to-image prompts for each world style. Written in English because
// image models handle it most reliably; users can edit before generating.
// Shared constraints keep results usable as an app backdrop under dark-gold UI.
const SUFFIX =
  'Wide cinematic establishing shot, no people, no text, no watermark, dark moody palette ' +
  'with deep shadows, suitable as a subtle desktop app background, painterly concept art style.'

export const BACKGROUND_PROMPTS: Record<WorldStyle, string> = {
  realistic: `A modern military forward command post at dusk: sandbags, radio antennas, distant armored vehicles under a steel-grey sky, cold blue-grey tones, faint smoke on the horizon. ${SUFFIX}`,
  wuxia: `A misty bamboo forest valley in ancient China at dawn, a lone stone path winding toward a distant inn with paper lanterns, ink-wash atmosphere, muted green and slate tones. ${SUFFIX}`,
  xianxia: `Floating immortal mountain peaks above a sea of clouds, waterfalls falling into the void, a jade pavilion glowing faintly, cranes in the distance, ethereal cyan and silver light. ${SUFFIX}`,
  fantasy: `A grand fantasy citadel carved into a mountainside, dragons circling distant spires, glowing arcane runes on ancient stone, torchlit ramparts, deep purple and gold twilight. ${SUFFIX}`,
  scifi: `A vast cyberpunk megacity seen from a high orbital platform, neon-lit towers piercing rain clouds, starships drifting between spires, teal and magenta glow against the void of space. ${SUFFIX}`,
  apocalypse: `A ruined overgrown city at sunset after the fall of civilization, rusted vehicles and collapsed highways reclaimed by vegetation, dust haze, burnt orange and rust tones. ${SUFFIX}`
}
