import type { GameState, Future } from '../types.ts';
import { CONFIG } from '../config.ts';
import { GridRenderer } from './GridRenderer.ts';
import { EntityRenderer } from './EntityRenderer.ts';
import { FutureOverlay } from './FutureOverlay.ts';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private gridRenderer: GridRenderer;
  private entityRenderer: EntityRenderer;
  private futureOverlay: FutureOverlay;
  private startTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
    canvas.height = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    this.gridRenderer = new GridRenderer(ctx);
    this.entityRenderer = new EntityRenderer(ctx);
    this.futureOverlay = new FutureOverlay(ctx, this.entityRenderer);
    this.startTime = performance.now();
  }

  private get goalPulse(): number {
    return (performance.now() - this.startTime) * 0.003;
  }

  render(state: GameState, futurePreview?: Future): void {
    const { GRID_COLS, GRID_ROWS, CELL_SIZE } = CONFIG;
    const ctx = this.ctx;

    // Clear
    ctx.clearRect(0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);

    // Grid
    this.gridRenderer.render(state.grid, this.goalPulse);

    // Goal beacon
    this.entityRenderer.renderGoal(state.goalPos, this.goalPulse);

    // Entities
    for (const enemy of state.enemies) {
      this.entityRenderer.renderEnemy(enemy);
    }
    this.entityRenderer.renderPlayer(state.player);

    // Future overlay
    if (futurePreview) {
      this.futureOverlay.render(state, futurePreview);
    }
  }
}
