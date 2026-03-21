import type { GameState, GamePhase, Future } from '../types.ts';
import { CONFIG } from '../config.ts';
import { createInitialState } from '../state/level.ts';
import { generateFutures } from '../engine/FuturesEngine.ts';
import { Renderer } from '../render/Renderer.ts';
import { TurnManager } from './TurnManager.ts';
import { HUD } from './HUD.ts';
import { renderTitleScreen, renderWinScreen, renderLoseScreen } from './screens.ts';

export class GameController {
  private phase: GamePhase = 'title';
  private state: GameState;
  private renderer: Renderer;
  private turnManager: TurnManager;
  private hud: HUD;
  private canvas: HTMLCanvasElement;
  private description = '';

  // DOM elements
  private btnAccept: HTMLButtonElement;
  private btnPass: HTMLButtonElement;
  private futureInfo: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.turnManager = new TurnManager();
    this.state = createInitialState();

    const ctx = canvas.getContext('2d')!;
    this.hud = new HUD(ctx);

    this.btnAccept = document.getElementById('btn-accept') as HTMLButtonElement;
    this.btnPass = document.getElementById('btn-pass') as HTMLButtonElement;
    this.futureInfo = document.getElementById('future-info') as HTMLElement;

    this.setupInputs();
    this.renderer.startPulse();
    this.render();
  }

  private setupInputs(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleAccept();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.handlePass();
      } else if (e.key === 'r' || e.key === 'R') {
        if (this.phase === 'won' || this.phase === 'lost') {
          this.restart();
        }
      }
    });

    this.btnAccept.addEventListener('click', () => this.handleAccept());
    this.btnPass.addEventListener('click', () => this.handlePass());
  }

  private handleAccept(): void {
    if (this.phase === 'title') {
      this.startGame();
    } else if (this.phase === 'choosing') {
      this.acceptFuture();
    } else if (this.phase === 'won' || this.phase === 'lost') {
      this.restart();
    }
  }

  private handlePass(): void {
    if (this.phase === 'choosing') {
      this.passFuture();
    }
  }

  private startGame(): void {
    this.state = createInitialState();
    this.phase = 'playing';
    this.generateTurn();
  }

  private restart(): void {
    this.state = createInitialState();
    this.phase = 'title';
    this.description = '';
    this.render();
  }

  private generateTurn(): void {
    const futures = generateFutures(this.state, CONFIG.NUM_FUTURES);
    this.turnManager.loadFutures(futures);
    this.phase = 'choosing';
    this.description = this.turnManager.currentFuture?.description ?? '';
    this.render();
  }

  private acceptFuture(): void {
    const accepted = this.turnManager.acceptCurrent();
    if (!accepted) return;
    this.applyFuture(accepted);
  }

  private passFuture(): void {
    const forced = this.turnManager.passCurrent();
    if (forced) {
      // Last future was forced
      this.applyFuture(forced);
    } else {
      // Show next future
      this.description = this.turnManager.currentFuture?.description ?? '';
      this.render();
    }
  }

  private applyFuture(future: Future): void {
    const prevTurn = this.state.turn;
    this.state = future.state;
    this.state.turn = prevTurn + 1;

    if (this.state.status === 'won') {
      this.phase = 'won';
      this.render();
    } else if (this.state.status === 'lost') {
      this.phase = 'lost';
      this.render();
    } else {
      this.phase = 'playing';
      // Next turn
      this.generateTurn();
    }
  }

  private render(): void {
    const ctx = this.canvas.getContext('2d')!;

    if (this.phase === 'title') {
      renderTitleScreen(ctx);
      this.updateButtons(false, false);
      this.futureInfo.textContent = '';
    } else if (this.phase === 'won') {
      renderWinScreen(ctx, this.state.turn);
      this.updateButtons(false, false);
      this.futureInfo.textContent = '';
    } else if (this.phase === 'lost') {
      renderLoseScreen(ctx, this.state.turn);
      this.updateButtons(false, false);
      this.futureInfo.textContent = '';
    } else if (this.phase === 'choosing') {
      const preview = this.turnManager.currentFuture ?? undefined;
      this.renderer.render(this.state, preview);
      this.hud.render(this.state, this.turnManager, this.description);
      this.updateButtons(true, !this.turnManager.isLastFuture);
      this.futureInfo.textContent = this.description;
    } else {
      this.renderer.render(this.state);
      this.updateButtons(false, false);
      this.futureInfo.textContent = '';
    }
  }

  private updateButtons(showAccept: boolean, showPass: boolean): void {
    this.btnAccept.style.display = showAccept ? 'inline-block' : 'none';
    this.btnPass.style.display = showPass ? 'inline-block' : 'none';

    if (this.turnManager.isLastFuture && showAccept) {
      this.btnAccept.textContent = 'ACCEPT (FORCED) [Enter]';
    } else {
      this.btnAccept.textContent = 'ACCEPT [Enter]';
    }
  }
}
