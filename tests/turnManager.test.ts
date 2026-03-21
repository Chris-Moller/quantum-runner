import { TurnManager } from '../src/ui/TurnManager.ts';
import type { Future, GameState } from '../src/types.ts';

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

function makeFuture(quality: number): Future {
  return {
    state: {} as GameState,
    description: `q=${quality}`,
    quality,
  };
}

// AC3: Futures presented one at a time, player can Accept or Pass
{
  const tm = new TurnManager();
  const f1 = makeFuture(0.5);
  const f2 = makeFuture(-0.3);
  const f3 = makeFuture(0.1);
  tm.loadFutures([f1, f2, f3]);

  assert(tm.currentFuture === f1, 'First future is f1');
  assert(tm.currentNumber === 1, 'Current number starts at 1');
  assert(tm.totalFutures === 3, 'Total futures is 3');
  assert(tm.futuresRemaining === 3, 'All 3 futures remaining initially');
  assert(!tm.isLastFuture, 'Not last future at start');
}

// AC3: Accept returns the current future
{
  const tm = new TurnManager();
  const f1 = makeFuture(0.5);
  const f2 = makeFuture(-0.3);
  tm.loadFutures([f1, f2]);

  const accepted = tm.acceptCurrent();
  assert(accepted === f1, 'Accept returns first future');
  assert(tm.currentFuture === null, 'After accept, no current future');
}

// AC3/AC4: Pass advances to next future; passed future cannot be revisited
{
  const tm = new TurnManager();
  const f1 = makeFuture(0.5);
  const f2 = makeFuture(-0.3);
  const f3 = makeFuture(0.1);
  tm.loadFutures([f1, f2, f3]);

  const passResult = tm.passCurrent();
  assert(passResult === null, 'Pass returns null (not yet forced)');
  assert(tm.currentFuture === f2, 'After pass, current is f2');
  assert(tm.currentNumber === 2, 'Current number is 2');
  assert(tm.futuresRemaining === 2, '2 futures remaining after 1 pass');
  // f1 is no longer accessible — no method to go back
}

// AC4: Last future is forced when all others passed
{
  const tm = new TurnManager();
  const f1 = makeFuture(0.5);
  const f2 = makeFuture(-0.3);
  const f3 = makeFuture(0.1);
  tm.loadFutures([f1, f2, f3]);

  tm.passCurrent(); // skip f1
  tm.passCurrent(); // skip f2
  assert(tm.isLastFuture, 'f3 is the last future');

  const forced = tm.passCurrent(); // forced accept of f3
  assert(forced === f3, 'Passing last future forces accept of f3');
  assert(tm.currentFuture === null, 'After forced accept, no current future');
}

// AC4: Accept on last future
{
  const tm = new TurnManager();
  const f1 = makeFuture(0.5);
  tm.loadFutures([f1]);

  assert(tm.isLastFuture, 'Single future is the last');
  const accepted = tm.acceptCurrent();
  assert(accepted === f1, 'Accepting single/last future works');
}

// Edge: empty futures
{
  const tm = new TurnManager();
  tm.loadFutures([]);
  assert(tm.currentFuture === null, 'No current future when empty');
  assert(tm.totalFutures === 0, 'Total is 0 when empty');
}

console.log(`\nTurnManager: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
