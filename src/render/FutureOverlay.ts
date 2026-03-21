import type { GameState, Future, Position } from '../types.ts';
import { CONFIG, COLORS } from '../config.ts';
import { Grid } from '../state/Grid.ts';
import { EntityRenderer } from './EntityRenderer.ts';

export class FutureOverlay {
  private ctx: CanvasRenderingContext2D;
  private entityRenderer: EntityRenderer;

  constructor(ctx: CanvasRenderingContext2D, entityRenderer: EntityRenderer) {
    this.ctx = ctx;
    this.entityRenderer = entityRenderer;
  }

  render(currentState: GameState, future: Future): void {
    const { CELL_SIZE } = CONFIG;
    const ctx = this.ctx;
    const futureState = future.state;

    // Draw ghost entities at future positions
    this.entityRenderer.renderGhostPlayer(futureState.player.pos);

    for (const enemy of futureState.enemies) {
      this.entityRenderer.renderGhostEnemy(enemy.pos);
    }

    // Draw arrows from current to future positions
    this.drawArrow(
      currentState.player.pos,
      futureState.player.pos,
      this.getArrowColor(currentState.player.pos, futureState.player.pos, currentState.goalPos, true)
    );

    for (let i = 0; i < currentState.enemies.length; i++) {
      const oldPos = currentState.enemies[i].pos;
      const newPos = futureState.enemies[i].pos;
      this.drawArrow(
        oldPos,
        newPos,
        this.getArrowColor(oldPos, newPos, currentState.player.pos, false)
      );
    }

    // Highlight quality with a subtle border tint
    const qualColor = future.quality > 0.1 ? COLORS.FUTURE_GOOD :
      future.quality < -0.1 ? COLORS.FUTURE_BAD : COLORS.ACCENT;
    const alpha = 0.08;
    ctx.save();
    ctx.strokeStyle = qualColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, CONFIG.GRID_COLS * CELL_SIZE - 4, CONFIG.GRID_ROWS * CELL_SIZE - 4);
    ctx.restore();
  }

  private getArrowColor(from: Position, to: Position, target: Position, isGood: boolean): string {
    const oldDist = Grid.manhattanDistance(from, target);
    const newDist = Grid.manhattanDistance(to, target);
    if (from.x === to.x && from.y === to.y) return COLORS.ACCENT;
    if (isGood) {
      // For player: closer to goal = green
      return newDist < oldDist ? COLORS.FUTURE_GOOD : COLORS.FUTURE_BAD;
    } else {
      // For enemy: closer to player = bad for us
      return newDist < oldDist ? COLORS.FUTURE_BAD : COLORS.FUTURE_GOOD;
    }
  }

  private drawArrow(from: Position, to: Position, color: string): void {
    if (from.x === to.x && from.y === to.y) return;

    const { CELL_SIZE } = CONFIG;
    const ctx = this.ctx;
    const fx = from.x * CELL_SIZE + CELL_SIZE / 2;
    const fy = from.y * CELL_SIZE + CELL_SIZE / 2;
    const tx = to.x * CELL_SIZE + CELL_SIZE / 2;
    const ty = to.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(ty - fy, tx - fx);
    const headLen = 10;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(
      tx - headLen * Math.cos(angle - Math.PI / 6),
      ty - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(tx, ty);
    ctx.lineTo(
      tx - headLen * Math.cos(angle + Math.PI / 6),
      ty - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();

    ctx.restore();
  }
}
