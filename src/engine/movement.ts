import type { Entity, GameState, Position } from '../types.ts';
import { CONFIG } from '../config.ts';
import { Grid } from '../state/Grid.ts';

/**
 * Weighted random selection from an array of { item, weight } pairs.
 */
function weightedRandom<T>(options: { item: T; weight: number }[]): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (const o of options) {
    r -= o.weight;
    if (r <= 0) return o.item;
  }
  return options[options.length - 1].item;
}

/**
 * Sample a player move: random adjacent walkable cell, biased toward goal.
 * "Stay in place" is also an option with low weight.
 */
export function samplePlayerMove(state: GameState): Position {
  const grid = new Grid(state.grid);
  const neighbors = grid.getNeighbors(state.player.pos);
  const goalDist = Grid.manhattanDistance(state.player.pos, state.goalPos);

  const options: { item: Position; weight: number }[] = [];

  // Stay in place option
  options.push({ item: { ...state.player.pos }, weight: 0.1 });

  for (const n of neighbors) {
    const dist = Grid.manhattanDistance(n, state.goalPos);
    // Softmax-like bias toward goal: closer to goal = higher weight
    const improvement = goalDist - dist; // positive if this move is closer
    const weight = Math.exp(improvement * CONFIG.PLAYER_GOAL_BIAS * 2);
    options.push({ item: n, weight });
  }

  return weightedRandom(options);
}

/**
 * Sample an enemy move: biased toward the player (chase behavior).
 */
export function sampleEnemyMove(enemy: Entity, state: GameState): Position {
  const grid = new Grid(state.grid);
  const neighbors = grid.getNeighbors(enemy.pos);
  if (neighbors.length === 0) {
    return { ...enemy.pos }; // stuck
  }

  // With ENEMY_CHASE_BIAS probability, pick the best move toward player
  if (Math.random() < CONFIG.ENEMY_CHASE_BIAS) {
    let bestMove = neighbors[0];
    let bestDist = Grid.manhattanDistance(neighbors[0], state.player.pos);
    for (let i = 1; i < neighbors.length; i++) {
      const d = Grid.manhattanDistance(neighbors[i], state.player.pos);
      if (d < bestDist) {
        bestDist = d;
        bestMove = neighbors[i];
      }
    }
    return bestMove;
  }

  // Otherwise, random move including staying
  const options: { item: Position; weight: number }[] = [
    { item: { ...enemy.pos }, weight: 0.2 },
  ];
  for (const n of neighbors) {
    options.push({ item: n, weight: 1 });
  }
  return weightedRandom(options);
}

/**
 * Get a direction string from one position to another.
 */
export function directionString(from: Position, to: Position): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return 'hold position';
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? 'east' : 'west';
  }
  return dy > 0 ? 'south' : 'north';
}
