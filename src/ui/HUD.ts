import type { GameState } from '../types.ts';
import { CONFIG, COLORS } from '../config.ts';
import type { TurnManager } from './TurnManager.ts';

export class HUD {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(state: GameState, turnManager: TurnManager, description: string): void {
    const ctx = this.ctx;
    const canvasW = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
    const canvasH = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;

    ctx.save();
    ctx.font = '14px "JetBrains Mono", monospace';

    // Turn counter (top-left)
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`TURN ${state.turn}`, 10, 10);

    // Future indicator (top-right)
    ctx.textAlign = 'right';
    const futureText = `FUTURE ${turnManager.currentNumber} OF ${turnManager.totalFutures}`;
    ctx.fillText(futureText, canvasW - 10, 10);

    // Quality indicator
    const future = turnManager.currentFuture;
    if (future) {
      const qualLabel = future.quality > 0.2 ? 'FAVORABLE' :
        future.quality < -0.2 ? 'DANGEROUS' : 'NEUTRAL';
      const qualColor = future.quality > 0.2 ? COLORS.FUTURE_GOOD :
        future.quality < -0.2 ? COLORS.FUTURE_BAD : COLORS.ACCENT;
      ctx.fillStyle = qualColor;
      ctx.fillText(qualLabel, canvasW - 10, 28);
    }

    // Last future warning
    if (turnManager.isLastFuture) {
      ctx.fillStyle = COLORS.DANGER;
      ctx.textAlign = 'center';
      ctx.fillText('⚠ LAST FUTURE — WILL BE FORCED', canvasW / 2, 28);
    }

    // Description (bottom)
    if (description) {
      ctx.fillStyle = COLORS.UI_TEXT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = '13px "JetBrains Mono", monospace';

      // Word wrap for long descriptions
      const maxWidth = canvasW - 40;
      const words = description.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const test = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      if (currentLine) lines.push(currentLine);

      for (let i = lines.length - 1; i >= 0; i--) {
        const y = canvasH - 10 - (lines.length - 1 - i) * 18;
        ctx.fillText(lines[i], canvasW / 2, y);
      }
    }

    ctx.restore();
  }
}
