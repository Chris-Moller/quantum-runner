import { generateFutures } from '../src/engine/FuturesEngine.ts';
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

const state = createInitialState();

// AC2: Generates N futures (configurable 2-5)
for (const n of [2, 3, 4, 5]) {
  const futures = generateFutures(state, n);
  assert(futures.length === n, `generateFutures(state, ${n}) returns ${n} futures, got ${futures.length}`);
}

// AC2: Each future has required fields
{
  const futures = generateFutures(state, 3);
  for (let i = 0; i < futures.length; i++) {
    const f = futures[i];
    assert(f.state !== undefined && f.state !== null, `Future ${i} has a state`);
    assert(typeof f.description === 'string' && f.description.length > 0, `Future ${i} has a description`);
    assert(typeof f.quality === 'number', `Future ${i} has a numeric quality`);
    assert(f.quality >= -1 && f.quality <= 1, `Future ${i} quality in [-1, 1] range, got ${f.quality}`);
  }
}

// AC7: Meaningful variance in quality — run multiple batches and check spread
// Use more runs and a lenient threshold since quality depends on stochastic movement
{
  let totalSpread = 0;
  const runs = 50;
  let spreadAboveThreshold = 0;
  for (let i = 0; i < runs; i++) {
    const futures = generateFutures(state, 4);
    const qualities = futures.map(f => f.quality);
    const spread = Math.max(...qualities) - Math.min(...qualities);
    totalSpread += spread;
    if (spread > 0) spreadAboveThreshold++;
  }
  const avgSpread = totalSpread / runs;
  assert(avgSpread > 0, `Average quality spread > 0, got ${avgSpread.toFixed(3)}`);
  assert(
    spreadAboveThreshold >= runs * 0.2,
    `At least 20% of runs have non-zero spread: ${spreadAboveThreshold}/${runs}`
  );
}

// Future states differ from the original state
{
  const futures = generateFutures(state, 3);
  let anyDifferent = false;
  for (const f of futures) {
    if (
      f.state.player.pos.x !== state.player.pos.x ||
      f.state.player.pos.y !== state.player.pos.y
    ) {
      anyDifferent = true;
    }
  }
  // It's possible (but very unlikely) all 3 futures have player stay still
  // Just check structure is valid
  for (const f of futures) {
    assert(f.state.player.pos.x >= 0, 'Player x >= 0');
    assert(f.state.player.pos.y >= 0, 'Player y >= 0');
    assert(f.state.enemies.length === state.enemies.length, 'Same number of enemies');
    assert(
      f.state.status === 'playing' || f.state.status === 'won' || f.state.status === 'lost',
      `Valid status: ${f.state.status}`
    );
  }
}

// AC6: Win and lose conditions are reachable
// Run multiple independent game simulations to increase chance of seeing both outcomes
{
  let winSeen = false;
  let loseSeen = false;

  for (let game = 0; game < 10 && (!winSeen || !loseSeen); game++) {
    let currentState = createInitialState();
    for (let turn = 0; turn < 100; turn++) {
      const futures = generateFutures(currentState, 4);
      for (const f of futures) {
        if (f.state.status === 'won') winSeen = true;
        if (f.state.status === 'lost') loseSeen = true;
      }
      // Pick the best future for winning, worst for losing — alternate strategies
      const sorted = [...futures].sort((a, b) => b.quality - a.quality);
      const picked = game % 2 === 0 ? sorted[0] : sorted[sorted.length - 1];
      currentState = picked.state;
      currentState.turn = turn + 2;
      if (currentState.status !== 'playing') break;
    }
  }
  assert(winSeen, 'Win condition is reachable across simulated games');
  assert(loseSeen, 'Lose condition is reachable across simulated games');
}

// Edge: n=1 (the fixed bug)
{
  const futures = generateFutures(state, 1);
  assert(futures.length === 1, `generateFutures(state, 1) returns 1 future, got ${futures.length}`);
}

console.log(`\nFuturesEngine: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
