export const CONFIG = {
  GRID_COLS: 12,
  GRID_ROWS: 10,
  CELL_SIZE: 56,
  NUM_FUTURES: 3,
  MIN_FUTURES: 2,
  MAX_FUTURES: 5,
  ENEMY_CHASE_BIAS: 0.6,
  PLAYER_GOAL_BIAS: 0.3,
} as const;

export const COLORS = {
  BG: '#0a0a0f',
  GRID_LINE: '#1a3a2a',
  FLOOR: '#0d0d14',
  WALL: '#1a1a2e',
  WALL_ACCENT: '#252540',
  PLAYER: '#00ffcc',
  ENEMY: '#ff6b35',
  GOAL: '#39ff14',
  DANGER: '#ff1744',
  UI_TEXT: '#b0ffb0',
  ACCENT: '#ffeb3b',
  FUTURE_GOOD: '#39ff14',
  FUTURE_BAD: '#ff1744',
} as const;
