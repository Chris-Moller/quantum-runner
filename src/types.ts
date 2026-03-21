export type CellType = 'floor' | 'wall' | 'goal';

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  type: 'player' | 'enemy';
  id: string;
  pos: Position;
}

export interface GameState {
  grid: CellType[][];
  player: Entity;
  enemies: Entity[];
  goalPos: Position;
  turn: number;
  status: 'playing' | 'won' | 'lost';
}

export interface Future {
  state: GameState;
  description: string;
  quality: number; // -1 to 1
}

export type GamePhase = 'title' | 'playing' | 'choosing' | 'won' | 'lost';
