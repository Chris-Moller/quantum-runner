import './style.css';
import { GameController } from './ui/GameController.ts';

// Wait for fonts to load before initializing
document.fonts.ready.then(() => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }
  new GameController(canvas);
});
