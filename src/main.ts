import './style.css';
import { GameController } from './ui/GameController.ts';

function init(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    document.body.textContent = 'Error: Canvas element not found';
    return;
  }
  new GameController(canvas);
}

document.fonts.ready.then(init).catch(() => {
  // Font loading failed or timed out — initialize anyway
  init();
});
