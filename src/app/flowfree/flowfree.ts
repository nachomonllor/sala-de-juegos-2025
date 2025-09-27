import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generatePuzzle } from './puzzle-gen';
import { FlowFreeEngine, Pair } from './flowfree-engine';
import { RouterLink } from '@angular/router';

type RGB = string;

const COLORS: Record<string, RGB> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  green: '#22c55e',
  orange: '#f59e0b',
  purple: '#a855f7',
};

// Puzzle de ejemplo 5×5 (solo para probar la UI)
const PUZZLE_5: Pair[] = [
  { color: 'blue', a: { r: 0, c: 1 }, b: { r: 3, c: 0 } },
  { color: 'green', a: { r: 0, c: 3 }, b: { r: 3, c: 3 } },
  { color: 'yellow', a: { r: 1, c: 2 }, b: { r: 4, c: 2 } },
  { color: 'red', a: { r: 1, c: 0 }, b: { r: 4, c: 0 } },
  { color: 'purple', a: { r: 2, c: 4 }, b: { r: 4, c: 4 } },
];

@Component({
  selector: 'app-flowfree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flowfree.html',
  styleUrls: ['./flowfree.css']
})
export class FlowFreeComponent implements OnInit {

  @Input() size = 5;
  engine!: FlowFreeEngine;
  board = [] as ReturnType<FlowFreeEngine['getBoard']>;
  message = '';
  solution?: (string | null)[][];   // opcional: por si querés “mostrar solución”

  // ==== TIMER ====
  private timerRef: any = null;
  private startEpoch = 0;
  elapsedMs = 0;                        // lo mostramos como mm:ss


  ngOnInit() {
    const N = 5;
    const palette = ['blue', 'green', 'yellow', 'red', 'purple', 'orange']; // recorta a K
    const { pairs, solution } = generatePuzzle(N, palette, { k: 5, minSeg: 3 });
    this.solution = solution; // guardamos la matriz de la solución (oculta)

    this.engine = new FlowFreeEngine(N, pairs);
    this.engine.onPairConnected = () => {
      this.board = this.engine.getBoard();
      if (this.engine.isSolved()) this.message = '¡Resuelto! 🎉';
    };
    this.engine.onPairDisconnected = () => {
      this.board = this.engine.getBoard();
      this.checkWinHard();            // ← aquí
      this.message = '';
    };
    this.board = this.engine.getBoard();

    this.restartTimer(); 
  }

  ngOnDestroy(): void { 
    this.stopTimer(); 
  
   // this.restartTimer(); // <-------------------
  }

