import type { CellType } from '../types.ts';
import { CONFIG, COLORS } from '../config.ts';

export class GridRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(grid: CellType[][], goalPulse: number): void {
    const { CELL_SIZE } = CONFIG;
    const ctx = this.ctx;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;
        const cell = grid[y][x];

        // Cell background
        if (cell === 'wall') {
          ctx.fillStyle = COLORS.WALL;
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
          // Wall accent pattern
          ctx.fillStyle = COLORS.WALL_ACCENT;
          ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else if (cell === 'goal') {
          ctx.fillStyle = COLORS.FLOOR;
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
          // Pulsing goal glow
          const alpha = 0.15 + 0.1 * Math.sin(goalPulse);
          ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = COLORS.FLOOR;
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        }

        // Grid lines
        ctx.strokeStyle = COLORS.GRID_LINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
  }
}
