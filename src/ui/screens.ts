import { CONFIG, COLORS } from '../config.ts';

function fillScreen(ctx: CanvasRenderingContext2D): void {
  const w = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
  const h = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, w, h);
}

export function renderTitleScreen(ctx: CanvasRenderingContext2D): void {
  const w = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
  const h = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
  fillScreen(ctx);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.PLAYER;
  ctx.shadowColor = COLORS.PLAYER;
  ctx.shadowBlur = 20;
  ctx.fillText('QUANTUM RUNNER', w / 2, h * 0.25);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.UI_TEXT;
  ctx.fillText('Collapse the timeline. Reach the beacon.', w / 2, h * 0.38);

  // Rules
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#668866';
  const rules = [
    'Each turn generates possible futures.',
    'ACCEPT a future or PASS to see the next.',
    'The last future is forced if all others are passed.',
    'Reach the green beacon. Avoid the sentinels.',
  ];
  rules.forEach((line, i) => {
    ctx.fillText(line, w / 2, h * 0.50 + i * 22);
  });

  // Controls
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.ACCENT;
  ctx.fillText('[Enter] Accept  •  [Space] Pass', w / 2, h * 0.78);

  // Start prompt
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.GOAL;
  ctx.fillText('Press ENTER to start', w / 2, h * 0.88);
}

export function renderWinScreen(ctx: CanvasRenderingContext2D, turns: number): void {
  const w = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
  const h = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
  fillScreen(ctx);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.GOAL;
  ctx.shadowColor = COLORS.GOAL;
  ctx.shadowBlur = 20;
  ctx.fillText('REALITY COLLAPSED', w / 2, h * 0.3);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.PLAYER;
  ctx.fillText('— YOU WIN —', w / 2, h * 0.42);

  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.UI_TEXT;
  ctx.fillText(`Timeline stabilized in ${turns} turns`, w / 2, h * 0.56);

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.ACCENT;
  ctx.fillText('Press ENTER or R to restart', w / 2, h * 0.75);
}

export function renderLoseScreen(ctx: CanvasRenderingContext2D, turns: number): void {
  const w = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
  const h = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
  fillScreen(ctx);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.DANGER;
  ctx.shadowColor = COLORS.DANGER;
  ctx.shadowBlur = 20;
  ctx.fillText('TIMELINE TERMINATED', w / 2, h * 0.3);
  ctx.shadowBlur = 0;

  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.ENEMY;
  ctx.fillText('A sentinel caught you.', w / 2, h * 0.44);

  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.UI_TEXT;
  ctx.fillText(`Survived ${turns} turns`, w / 2, h * 0.56);

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.ACCENT;
  ctx.fillText('Press ENTER or R to restart', w / 2, h * 0.75);
}
