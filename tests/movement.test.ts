import { samplePlayerMove, sampleEnemyMove, directionString } from '../src/engine/movement.ts';
import { createInitialState } from '../src/state/level.ts';
import { Grid } from '../src/state/Grid.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${msg}`);
  }
}

// Player moves stay on walkable cells
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  for (let i = 0; i < 50; i++) {
    const pos = samplePlayerMove(state);
    assert(
      grid.isWalkable(pos.x, pos.y),
      `Player move ${i}: (${pos.x},${pos.y}) is walkable`
    );
  }
}

// Player moves are adjacent or same position
{
  const state = createInitialState();
  for (let i = 0; i < 50; i++) {
    const pos = samplePlayerMove(state);
    const dist = Grid.manhattanDistance(state.player.pos, pos);
    assert(dist <= 1, `Player move ${i} is adjacent (dist=${dist})`);
  }
}

// Enemy moves stay on walkable cells
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  for (const enemy of state.enemies) {
    for (let i = 0; i < 50; i++) {
      const pos = sampleEnemyMove(enemy, state);
      assert(
        grid.isWalkable(pos.x, pos.y),
        `Enemy ${enemy.id} move ${i}: (${pos.x},${pos.y}) is walkable`
      );
    }
  }
}

// Enemy moves are adjacent or same position
{
  const state = createInitialState();
  for (const enemy of state.enemies) {
    for (let i = 0; i < 50; i++) {
      const pos = sampleEnemyMove(enemy, state);
      const dist = Grid.manhattanDistance(enemy.pos, pos);
      assert(dist <= 1, `Enemy ${enemy.id} move ${i} is adjacent (dist=${dist})`);
    }
  }
}

// directionString
{
  assert(directionString({ x: 0, y: 0 }, { x: 0, y: 0 }) === 'hold position', 'Same pos = hold');
  assert(directionString({ x: 0, y: 0 }, { x: 1, y: 0 }) === 'east', 'Right = east');
  assert(directionString({ x: 1, y: 0 }, { x: 0, y: 0 }) === 'west', 'Left = west');
  assert(directionString({ x: 0, y: 0 }, { x: 0, y: 1 }) === 'south', 'Down = south');
  assert(directionString({ x: 0, y: 1 }, { x: 0, y: 0 }) === 'north', 'Up = north');
}

console.log(`\nMovement: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
