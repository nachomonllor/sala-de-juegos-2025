// src/app/flowfree/flowfree-solver.ts

export interface Point {
    x: number;
    y: number;
  }
  
  export interface Pair {
    start: Point;
    end: Point;
    colorID: number;
  }
  
  export class FlowFreeSolver {
    rows: number;
    cols: number;
    grid: number[][];
    pairs: Pair[];
    requireFullFill: boolean;
    recursionLimit: number;
  
    private recursionCounter: number;
    private directions: Point[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
  
    constructor(rows: number, cols: number) {
      this.rows = rows;
      this.cols = cols;
      this.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
      this.pairs = [];
      this.requireFullFill = false;
      this.recursionLimit = 1_000_000;
      this.recursionCounter = 0;
    }
  
    addPair(p: Pair): void {
      this.pairs.push(p);
      this.grid[p.start.y][p.start.x] = p.colorID;
      this.grid[p.end.y][p.end.x] = p.colorID;
    }
  
    solve(): boolean {
      this.recursionCounter = 0;
      return this.solvePairs(0);
    }
  
    private solvePairs(pairIndex: number): boolean {
      if (pairIndex >= this.pairs.length) {
        if (this.requireFullFill && !this.gridIsComplete()) return false;
        return true;
      }
  
      const currentPair = this.pairs[pairIndex];
      //return this.dfsForPair(currentPair, currentPair.start, [ currentPair.start ], pairIndex);

      return this.dfsForPairIterative(currentPair, pairIndex);

    }
  
    /*
    private dfsForPair(p: Pair, cur: Point, path: Point[], pairIndex: number): boolean {
      this.recursionCounter++;
      if (this.recursionCounter > this.recursionLimit) return false;
  
      if (cur.x === p.end.x && cur.y === p.end.y) {
        return this.solvePairs(pairIndex + 1);
      }
  
      const moves: Point[] = [];
      for (const d of this.directions) {
        const next: Point = { x: cur.x + d.x, y: cur.y + d.y };
        if (this.isValid(next, p)) moves.push(next);
      }
      moves.sort((a, b) => this.manhattanDistance(a, p.end) - this.manhattanDistance(b, p.end));
  
      for (const next of moves) {
        const wasEmpty = this.grid[next.y][next.x] === 0;
        if (wasEmpty) this.grid[next.y][next.x] = p.colorID;
  
        path.push(next);
        if (this.dfsForPair(p, next, path, pairIndex)) return true;
  
        path.pop();
        if (wasEmpty) this.grid[next.y][next.x] = 0;
      }
  
      return false;
    }
    */

    // Dentro de la clase FlowFreeSolver, reemplaza dfsForPair por esto:

private dfsForPairIterative(p: Pair, pairIndex: number): boolean {
    type Frame = {
      pos: Point;
      moves: Point[];
      moveIndex: number;
      path: Point[];
    };
  
    this.recursionCounter = 0;
  
    // Asegúrate de que el start ya está marcado en grid desde addPair
    const start: Point = p.start;
    const end: Point   = p.end;
  
    // Genera vecinos ordenados por Manhattan
    const sortedNeighbors = (pt: Point): Point[] => {
      const arr: Point[] = [];
      for (const d of this.directions) {
        const nxt = { x: pt.x + d.x, y: pt.y + d.y };
        if (this.isValid(nxt, p)) arr.push(nxt);
      }
      return arr.sort((a, b) =>
        this.manhattanDistance(a, end) - this.manhattanDistance(b, end)
      );
    };
  
    const stack: Frame[] = [{
      pos: start,
      moves: sortedNeighbors(start),
      moveIndex: 0,
      path: [ start ]
    }];
  
    while (stack.length > 0) {
      // Control de límite de recursión (ahora en iterativo)
      if (++this.recursionCounter > this.recursionLimit) return false;
  
      const frame = stack[stack.length - 1];
  
      // Si llegamos al endpoint
      if (frame.pos.x === end.x && frame.pos.y === end.y) {
        // Intentamos resolver el siguiente par
        if (this.solvePairs(pairIndex + 1)) return true;
        // Si no, forzamos backtrack del frame actual
        // limpieza del último paso (si no es el inicio)
        if (!(frame.pos.x === start.x && frame.pos.y === start.y)) {
          this.grid[frame.pos.y][frame.pos.x] = 0;
        }
        stack.pop();
        continue;
      }
  
      // Si ya probamos todos los movimientos desde aquí, backtrack
      if (frame.moveIndex >= frame.moves.length) {
        // desmarca la celda actual (si no es el inicio)
        if (!(frame.pos.x === start.x && frame.pos.y === start.y)) {
          this.grid[frame.pos.y][frame.pos.x] = 0;
        }
        stack.pop();
        continue;
      }
  
      // Toma el siguiente movimiento
      const next = frame.moves[frame.moveIndex++];
      const wasEmpty = this.grid[next.y][next.x] === 0;
      if (wasEmpty) {
        this.grid[next.y][next.x] = p.colorID;
      }
  
      // Empuja nuevo frame
      stack.push({
        pos: next,
        moves: sortedNeighbors(next),
        moveIndex: 0,
        path: frame.path.concat([ next ])
      });
    }
  
    return false;
  }
  
  
    private isValid(pt: Point, p: Pair): boolean {
      if (pt.x < 0 || pt.x >= this.cols || pt.y < 0 || pt.y >= this.rows) return false;
      if (pt.x === p.end.x && pt.y === p.end.y) return true;
      return this.grid[pt.y][pt.x] === 0;
    }
  
    private manhattanDistance(a: Point, b: Point): number {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  
    private gridIsComplete(): boolean {
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (this.grid[y][x] === 0) return false;
        }
      }
      return true;
    }
  }
  