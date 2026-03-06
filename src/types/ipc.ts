export const IPC = {
  QUEST_CREATE: 'quest:create',
  QUEST_GET_ALL: 'quest:get-all',
  QUEST_GET_BY_ID: 'quest:get-by-id',
  QUEST_UPDATE: 'quest:update',
  QUEST_DELETE: 'quest:delete',
  QUEST_COMPLETE: 'quest:complete',

  PLAYER_GET: 'player:get',
  PLAYER_GET_ALL: 'player:get-all',
  PLAYER_CREATE: 'player:create',
  PLAYER_SWITCH: 'player:switch',
  PLAYER_DELETE: 'player:delete',
  PLAYER_ADD_XP: 'player:add-xp',
  PLAYER_ADD_GOLD: 'player:add-gold',
  PLAYER_CONSUME_EP: 'player:consume-ep',
  PLAYER_RESET_EP: 'player:reset-ep',

  STREAK_GET: 'streak:get',
  STREAK_RECORD: 'streak:record',

  WINDOW_SHOW_MAIN: 'window:show-main',
  WINDOW_HIDE_MAIN: 'window:hide-main',
  WINDOW_SHOW_HUD: 'window:show-hud',
  WINDOW_HIDE_HUD: 'window:hide-hud',
  WINDOW_SHOW_QUICK_INPUT: 'window:show-quick-input',
  WINDOW_HIDE_QUICK_INPUT: 'window:hide-quick-input',
  WINDOW_GET_HUD_POSITION: 'window:get-hud-position',
  WINDOW_SET_HUD_POSITION: 'window:set-hud-position',
  WINDOW_SHOW_QUEST_HUD: 'window:show-quest-hud',
  WINDOW_HIDE_QUEST_HUD: 'window:hide-quest-hud',
  WINDOW_GET_QUEST_HUD_POSITION: 'window:get-quest-hud-position',
  WINDOW_SET_QUEST_HUD_POSITION: 'window:set-quest-hud-position',
  WINDOW_GET_HUD_CONFIG: 'window:get-hud-config',
  WINDOW_SAVE_HUD_CONFIG: 'window:save-hud-config',
  WINDOW_SET_HUD_PINNED: 'window:set-hud-pinned',

  DATA_UPDATED: 'data:updated',

  AI_TRANSFORM_QUEST: 'ai:transform-quest',

  SETTINGS_GET_AI_CONFIG: 'settings:get-ai-config',
  SETTINGS_SET_AI_CONFIG: 'settings:set-ai-config',

  ACHIEVEMENT_GET_ALL: 'achievement:get-all',
  ACHIEVEMENT_GET_UNLOCKED: 'achievement:get-unlocked',
  ACHIEVEMENT_SHOW: 'achievement:show',

  MEDAL_GET_ALL: 'medal:get-all',
  MEDAL_GENERATE: 'medal:generate',

  SKILL_GET_ALL: 'skill:get-all',
  SKILL_ADD_XP: 'skill:add-xp',
  SKILL_UNLOCK: 'skill:unlock',

  DDA_GET_STATE: 'dda:get-state',
  DDA_GET_SUGGESTION: 'dda:get-suggestion',
} as const
