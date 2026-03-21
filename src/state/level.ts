import type { CellType, GameState, Entity, Position } from '../types.ts';
import { Grid } from './Grid.ts';

// Level layout: W=wall, .=floor, G=goal
// 12 cols x 10 rows
const LEVEL_MAP = [
  '. . W . . . . . . . G .',
  '. . W . . . . . . . . .',
  '. . W . . W W . . . . .',
  '. . . . . W . . . W W .',
  '. . . . . . . . . . . .',
  '. W W . . . W W . . . .',
  '. . . . . . . . . W . .',
  '. . W W W . . . . W . .',
  '. . . . . . W . . . . .',
  '. . . . . . W . . . . .',
];

function parseLevelMap(lines: string[]): CellType[][] {
  return lines.map(line => {
    const tokens = line.split(' ');
    return tokens.map(t => {
      if (t === 'W') return 'wall' as CellType;
      if (t === 'G') return 'goal' as CellType;
      return 'floor' as CellType;
    });
  });
}

export function createInitialState(): GameState {
  const cells = parseLevelMap(LEVEL_MAP);
  const grid = new Grid(cells);

  const player: Entity = {
    type: 'player',
    id: 'player',
    pos: { x: 1, y: 8 },
  };

  const enemies: Entity[] = [
    { type: 'enemy', id: 'sentinel-alpha', pos: { x: 4, y: 4 } },
    { type: 'enemy', id: 'sentinel-beta', pos: { x: 8, y: 1 } },
  ];

  const goalPos: Position = { x: 10, y: 0 };

  return {
    grid: grid.cells,
    player,
    enemies,
    goalPos,
    turn: 1,
    status: 'playing',
  };
}
