
export interface Pt { r: number; c: number; }
export interface Pair { color: string; a: Pt; b: Pt; }

export interface Cell {
  endpointColor?: string;
  pathColor?: string;
}

export class FlowFreeEngine {
  readonly size: number;
  readonly pairs: Pair[];

  private board: Cell[][];
  private paths = new Map<string, Pt[]>();
  private completed = new Set<string>();

  private activeColor: string | null = null;
  private dragging = false;

  // contador de celdas cubiertas (solo pathColor, incluye endpoints cuando el camino los toca)
  private covered = 0;

  // Eventos opcionales
  onPairConnected?: (color: string) => void;
  onPairDisconnected?: (color: string) => void;

  constructor(size: number, pairs: Pair[]) {
    this.size = size;
    this.pairs = pairs;

    this.board = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({} as Cell))
    );

    for (const p of pairs) {
      this.cell(p.a).endpointColor = p.color;
      this.cell(p.b).endpointColor = p.color;
      this.paths.set(p.color, []);
    }
  }

  // ====== Lectura ======
  getBoard(): ReadonlyArray<ReadonlyArray<Cell>> { return this.board; }
  isDragging() { return this.dragging; }
  isColorConnected(color: string): boolean { return this.completed.has(color); }
  getConnectedColors(): string[] { return Array.from(this.completed); }

  isSolved(): boolean {
    // Regla: TODOS los pares conectados Y TODAS las celdas cubiertas
    return this.completed.size === this.pairs.length &&
           this.covered === this.size * this.size;
  }

  progress(): { connected: number; total: number; covered: number; cells: number } {
    return { connected: this.completed.size, total: this.pairs.length, covered: this.covered, cells: this.size * this.size };
  }

  // ====== Interacción ======
  startDragAt(pt: Pt): boolean {
    const color = this.cell(pt).endpointColor;
    if (!color) return false;

    const wasCompleted = this.completed.has(color);

    // limpiar trazado previo de este color (dejando endpoints)
    this.clearPath(color, /*preserveEndpoints*/ true);

    // iniciar camino
    const path = [pt];
    this.paths.set(color, path);

    // cubrir la celda si no lo estaba
    if (!this.cell(pt).pathColor) {
      this.cell(pt).pathColor = color;
      this.covered++;
    } else {
      // si veníamos de un estado inconsistente (no debería), forzamos el color
      this.cell(pt).pathColor = color;
    }

    this.activeColor = color;
    this.dragging = true;

    if (wasCompleted) {
      this.completed.delete(color);
      this.onPairDisconnected?.(color);
    }
    return true;
  }

  dragTo(pt: Pt): boolean {
    if (!this.dragging || !this.activeColor) return false;
    const color = this.activeColor;
    const path = this.paths.get(color)!;
    const head = path[path.length - 1];

    if (!this.inBounds(pt) || !this.isNeighbor(head, pt)) return false;

    const target = this.cell(pt);

    // no pisar endpoints de otro color
    if (target.endpointColor && target.endpointColor !== color) return false;
    // no pisar tuberías de otro color
    if (target.pathColor && target.pathColor !== color) return false;

    // backtrack 1 paso
    if (path.length >= 2 && this.eq(path[path.length - 2], pt)) {
      const last = path.pop()!;
      // al quitar el último, se descuenta cobertura
      if (this.board[last.r][last.c].pathColor) {
        this.board[last.r][last.c].pathColor = undefined;
        this.covered--;
      }
      return true;
    }

    // recortar hacia una celda anterior del mismo camino
    const alreadyAt = path.findIndex(p => this.eq(p, pt));
    if (alreadyAt !== -1) {
      for (let i = path.length - 1; i > alreadyAt; i--) {
        const q = path.pop()!;
        if (this.board[q.r][q.c].pathColor) {
          this.board[q.r][q.c].pathColor = undefined;
          this.covered--;
        }
      }
      return true;
    }

    // avanzar
    path.push(pt);
    if (!target.pathColor) { // cubrir si estaba libre
      target.pathColor = color;
      this.covered++;
    } else {
      // ya tenía mismo color (raro porque evitaríamos self-cross); lo normal es que estuviera libre
      target.pathColor = color;
    }

    // ¿conectó el par?
    const pair = this.getPair(color)!;
    const reachedOther = (this.eq(pt, pair.a) || this.eq(pt, pair.b)) && !this.eq(pt, path[0]);
    if (reachedOther) {
      this.completed.add(color);
      this.activeColor = null;
      this.dragging = false;
      this.onPairConnected?.(color);
    }
    return true;
  }

  endDrag(): void {
    this.dragging = false;
    this.activeColor = null;
  }

  resetAll(): void {
    for (const p of this.pairs) this.clearPath(p.color, true);
    this.completed.clear();
    this.covered = 0;
  }

  clearColor(color: string): void {
    const wasCompleted = this.completed.delete(color);
    this.clearPath(color, true);
    if (wasCompleted) this.onPairDisconnected?.(color);
  }

  // ====== Helpers internos ======
  private cell(pt: Pt): Cell { return this.board[pt.r][pt.c]; }
  private inBounds(pt: Pt): boolean {
    return pt.r >= 0 && pt.c >= 0 && pt.r < this.size && pt.c < this.size;
  }
  private isNeighbor(a: Pt, b: Pt): boolean {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }
  private eq(a: Pt, b: Pt) { return a.r === b.r && a.c === b.c; }
  private getPair(color: string): Pair | undefined {
    return this.pairs.find(p => p.color === color);
  }

  private clearPath(color: string, preserveEndpoints: boolean) {
    const old = this.paths.get(color) || [];
    for (const pt of old) {
      const cell = this.board[pt.r][pt.c];
      const isEndpoint = cell.endpointColor === color;
      if (isEndpoint && preserveEndpoints) continue;
      if (cell.pathColor) {
        cell.pathColor = undefined;
        this.covered--;
      }
    }
    this.paths.set(color, []);
  }
}





