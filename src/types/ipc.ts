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
} as const
