import type { CellType, Position } from '../types.ts';
import { CONFIG } from '../config.ts';

export class Grid {
  readonly cells: CellType[][];
  readonly cols: number;
  readonly rows: number;

  constructor(cells: CellType[][]) {
    this.cells = cells;
    this.rows = cells.length;
    this.cols = cells.length > 0 ? cells[0].length : 0;
  }

  getCell(x: number, y: number): CellType | undefined {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return undefined;
    return this.cells[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return cell === 'floor' || cell === 'goal';
  }

  getNeighbors(pos: Position): Position[] {
    const dirs: Position[] = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 },  // right
    ];
    return dirs
      .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
      .filter(p => this.isWalkable(p.x, p.y));
  }

  static manhattanDistance(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  static fromConfig(): Grid {
    const cells: CellType[][] = [];
    for (let y = 0; y < CONFIG.GRID_ROWS; y++) {
      cells.push(new Array<CellType>(CONFIG.GRID_COLS).fill('floor'));
    }
    return new Grid(cells);
  }
}
