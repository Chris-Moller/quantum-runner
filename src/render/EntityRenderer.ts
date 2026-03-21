import type { Entity, Position } from '../types.ts';
import { CONFIG, COLORS } from '../config.ts';

export class EntityRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  renderPlayer(player: Entity): void {
    this.drawDiamond(player.pos, COLORS.PLAYER, 1);
  }

  renderEnemy(enemy: Entity): void {
    this.drawSpike(enemy.pos, COLORS.ENEMY, 1);
  }

  renderGoal(pos: Position, pulse: number): void {
    const { CELL_SIZE } = CONFIG;
    const ctx = this.ctx;
    const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;
    const baseRadius = CELL_SIZE * 0.3;
    const radius = baseRadius + 3 * Math.sin(pulse);

    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(57, 255, 20, 0.15)';
    ctx.fill();

    // Main beacon
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.GOAL;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.GOAL;
    ctx.fill();
  }

  private drawDiamond(pos: Position, color: string, alpha: number): void {
    const { CELL_SIZE } = CONFIG;
    const ctx = this.ctx;
    const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;
    const s = CELL_SIZE * 0.35;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(cx, cy - s);     // top
    ctx.lineTo(cx + s, cy);     // right
    ctx.lineTo(cx, cy + s);     // bottom
    ctx.lineTo(cx - s, cy);     // left
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private drawSpike(pos: Position, color: string, alpha: number): void {
    const { CELL_SIZE } = CONFIG;
    const ctx = this.ctx;
    const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;
    const s = CELL_SIZE * 0.32;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    // Draw jagged hexagon-like shape
    ctx.beginPath();
    const spikes = 6;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? s : s * 0.55;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /** Draw a ghost/translucent version of an entity (for future overlay). */
  renderGhostPlayer(pos: Position): void {
    this.drawDiamond(pos, COLORS.PLAYER, 0.4);
  }

  renderGhostEnemy(pos: Position): void {
    this.drawSpike(pos, COLORS.ENEMY, 0.4);
  }
}
