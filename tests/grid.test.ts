import { Grid } from '../src/state/Grid.ts';
import { createInitialState } from '../src/state/level.ts';

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

// AC1: Grid loads with correct dimensions
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  assert(grid.rows === 10, `Grid has 10 rows, got ${grid.rows}`);
  assert(grid.cols === 12, `Grid has 12 cols, got ${grid.cols}`);
}

// AC1: Grid has walls, floor, and goal cells
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  let hasWall = false;
  let hasFloor = false;
  let hasGoal = false;
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = grid.getCell(x, y);
      if (cell === 'wall') hasWall = true;
      if (cell === 'floor') hasFloor = true;
      if (cell === 'goal') hasGoal = true;
    }
  }
  assert(hasWall, 'Grid has wall cells');
  assert(hasFloor, 'Grid has floor cells');
  assert(hasGoal, 'Grid has goal cells');
}

// Walls are not walkable, floor/goal are
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  // (2,0) is a wall in the level map
  assert(!grid.isWalkable(2, 0), 'Wall at (2,0) is not walkable');
  assert(grid.isWalkable(0, 0), 'Floor at (0,0) is walkable');
  assert(grid.isWalkable(10, 0), 'Goal at (10,0) is walkable');
}

// Out of bounds is not walkable
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  assert(!grid.isWalkable(-1, 0), 'Out of bounds (-1,0) is not walkable');
  assert(!grid.isWalkable(0, -1), 'Out of bounds (0,-1) is not walkable');
  assert(!grid.isWalkable(12, 0), 'Out of bounds (12,0) is not walkable');
  assert(!grid.isWalkable(0, 10), 'Out of bounds (0,10) is not walkable');
}

// Manhattan distance
{
  assert(Grid.manhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 }) === 7, 'Manhattan (0,0)->(3,4) = 7');
  assert(Grid.manhattanDistance({ x: 5, y: 5 }, { x: 5, y: 5 }) === 0, 'Manhattan same pos = 0');
}

// Neighbors returns only walkable adjacent cells
{
  const state = createInitialState();
  const grid = new Grid(state.grid);
  const neighbors = grid.getNeighbors({ x: 1, y: 0 });
  // (1,0) has: up=OOB, down=(1,1)=floor, left=(0,0)=floor, right=(2,0)=wall
  assert(neighbors.length === 2, `(1,0) has 2 walkable neighbors, got ${neighbors.length}`);
  const hasDown = neighbors.some(p => p.x === 1 && p.y === 1);
  const hasLeft = neighbors.some(p => p.x === 0 && p.y === 0);
  assert(hasDown, '(1,0) neighbor includes (1,1)');
  assert(hasLeft, '(1,0) neighbor includes (0,0)');
}

// AC1: Initial state has protagonist, goal, enemies
{
  const state = createInitialState();
  assert(state.player.type === 'player', 'State has a player entity');
  assert(state.player.pos.x >= 0 && state.player.pos.y >= 0, 'Player has valid position');
  assert(state.goalPos.x >= 0 && state.goalPos.y >= 0, 'Goal has valid position');
  assert(state.enemies.length >= 1, 'At least one enemy exists');
  for (const e of state.enemies) {
    assert(e.type === 'enemy', `Enemy ${e.id} has type "enemy"`);
  }
  assert(state.status === 'playing', 'Initial status is playing');
  assert(state.turn === 1, 'Initial turn is 1');
}

console.log(`\nGrid & Level: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