  // ====== TIMER helpers ======
  private startTimer() {
    this.stopTimer();
    this.startEpoch = Date.now();
    this.elapsedMs = 0;
    this.timerRef = setInterval(() => {
      this.elapsedMs = Date.now() - this.startEpoch;
    }, 1000);
  }
  private stopTimer() {
    if (this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
  }

  private restartTimer() { this.startTimer(); }

  get clock(): string {
    const total = Math.floor(this.elapsedMs / 1000);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  colorToCss(c?: string): string | null {
    if (!c) return null;
    return COLORS[c] ?? c;
  }

  onPointerDown(r: number, c: number, ev: PointerEvent) {
    ev.preventDefault();
    if (this.engine.startDragAt({ r, c })) {
      this.message = '';
      this.board = this.engine.getBoard();
    }
  }

  // onPointerEnter(r: number, c: number, _ev: PointerEvent) {
  //   if (!this.engine.isDragging()) return;
  //   if (this.engine.dragTo({ r, c })) {
  //     this.board = this.engine.getBoard();
  //     if (this.engine.isSolved()) this.message = '¡Resuelto! 🎉';
  //   }
  // }

  onPointerEnter(r: number, c: number, _ev: PointerEvent) {
    if (!this.engine.isDragging()) return;
    if (this.engine.dragTo({ r, c })) {
      this.board = this.engine.getBoard();
      this.checkWinHard();          // ← aquí
    }
  }

  @HostListener('document:pointerup') onPointerUp() { this.engine.endDrag(); }

  reset() {
    this.engine.resetAll();
    this.board = this.engine.getBoard();
    this.message = '';
   // this.restartTimer();                // ← reinicia cronómetro
  }
  // reset() {
  //   this.engine.resetAll();
  //   this.board = this.engine.getBoard();
  //   this.message = '';
  // }

  pairs() { return (this.engine as any).pairs; }

  /** ¿Hay conexión de esta celda hacia la dirección dada con el mismo color? */
  conn(r: number, c: number, dir: 'n' | 'e' | 's' | 'w'): boolean {
    const cell = this.board[r][c];
    if (!cell?.pathColor) return false;
    const color = cell.pathColor;

    const neigh: Record<typeof dir, [number, number]> = {
      n: [r - 1, c], e: [r, c + 1], s: [r + 1, c], w: [r, c - 1]
    } as any;

    const [rr, cc] = neigh[dir];
    const nb = this.board[rr]?.[cc];
    return !!nb && nb.pathColor === color;
  }

  newGame() {
    const N = 5;
    const palette = ['blue', 'green', 'yellow', 'red', 'purple', 'orange'];
    const { pairs, solution } = generatePuzzle(N, palette, { k: 5, minSeg: 3 });
    this.solution = solution;
    this.engine = new FlowFreeEngine(N, pairs);
    this.board = this.engine.getBoard();
    this.message = '';
    this.restartTimer();                // ← reinicia cronómetro
  }

  // -------------------------------
  private boardCovered(): boolean {
    const b = this.engine.getBoard();
    for (let r = 0; r < b.length; r++) {
      for (let c = 0; c < b.length; c++) {
        if (!b[r][c].pathColor) return false;
      }
    }
    return true;
  }

  private allPairsConnected(): boolean {
    // usa la API del motor; si prefieres, puedes usar getConnectedColors()
    return this.pairs().every((p: { color: string; }) => this.engine.isColorConnected(p.color));
  }

  private checkWinHard(): void {
    if (this.allPairsConnected() && this.boardCovered()) {
      this.message = '¡Resuelto! 🎉';
    }
  }


}





//--------------------------------------------

// @Input() size = 5;  // ← 5x5 por defecto
// engine!: FlowFreeEngine;
// board = this.engine?.getBoard?.() ?? [];
// message = '';

// ngOnInit() {
//   const N = Math.min(5, Math.max(5, this.size)); // siempre 5
//   this.engine = new FlowFreeEngine(N, PUZZLE_5);
//   this.engine.onPairConnected = () => {
//     this.board = this.engine.getBoard();
//     if (this.engine.isSolved()) this.message = '¡Resuelto! 🎉';
//   };
//   this.engine.onPairDisconnected = () => {
//     this.board = this.engine.getBoard();
//     this.message = '';
//   };
//   this.board = this.engine.getBoard();
// }


// import { Component, HostListener, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { FlowFreeEngine, Pair } from '../../games/flowfree-engine';

// type RGB = string;

// const COLORS: Record<string, RGB> = {
//   red: '#ef4444',
//   blue: '#3b82f6',
//   yellow: '#eab308',
//   green: '#22c55e',
//   orange: '#f59e0b',
//   purple: '#a855f7',
// };

// // const PUZZLE_15: Pair[] = [
// //   { color: 'blue', a: { r: 0, c: 0 }, b: { r: 0, c: 4 } },
// //   { color: 'red', a: { r: 14, c: 14 }, b: { r: 10, c: 14 } },
// //   { color: 'yellow', a: { r: 2, c: 2 }, b: { r: 4, c: 6 } },
// //   { color: 'green', a: { r: 12, c: 2 }, b: { r: 8, c: 5 } },
// //   { color: 'orange', a: { r: 7, c: 1 }, b: { r: 7, c: 13 } },
// //   { color: 'purple', a: { r: 1, c: 13 }, b: { r: 6, c: 9 } },
// // ];


// const PUZZLE_15: Pair[] = [
//   { color: 'blue', a: { r: 0, c: 0 }, b: { r: 0, c: 4 } },
//   { color: 'red', a: { r: 2, c: 2 }, b: { r: 3, c: 3 } },
//  // { color: 'yellow', a: { r: 2, c: 2 }, b: { r: 4, c: 6 } },
//   // { color: 'green', a: { r: 12, c: 2 }, b: { r: 8, c: 5 } },
//   // { color: 'orange', a: { r: 7, c: 1 }, b: { r: 7, c: 13 } },
//   // { color: 'purple', a: { r: 1, c: 13 }, b: { r: 6, c: 9 } },
// ];

// @Component({
//   selector: 'app-flowfree',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './flowfree.html',
//   styleUrls: ['./flowfree.css']   // ← plural
// })
// export class FlowFreeComponent implements OnInit {

//   @Input() size = 6;

//   engine!: FlowFreeEngine;
//   board = [] as ReturnType<FlowFreeEngine['getBoard']>;
//   message = '';

//   ngOnInit() {
//     const N = Math.max(6, this.size);
//     this.engine = new FlowFreeEngine(N, PUZZLE_15);  // motor con “tablero lleno” + “pares”
//     this.engine.onPairConnected = () => {
//       this.board = this.engine.getBoard();
//       if (this.engine.isSolved()) this.message = '¡Resuelto! 🎉';
//     };
//     this.engine.onPairDisconnected = () => {
//       this.board = this.engine.getBoard();
//       this.message = '';
//     };
//     this.board = this.engine.getBoard();
//   }

//   // clearColor(arg0: string) {
//   //   throw new Error('Method not implemented.');
//   // }

//   colorToCss(c?: string): string | null {
//     if (!c) return null;
//     return COLORS[c] ?? c;
//   }

//   onPointerDown(r: number, c: number, ev: PointerEvent) {
//     ev.preventDefault();
//     if (this.engine.startDragAt({ r, c })) {
//       this.message = '';
//       this.board = this.engine.getBoard();
//     }
//   }

//   onPointerEnter(r: number, c: number, _ev: PointerEvent) {
//     if (!this.engine.isDragging()) return;
//     if (this.engine.dragTo({ r, c })) {
//       this.board = this.engine.getBoard();
//       if (this.engine.isSolved()) this.message = '¡Resuelto! 🎉';
//     }
//   }

//   @HostListener('document:pointerup')
//   onPointerUp() { this.engine.endDrag(); }

//   reset() {
//     this.engine.resetAll();
//     this.board = this.engine.getBoard();
//     this.message = '';
//   }

//   pairs() { return (this.engine as any).pairs as Pair[]; }

//   clearColor(color: string) {
//     this.engine.clearColor(color);    // borra la tubería de ese color y marca desconectado
//     this.board = this.engine.getBoard();
//     this.message = '';
//   }


// }