// // Motor minimalista de Flow Free: pares de colores, trayectorias, validaciones y "solved".
// export interface Pt { r: number; c: number; }
// export interface Pair { color: string; a: Pt; b: Pt; }

// export interface Cell {
//   endpointColor?: string;   // color del punto fijo
//   pathColor?: string;       // color de la tubería ocupando esta celda
// }

// export class FlowFreeEngine {
//   readonly size: number;
//   readonly pairs: Pair[];
//   strictFill: boolean;

//   private board: Cell[][];
//   private paths = new Map<string, Pt[]>();     // color → lista de puntos (ordenados)
//   private completed = new Set<string>();       // colores conectados correctamente

//   private activeColor: string | null = null;   // color que el jugador está trazando
//   private dragging = false;
 
//   // Callbacks opcionales para notificar eventos
//   onPairConnected?: (color: string) => void
//   onPairDisconnected?: (color: string) => void




//   constructor(size: number, pairs: Pair[], strictFill = true) {
//     this.size = size;
//     this.pairs = pairs;
//     this.strictFill = strictFill;
//     this.board = Array.from({ length: size }, () =>
//       Array.from({ length: size }, () => ({} as Cell))
//     );
//     // Marcar endpoints
//     for (const p of pairs) {
//       this.cell(p.a).endpointColor = p.color;
//       this.cell(p.b).endpointColor = p.color;
//       this.paths.set(p.color, []); // arranca sin trazo
//     }
//   }

//   // ===== API de consulta =====
//   getBoard(): ReadonlyArray<ReadonlyArray<Cell>> { return this.board; }
//   isDragging() { return this.dragging; }
//   isSolved(): boolean {
//     if (this.completed.size !== this.pairs.length) return false;
//     if (!this.strictFill) return true;
//     // strict: todas las celdas deben estar cubiertas
//     for (let r = 0; r < this.size; r++) {
//       for (let c = 0; c < this.size; c++) {
//         if (!this.board[r][c].pathColor) return false;
//       }
//     }
//     return true;
//   }
//   progress(): { connected: number; total: number; covered: number; cells: number } {
//     const cells = this.size * this.size;
//     let covered = 0;
//     for (let r = 0; r < this.size; r++)
//       for (let c = 0; c < this.size; c++)
//         if (this.board[r][c].pathColor) covered++;
//     return { connected: this.completed.size, total: this.pairs.length, covered, cells };
//   }

