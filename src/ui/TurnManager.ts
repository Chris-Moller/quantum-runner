import type { Future } from '../types.ts';

export class TurnManager {
  private futures: Future[] = [];
  private currentIndex = 0;

  /** Load a new batch of futures for this turn. */
  loadFutures(futures: Future[]): void {
    this.futures = futures;
    this.currentIndex = 0;
  }

  /** Get the current future being displayed. */
  get currentFuture(): Future | null {
    if (this.currentIndex < this.futures.length) {
      return this.futures[this.currentIndex];
    }
    return null;
  }

  /** How many futures remain (including current). */
  get futuresRemaining(): number {
    return this.futures.length - this.currentIndex;
  }

  /** Total futures this turn. */
  get totalFutures(): number {
    return this.futures.length;
  }

  /** Current 1-based index for display. */
  get currentNumber(): number {
    return this.currentIndex + 1;
  }

  /** Whether this is the last future (forced accept). */
  get isLastFuture(): boolean {
    return this.currentIndex === this.futures.length - 1;
  }

  /** Accept the current future. Returns it. */
  acceptCurrent(): Future | null {
    const f = this.currentFuture;
    this.futures = [];
    this.currentIndex = 0;
    return f;
  }

  /** Pass on the current future. Advances to next. If last, auto-accepts. */
  passCurrent(): Future | null {
    if (this.isLastFuture) {
      // Last future is forced
      return this.acceptCurrent();
    }
    this.currentIndex++;
    return null; // null means "show next", not accepted yet
  }
}
