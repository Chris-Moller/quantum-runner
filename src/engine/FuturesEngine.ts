import type { GameState, Future, Position } from '../types.ts';
import { Grid } from '../state/Grid.ts';
import { samplePlayerMove, sampleEnemyMove, directionString } from './movement.ts';

function enemyLabel(id: string): string {
  if (id === 'sentinel-alpha') return 'Sentinel Alpha';
  if (id === 'sentinel-beta') return 'Sentinel Beta';
  return id;
}

function generateDescription(
  oldState: GameState,
  newState: GameState
): string {
  const playerDir = directionString(oldState.player.pos, newState.player.pos);
  const parts: string[] = [];

  if (playerDir === 'hold position') {
    parts.push('You hold position.');
  } else {
    const verbs = ['drift', 'phase', 'slide', 'shift'];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    parts.push(`You ${verb} ${playerDir}.`);
  }

  for (let i = 0; i < newState.enemies.length; i++) {
    const oldEnemy = oldState.enemies[i];
    const newEnemy = newState.enemies[i];
    const dir = directionString(oldEnemy.pos, newEnemy.pos);
    const label = enemyLabel(newEnemy.id);

    if (dir === 'hold position') {
      // skip silent enemies
    } else {
      const dist = Grid.manhattanDistance(newEnemy.pos, newState.player.pos);
      if (dist <= 2) {
        parts.push(`${label} closes in from the ${dir}!`);
      } else {
        parts.push(`${label} moves ${dir}.`);
      }
    }
  }

  if (newState.status === 'won') {
    parts.push('The goal is reached.');
  } else if (newState.status === 'lost') {
    parts.push('You are caught!');
  }

  return parts.join(' ');
}

function computeQuality(oldState: GameState, newState: GameState): number {
  const oldPlayerGoalDist = Grid.manhattanDistance(oldState.player.pos, oldState.goalPos);
  const newPlayerGoalDist = Grid.manhattanDistance(newState.player.pos, newState.goalPos);

  // Player progress: positive if closer to goal
  const progressScore = (oldPlayerGoalDist - newPlayerGoalDist) / Math.max(oldPlayerGoalDist, 1);

  // Safety: how close are enemies?
  let safetyScore = 0;
  for (let i = 0; i < newState.enemies.length; i++) {
    const oldDist = Grid.manhattanDistance(oldState.player.pos, oldState.enemies[i].pos);
    const newDist = Grid.manhattanDistance(newState.player.pos, newState.enemies[i].pos);
    // positive if enemies are further
    safetyScore += (newDist - oldDist) / Math.max(oldDist, 1);
  }
  safetyScore /= Math.max(newState.enemies.length, 1);

  // Win/lose
  if (newState.status === 'won') return 1;
  if (newState.status === 'lost') return -1;

  // Blend scores
  return Math.max(-1, Math.min(1, progressScore * 0.6 + safetyScore * 0.4));
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function simulateOneFuture(state: GameState): GameState {
  const next = structuredClone(state);
  next.turn = state.turn; // turn increments on accept

  // Move player
  next.player.pos = samplePlayerMove(state);

  // Move enemies
  for (let i = 0; i < next.enemies.length; i++) {
    next.enemies[i].pos = sampleEnemyMove(state.enemies[i], state);
  }

  // Check collisions: enemy on player
  for (const enemy of next.enemies) {
    if (positionsEqual(enemy.pos, next.player.pos)) {
      next.status = 'lost';
      return next;
    }
  }

  // Check win: player on goal
  if (positionsEqual(next.player.pos, next.goalPos)) {
    next.status = 'won';
  }

  return next;
}

export function generateFutures(state: GameState, n: number): Future[] {
  const maxRetries = 3;
  let futures: Future[] = [];

  for (let retries = 0; retries <= maxRetries; retries++) {
    // Fill up to n futures
    while (futures.length < n) {
      const newState = simulateOneFuture(state);
      const quality = computeQuality(state, newState);
      const description = generateDescription(state, newState);
      futures.push({ state: newState, description, quality });
    }

    // Skip diversity check when only one future requested
    if (n <= 1 || retries === maxRetries) break;

    // Check if quality spread is sufficient
    const qualities = futures.map(f => f.quality);
    const spread = Math.max(...qualities) - Math.min(...qualities);
    if (spread >= 0.3) break;

    // Remove the future most similar in quality to the first, then regenerate
    let mostSimilarIdx = 1;
    for (let i = 2; i < futures.length; i++) {
      if (Math.abs(futures[i].quality - futures[0].quality) < Math.abs(futures[mostSimilarIdx].quality - futures[0].quality)) {
        mostSimilarIdx = i;
      }
    }
    futures.splice(mostSimilarIdx, 1);
  }

  return futures.slice(0, n);
}