//   // ===== Interacción =====
//   startDragAt(pt: Pt): boolean {
//     const color = this.cell(pt).endpointColor;
//     if (!color) return false; // solo se inicia en un endpoint
//     // reiniciar el trazo de este color si existía
//     this.clearPath(color, /*preserveEndpoints*/ true);
//     this.paths.set(color, [pt]);
//     this.board[pt.r][pt.c].pathColor = color;
//     this.activeColor = color;
//     this.dragging = true;
//     this.completed.delete(color); // por si lo rehace
//     return true;
//   }

//   dragTo(pt: Pt): boolean {
//     if (!this.dragging || !this.activeColor) return false;
//     const color = this.activeColor;
//     const path = this.paths.get(color)!;
//     const head = path[path.length - 1];
//     if (!this.isNeighbor(head, pt) || !this.inBounds(pt)) return false;

//     const target = this.cell(pt);

//     // No se puede pisar endpoint de otro color
//     if (target.endpointColor && target.endpointColor !== color) return false;
//     // No se puede cruzar tuberías de otro color
//     if (target.pathColor && target.pathColor !== color) return false;

//     // ¿Backtrack 1 paso?
//     if (path.length >= 2 && this.eq(path[path.length - 2], pt)) {
//       const last = path.pop()!;
//       this.board[last.r][last.c].pathColor = undefined;
//       return true;
//     }

//     // ¿Cortar dentro del mismo camino? (volver a una posición previa)
//     const alreadyAt = path.findIndex(p => this.eq(p, pt));
//     if (alreadyAt !== -1) {
//       for (let i = path.length - 1; i > alreadyAt; i--) {
//         const q = path.pop()!;
//         this.board[q.r][q.c].pathColor = undefined;
//       }
//       return true;
//     }

//     // Avanzar
//     path.push(pt);
//     target.pathColor = color;

//     // ¿Llegó al otro endpoint?
//     const pair = this.getPair(color)!;
//     const reachedOther = (this.eq(pt, pair.a) || this.eq(pt, pair.b)) &&
//                          !this.eq(pt, path[0]); // no el mismo endpoint inicial
//     if (reachedOther) {
//       this.completed.add(color);
//       this.activeColor = null;
//       this.dragging = false;
//     }
//     return true;
//   }

//   endDrag(): void {
//     this.dragging = false;
//     this.activeColor = null;
//   }

//   resetAll(): void {
//     for (const p of this.pairs) this.clearPath(p.color, true);
//     this.completed.clear();
//   }

//   clearColor(color: string): void { this.clearPath(color, true); this.completed.delete(color); }

//   // ===== Helpers =====
//   private cell(pt: Pt): Cell { return this.board[pt.r][pt.c]; }
//   private inBounds(pt: Pt): boolean {
//     return pt.r >= 0 && pt.c >= 0 && pt.r < this.size && pt.c < this.size;
//   }
//   private isNeighbor(a: Pt, b: Pt): boolean {
//     return (Math.abs(a.r - b.r) + Math.abs(a.c - b.c)) === 1;
//   }
//   private eq(a: Pt, b: Pt) { return a.r === b.r && a.c === b.c; }
//   private getPair(color: string): Pair | undefined {
//     return this.pairs.find(p => p.color === color);
//   }
//   private clearPath(color: string, preserveEndpoints: boolean) {
//     const old = this.paths.get(color) || [];
//     for (const pt of old) {
//       const isEndpoint = this.cell(pt).endpointColor === color;
//       if (isEndpoint && preserveEndpoints) continue;
//       this.board[pt.r][pt.c].pathColor = undefined;
//     }
//     this.paths.set(color, []);
//   }
// }

