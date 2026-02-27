import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Clase auxiliar para representar la “mejor jugada”

class MejorJugada {
  rotacion!: number;
  columna!: number;
  fila!: number;
  minHuecos!: number;
  altura!: number;
  bumpiness!: number;
}

class Tetromino {
  pieza: number[][];
  posicionPieza: Posicion = new Posicion(0, 0);
  id: number;
  colorPieza: string;

  constructor(pieza: number[][], id: number, color: string) {
    this.pieza = pieza;
    this.id = id;
    this.colorPieza = color;
  }

  clonar(): Tetromino {
    const nuevaMatriz = this.clonarMatriz(this.pieza);
    const clon = new Tetromino(nuevaMatriz, this.id, this.colorPieza);
    clon.posicionPieza = new Posicion(this.posicionPieza.row, this.posicionPieza.col);
    return clon;
  }

  private clonarMatriz(matriz: number[][]): number[][] {
    return matriz.map(fila => [...fila]);
  }

  // Rota la pieza 90° en sentido horario
  rotar(): void {
    const f = this.pieza.length;
    const c = this.pieza[0].length;
    // Se crea una matriz rotada de dimensiones [c x f]
    const rotada: number[][] = [];
    for (let i = 0; i < c; i++) {
      rotada[i] = new Array(f).fill(0);
    }
    for (let i = 0; i < f; i++) {
      for (let j = 0; j < c; j++) {
        rotada[j][f - 1 - i] = this.pieza[i][j];
      }
    }
    this.pieza = this.clonarMatriz(rotada);
  }
}

class Posicion {
    row: number;
    col: number;
  
    constructor(row: number, col: number) {
      this.row = row;
      this.col = col;
    }
  }
  

@Component({
  selector: 'app-tetris',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tetris.component.html',
  styleUrl: './tetris.component.scss'
})

export class TetrisComponent implements OnInit, AfterViewInit, OnDestroy {


  // 1. Agregá estas variables al inicio de tu clase, debajo de "timer: any;"
  clockTimer: any;
  startTime: number = 0;
  tiempoJugado: string = '00:00';


  // ngOnInit(): void {
  //   this.initializeBoard();
  //   this.inicializarPrototipos();
  //   this.generarNuevaPieza();
  //   // Emula el timer de Windows Forms con setInterval (50ms)
  //   this.timer = setInterval(() => this.timerTick(), 50);
  // }


// 2. Modificá tu ngOnInit para que arranque el reloj
  ngOnInit(): void {
    this.initializeBoard();
    this.inicializarPrototipos();
    this.iniciarPartidaIA(); // Separé el inicio en una función para poder reiniciar fácil
  }

// 3. Agregá estos métodos para manejar el tiempo y el inicio
  iniciarPartidaIA() {
    this.startTime = Date.now();
    this.tiempoJugado = '00:00';
    
    // Si había timers viejos, los limpiamos
    if (this.timer) clearInterval(this.timer);
    if (this.clockTimer) clearInterval(this.clockTimer);

    this.generarNuevaPieza();
    
    // Loop del juego (50ms) y Loop del reloj (1000ms)
    this.timer = setInterval(() => this.timerTick(), 50);
    this.clockTimer = setInterval(() => this.actualizarReloj(), 1000);
  }

  actualizarReloj() {
    const diff = Math.floor((Date.now() - this.startTime) / 1000);
    const minutos = Math.floor(diff / 60).toString().padStart(2, '0');
    const segundos = (diff % 60).toString().padStart(2, '0');
    this.tiempoJugado = `${minutos}:${segundos}`;
  }





  //-----------------------------------------

  readonly FILAS = 20;
  readonly COLUMNAS = 10;
  readonly tamCelda = 30;

  tablero: number[][] = [];
  piezaActual: Tetromino | null = null;
  piezasPrototipo: Tetromino[] = [];
  timer: any;
  // Los índices 0..7 corresponden a: 0 (celda vacía), 1: Cyan, 2: Purple, 3: Yellow, 4: Orange, 5: Blue, 6: Green, 7: Red.
  colores: string[] = ['black', 'cyan', 'purple', 'yellow', 'orange', 'blue', 'green', 'red'];

  @ViewChild('tetrisCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  constructor() { }


  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.COLUMNAS * this.tamCelda;
    canvas.height = this.FILAS * this.tamCelda;
    this.ctx = canvas.getContext('2d')!;
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // Escucha eventos de teclado a nivel de ventana (por ejemplo, la flecha hacia arriba para rotar)
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch(event.key) {
      case 'ArrowUp':
        this.rotarPieza();
        break;
      // Puedes agregar otros casos (izquierda, derecha, etc.) según necesites.
    }
    this.draw();
  }

  // Inicializa el tablero con FILAS x COLUMNAS celdas en 0 (vacío)
  initializeBoard(): void {
    this.tablero = Array.from({ length: this.FILAS }, () => Array(this.COLUMNAS).fill(0));
  }

  // Función auxiliar para clonar una matriz (evita modificar los prototipos)
  cloneMatrix(matriz: number[][]): number[][] {
    return matriz.map(row => [...row]);
  }

  // Inicializa los prototipos de tetrominos
  inicializarPrototipos(): void {
    this.piezasPrototipo = [];

    // Pieza I (id 1, color Cyan)
    const formaI: number[][] = [[1, 1, 1, 1]];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaI), 1, 'cyan'));

    // Pieza T (id 2, color Purple)
    const formaT: number[][] = [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaT), 2, 'purple'));

    // Pieza O (id 3, color Yellow)
    const formaO: number[][] = [
      [1, 1],
      [1, 1]
    ];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaO), 3, 'yellow'));

    // Pieza L (id 4, color Orange)
    const formaL: number[][] = [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 0]
    ];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaL), 4, 'orange'));

    // Pieza J (id 5, color Blue)
    const formaJ: number[][] = [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaJ), 5, 'blue'));

    // Pieza S (id 6, color Green)
    const formaS: number[][] = [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaS), 6, 'green'));

    // Pieza Z (id 7, color Red)
    const formaZ: number[][] = [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ];
    this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaZ), 7, 'red'));
  }

  // Genera una nueva pieza a partir de un prototipo aleatorio y usa la función de "mejor jugada"
  generarNuevaPieza(): void {
    const indice = Math.floor(Math.random() * this.piezasPrototipo.length);
    const prototipo = this.piezasPrototipo[indice];
    // Clonamos la pieza para que sea independiente
    this.piezaActual = new Tetromino(this.cloneMatrix(prototipo.pieza), prototipo.id, prototipo.colorPieza);
    this.piezaActual.posicionPieza = new Posicion(0, 0);

    const jugada = this.buscarMejorJugada();
    if (jugada) {
      // Aplicamos las rotaciones recomendadas
      for (let r = 0; r < jugada.rotacion; r++) {
        this.piezaActual.rotar();
      }
      // Posición inicial: fila 0 y en la columna recomendada
      this.piezaActual.posicionPieza = new Posicion(0, jugada.columna);
    }

    // // Si la nueva pieza colisiona inmediatamente, es “Game Over”
    // if (this.colision(this.piezaActual, this.piezaActual.posicionPieza.row, this.piezaActual.posicionPieza.col)) {
    //   clearInterval(this.timer);
    //   alert("¡Game Over!");
    //   this.initializeBoard();
    //   // Aquí podrías reiniciar el juego si lo deseas.
    //   return;
    // }


    // 4. Modificá el bloque de Game Over dentro de tu generarNuevaPieza():
    // Si la nueva pieza colisiona inmediatamente, es “Game Over”
    if (this.colision(this.piezaActual, this.piezaActual.posicionPieza.row, this.piezaActual.posicionPieza.col)) {
      clearInterval(this.timer);
      clearInterval(this.clockTimer); // Frenamos el reloj
      
      // En vez de un alert bloqueante que arruina la experiencia visual, 
      // lo reiniciamos automáticamente después de 2 segundos.
      console.log(`¡Colapso de IA! Sobrevivió: ${this.tiempoJugado}`);
      
      setTimeout(() => {
        this.initializeBoard();
        this.iniciarPartidaIA();
      }, 2000); // Espera 2 segundos viendo el tablero lleno y arranca de nuevo
      return;
    }

  }

  // Verifica si al ubicar el tetromino en (nuevaFila, nuevaColumna) hay colisión
  colision(tetromino: Tetromino, nuevaFila: number, nuevaColumna: number): boolean {
    const pieza = tetromino.pieza;
    const fPieza = pieza.length;
    const cPieza = pieza[0].length;
    for (let i = 0; i < fPieza; i++) {
      for (let j = 0; j < cPieza; j++) {
        if (pieza[i][j] !== 0) {
          const filaTablero = nuevaFila + i;
          const colTablero = nuevaColumna + j;
          if (colTablero < 0 || colTablero >= this.COLUMNAS || filaTablero >= this.FILAS) return true;
          if (filaTablero >= 0 && this.tablero[filaTablero][colTablero] !== 0) return true;
        }
      }
    }
    return false;
  }

  // Se ejecuta en cada "tick" del timer (cada 50ms)
  timerTick(): void {
    this.moverAbajo();
  }

  // Mueve la pieza actual hacia abajo, y si hay colisión la bloquea en el tablero
  moverAbajo(): void {
    if (
      this.piezaActual &&
      !this.colision(this.piezaActual, this.piezaActual.posicionPieza.row + 1, this.piezaActual.posicionPieza.col)
    ) {
      this.piezaActual.posicionPieza.row++;
    } else {
      this.bloquearPieza();
    }
    this.draw();
  }

  // Bloquea la pieza actual en el tablero, borra líneas completas y genera una nueva pieza
  bloquearPieza(): void {
    if (!this.piezaActual) {
      return;
    }
    const pieza = this.piezaActual.pieza;
    const fPieza = pieza.length;
    const cPieza = pieza[0].length;
    for (let i = 0; i < fPieza; i++) {
      for (let j = 0; j < cPieza; j++) {
        if (pieza[i][j] !== 0) {
          const filaTablero = this.piezaActual.posicionPieza.row + i;
          const colTablero = this.piezaActual.posicionPieza.col + j;
          if (filaTablero >= 0 && filaTablero < this.FILAS && colTablero >= 0 && colTablero < this.COLUMNAS) {
            this.tablero[filaTablero][colTablero] = this.piezaActual.id;
          }
        }
      }
    }
    this.borrarLineasCompletas();
    this.generarNuevaPieza();
  }

  // Rota la pieza actual; si la rotación genera colisión, se revierte
  rotarPieza(): void {
    if (!this.piezaActual) {
      return;
    }
    const formaAnterior = this.cloneMatrix(this.piezaActual.pieza);
    this.piezaActual.rotar();
    if (this.colision(this.piezaActual, this.piezaActual.posicionPieza.row, this.piezaActual.posicionPieza.col)) {
      // Revierte la rotación
      this.piezaActual.pieza = formaAnterior;
    }
  }

  // Métodos para el "juega solo" (simulación de la mejor jugada)
  fijarPiezaFantasma(tableroFantasma: number[][], tetro: Tetromino): number[][] {
    const fPieza = tetro.pieza.length;
    const cPieza = tetro.pieza[0].length;
    for (let i = 0; i < fPieza; i++) {
      for (let j = 0; j < cPieza; j++) {
        if (tetro.pieza[i][j] !== 0) {
          const filaTablero = tetro.posicionPieza.row + i;
          const colTablero = tetro.posicionPieza.col + j;
          if (filaTablero >= 0 && filaTablero < this.FILAS && colTablero >= 0 && colTablero < this.COLUMNAS) {
            tableroFantasma[filaTablero][colTablero] = tetro.id;
          }
        }
      }
    }
    return tableroFantasma;
  }

  mostrarTablero(tablero: number[][]): void {
    let sb = '';
    for (let i = 0; i < tablero.length; i++) {
      sb += tablero[i].join(' ') + '\n';
    }
    alert(sb);
  }

  buscarMejorJugada(): MejorJugada | null {
    if (!this.piezaActual) {
      return null;
    }
    let mejorJugada: MejorJugada | null = null;
    let mejorScore = -Infinity;

    // Probar hasta 4 rotaciones (algunas piezas pueden tener menos estados distintos)
    for (let rot = 0; rot < 4; rot++) {
      let piezaRotada = this.piezaActual.clonar();
      let cantRotaciones = 0;
      for (let r = 0; r < rot; r++) {
        piezaRotada.rotar();
        cantRotaciones++;
      }

      const anchoPieza = piezaRotada.pieza[0].length;
      for (let col = -anchoPieza + 1; col < this.COLUMNAS; col++) {
        let piezaSimulada = piezaRotada.clonar();
        piezaSimulada.posicionPieza = new Posicion(0, col);

        if (this.colision(piezaSimulada, piezaSimulada.posicionPieza.row, piezaSimulada.posicionPieza.col)) {
          continue;
        }

        // Simula el "hard drop"
        while (!this.colision(piezaSimulada, piezaSimulada.posicionPieza.row + 1, piezaSimulada.posicionPieza.col)) {
          piezaSimulada.posicionPieza.row++;
        }

        let tableroSimulado = this.clonarTablero(this.tablero);
        tableroSimulado = this.fijarPiezaFantasma(tableroSimulado, piezaSimulada);

        const { score, huecos, altura, bumpiness } = this.evaluarTablero(tableroSimulado);

        if (score > mejorScore) {
          mejorScore = score;
          mejorJugada = {
            rotacion: cantRotaciones,
            columna: col,
            fila: piezaSimulada.posicionPieza.row,
            minHuecos: huecos,
            altura: altura,
            bumpiness: bumpiness
          };
        }
      }
    }
    return mejorJugada;
  }

  evaluarTablero(tableroSimulado: number[][]): { score: number, huecos: number, altura: number, bumpiness: number } {
    const huecos = this.contarHuecos(tableroSimulado);
    const alturaAgregada = this.calcularAlturaAgregada(tableroSimulado);
    const bumpiness = this.calcularBumpiness(tableroSimulado);

    // Función de evaluación (heurística)
    const score = -(huecos * 10 + alturaAgregada * 2 + bumpiness * 3);
    return { score, huecos, altura: alturaAgregada, bumpiness };
  }

  contarHuecos(tablero: number[][]): number {
    let huecos = 0;
    for (let j = 0; j < this.COLUMNAS; j++) {
      let bloqueEncontrado = false;
      for (let i = 0; i < this.FILAS; i++) {
        if (tablero[i][j] !== 0) {
          bloqueEncontrado = true;
        } else if (bloqueEncontrado) {
          huecos++;
        }
      }
    }
    return huecos;
  }

  calcularAlturaAgregada(tablero: number[][]): number {
    let alturaAgregada = 0;
    for (let j = 0; j < this.COLUMNAS; j++) {
      let alturaColumna = 0;
      for (let i = 0; i < this.FILAS; i++) {
        if (tablero[i][j] !== 0) {
          alturaColumna = this.FILAS - i;
          break;
        }
      }
      alturaAgregada += alturaColumna;
    }
    return alturaAgregada;
  }

  calcularBumpiness(tablero: number[][]): number {
    let alturas = new Array(this.COLUMNAS).fill(0);
    for (let j = 0; j < this.COLUMNAS; j++) {
      let alturaColumna = 0;
      for (let i = 0; i < this.FILAS; i++) {
        if (tablero[i][j] !== 0) {
          alturaColumna = this.FILAS - i;
          break;
        }
      }
      alturas[j] = alturaColumna;
    }
    let bumpiness = 0;
    for (let j = 0; j < this.COLUMNAS - 1; j++) {
      bumpiness += Math.abs(alturas[j] - alturas[j + 1]);
    }
    return bumpiness;
  }

  clonarTablero(tablero: number[][]): number[][] {
    return tablero.map(row => [...row]);
  }

  borrarLineasCompletas(): void {
    for (let i = this.FILAS - 1; i >= 0; i--) {
      let lineaCompleta = true;
      for (let j = 0; j < this.COLUMNAS; j++) {
        if (this.tablero[i][j] === 0) {
          lineaCompleta = false;
          break;
        }
      }
      if (lineaCompleta) {
        // Desplazar filas superiores hacia abajo
        for (let k = i; k > 0; k--) {
          for (let j = 0; j < this.COLUMNAS; j++) {
            this.tablero[k][j] = this.tablero[k - 1][j];
          }
        }
        // Limpia la fila superior
        for (let j = 0; j < this.COLUMNAS; j++) {
          this.tablero[0][j] = 0;
        }
        i++; // Revisa la misma fila de nuevo
      }
    }
  }

  // Dibuja el tablero y la pieza actual en el canvas
  draw(): void {
    if (!this.ctx) {
      return;
    }
    // Limpia el canvas
    this.ctx.clearRect(0, 0, this.COLUMNAS * this.tamCelda, this.FILAS * this.tamCelda);

    // Dibuja el tablero (bloques fijos)
    for (let i = 0; i < this.FILAS; i++) {
      for (let j = 0; j < this.COLUMNAS; j++) {
        const idCelda = this.tablero[i][j];
        this.ctx.fillStyle = idCelda === 0 ? 'black' : this.colores[idCelda];
        const x = j * this.tamCelda;
        const y = i * this.tamCelda;
        this.ctx.fillRect(x, y, this.tamCelda, this.tamCelda);
        this.ctx.strokeStyle = 'gray';
        this.ctx.strokeRect(x, y, this.tamCelda, this.tamCelda);
      }
    }

    // Dibuja la pieza actual
    if (this.piezaActual) {
      const pieza = this.piezaActual.pieza;
      const fPieza = pieza.length;
      const cPieza = pieza[0].length;
      for (let i = 0; i < fPieza; i++) {
        for (let j = 0; j < cPieza; j++) {
          if (pieza[i][j] !== 0) {
            const x = (this.piezaActual.posicionPieza.col + j) * this.tamCelda;
            const y = (this.piezaActual.posicionPieza.row + i) * this.tamCelda;
            this.ctx.fillStyle = this.colores[this.piezaActual.id];
            this.ctx.fillRect(x, y, this.tamCelda, this.tamCelda);
            this.ctx.strokeStyle = 'gray';
            this.ctx.strokeRect(x, y, this.tamCelda, this.tamCelda);
          }
        }
      }
    }
  }
}




// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-tetris',
// //   imports: [],
// //   templateUrl: './tetris.component.html',
// //   styleUrl: './tetris.component.css'
// // })
// // export class TetrisComponent {

// // }


// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-tetris',
// //   standalone: true,
// //   imports: [],
// //   templateUrl: './tetris.component.html',
// //   styleUrl: './tetris.component.css'
// // })

// // export class TetrisComponent {

// // }


// import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';

// // Clase auxiliar para representar la “mejor jugada”
// class MejorJugada {
//   rotacion!: number;
//   columna!: number;
//   fila!: number;
//   minHuecos!: number;
//   altura!: number;
//   bumpiness!: number;
// }

// class Tetromino {
//   pieza: number[][];
//   posicionPieza: Posicion = new Posicion(0, 0);
//   id: number;
//   colorPieza: string;

//   constructor(pieza: number[][], id: number, color: string) {
//     this.pieza = pieza;
//     this.id = id;
//     this.colorPieza = color;
//   }

//   clonar(): Tetromino {
//     const nuevaMatriz = this.clonarMatriz(this.pieza);
//     const clon = new Tetromino(nuevaMatriz, this.id, this.colorPieza);
//     clon.posicionPieza = new Posicion(this.posicionPieza.row, this.posicionPieza.col);
//     return clon;
//   }

//   private clonarMatriz(matriz: number[][]): number[][] {
//     return matriz.map(fila => [...fila]);
//   }

//   // Rota la pieza 90° en sentido horario
//   rotar(): void {
//     const f = this.pieza.length;
//     const c = this.pieza[0].length;
//     // Se crea una matriz rotada de dimensiones [c x f]
//     const rotada: number[][] = [];
//     for (let i = 0; i < c; i++) {
//       rotada[i] = new Array(f).fill(0);
//     }
//     for (let i = 0; i < f; i++) {
//       for (let j = 0; j < c; j++) {
//         rotada[j][f - 1 - i] = this.pieza[i][j];
//       }
//     }
//     this.pieza = this.clonarMatriz(rotada);
//   }
// }

// class Posicion {
//     row: number;
//     col: number;
  
//     constructor(row: number, col: number) {
//       this.row = row;
//       this.col = col;
//     }
//   }
  

// @Component({
//   selector: 'app-tetris',
//   standalone: true,
//   imports: [],
//   templateUrl: './tetris.component.html',
//   styleUrl: './tetris.component.scss'
// })

// export class TetrisComponent implements OnInit, AfterViewInit, OnDestroy {
//   readonly FILAS = 20;
//   readonly COLUMNAS = 10;
//   readonly tamCelda = 30;

//   tablero: number[][] = [];
//   piezaActual: Tetromino | null = null;
//   piezasPrototipo: Tetromino[] = [];
//   timer: any;
//   // Los índices 0..7 corresponden a: 0 (celda vacía), 1: Cyan, 2: Purple, 3: Yellow, 4: Orange, 5: Blue, 6: Green, 7: Red.
//   colores: string[] = ['black', 'cyan', 'purple', 'yellow', 'orange', 'blue', 'green', 'red'];

//   @ViewChild('tetrisCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
//   ctx!: CanvasRenderingContext2D;

//   constructor() { }

//   ngOnInit(): void {
//     this.initializeBoard();
//     this.inicializarPrototipos();
//     this.generarNuevaPieza();
//     // Emula el timer de Windows Forms con setInterval (50ms)
//     this.timer = setInterval(() => this.timerTick(), 50);
//   }

//   ngAfterViewInit(): void {
//     const canvas = this.canvasRef.nativeElement;
//     canvas.width = this.COLUMNAS * this.tamCelda;
//     canvas.height = this.FILAS * this.tamCelda;
//     this.ctx = canvas.getContext('2d')!;
//     this.draw();
//   }

//   ngOnDestroy(): void {
//     if (this.timer) {
//       clearInterval(this.timer);
//     }
//   }

//   // Escucha eventos de teclado a nivel de ventana (por ejemplo, la flecha hacia arriba para rotar)
//   @HostListener('window:keydown', ['$event'])
//   handleKeyDown(event: KeyboardEvent) {
//     switch(event.key) {
//       case 'ArrowUp':
//         this.rotarPieza();
//         break;
//       // Puedes agregar otros casos (izquierda, derecha, etc.) según necesites.
//     }
//     this.draw();
//   }

//   // Inicializa el tablero con FILAS x COLUMNAS celdas en 0 (vacío)
//   initializeBoard(): void {
//     this.tablero = Array.from({ length: this.FILAS }, () => Array(this.COLUMNAS).fill(0));
//   }

//   // Función auxiliar para clonar una matriz (evita modificar los prototipos)
//   cloneMatrix(matriz: number[][]): number[][] {
//     return matriz.map(row => [...row]);
//   }

//   // Inicializa los prototipos de tetrominos
//   inicializarPrototipos(): void {
//     this.piezasPrototipo = [];

//     // Pieza I (id 1, color Cyan)
//     const formaI: number[][] = [[1, 1, 1, 1]];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaI), 1, 'cyan'));

//     // Pieza T (id 2, color Purple)
//     const formaT: number[][] = [
//       [1, 1, 1],
//       [0, 1, 0],
//       [0, 0, 0]
//     ];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaT), 2, 'purple'));

//     // Pieza O (id 3, color Yellow)
//     const formaO: number[][] = [
//       [1, 1],
//       [1, 1]
//     ];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaO), 3, 'yellow'));

//     // Pieza L (id 4, color Orange)
//     const formaL: number[][] = [
//       [1, 0, 0],
//       [1, 0, 0],
//       [1, 1, 0]
//     ];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaL), 4, 'orange'));

//     // Pieza J (id 5, color Blue)
//     const formaJ: number[][] = [
//       [0, 1, 0],
//       [0, 1, 0],
//       [1, 1, 0]
//     ];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaJ), 5, 'blue'));

//     // Pieza S (id 6, color Green)
//     const formaS: number[][] = [
//       [0, 1, 1],
//       [1, 1, 0],
//       [0, 0, 0]
//     ];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaS), 6, 'green'));

//     // Pieza Z (id 7, color Red)
//     const formaZ: number[][] = [
//       [1, 1, 0],
//       [0, 1, 1],
//       [0, 0, 0]
//     ];
//     this.piezasPrototipo.push(new Tetromino(this.cloneMatrix(formaZ), 7, 'red'));
//   }

//   // Genera una nueva pieza a partir de un prototipo aleatorio y usa la función de "mejor jugada"
//   generarNuevaPieza(): void {
//     const indice = Math.floor(Math.random() * this.piezasPrototipo.length);
//     const prototipo = this.piezasPrototipo[indice];
//     // Clonamos la pieza para que sea independiente
//     this.piezaActual = new Tetromino(this.cloneMatrix(prototipo.pieza), prototipo.id, prototipo.colorPieza);
//     this.piezaActual.posicionPieza = new Posicion(0, 0);

//     const jugada = this.buscarMejorJugada();
//     if (jugada) {
//       // Aplicamos las rotaciones recomendadas
//       for (let r = 0; r < jugada.rotacion; r++) {
//         this.piezaActual.rotar();
//       }
//       // Posición inicial: fila 0 y en la columna recomendada
//       this.piezaActual.posicionPieza = new Posicion(0, jugada.columna);
//     }

//     // Si la nueva pieza colisiona inmediatamente, es “Game Over”
//     if (this.colision(this.piezaActual, this.piezaActual.posicionPieza.row, this.piezaActual.posicionPieza.col)) {
//       clearInterval(this.timer);
//       alert("¡Game Over!");
//       this.initializeBoard();
//       // Aquí podrías reiniciar el juego si lo deseas.
//       return;
//     }
//   }

//   // Verifica si al ubicar el tetromino en (nuevaFila, nuevaColumna) hay colisión
//   colision(tetromino: Tetromino, nuevaFila: number, nuevaColumna: number): boolean {
//     const pieza = tetromino.pieza;
//     const fPieza = pieza.length;
//     const cPieza = pieza[0].length;
//     for (let i = 0; i < fPieza; i++) {
//       for (let j = 0; j < cPieza; j++) {
//         if (pieza[i][j] !== 0) {
//           const filaTablero = nuevaFila + i;
//           const colTablero = nuevaColumna + j;
//           if (colTablero < 0 || colTablero >= this.COLUMNAS || filaTablero >= this.FILAS) return true;
//           if (filaTablero >= 0 && this.tablero[filaTablero][colTablero] !== 0) return true;
//         }
//       }
//     }
//     return false;
//   }

//   // Se ejecuta en cada "tick" del timer (cada 50ms)
//   timerTick(): void {
//     this.moverAbajo();
//   }

//   // Mueve la pieza actual hacia abajo, y si hay colisión la bloquea en el tablero
//   moverAbajo(): void {
//     if (
//       this.piezaActual &&
//       !this.colision(this.piezaActual, this.piezaActual.posicionPieza.row + 1, this.piezaActual.posicionPieza.col)
//     ) {
//       this.piezaActual.posicionPieza.row++;
//     } else {
//       this.bloquearPieza();
//     }
//     this.draw();
//   }

//   // Bloquea la pieza actual en el tablero, borra líneas completas y genera una nueva pieza
//   bloquearPieza(): void {
//     if (!this.piezaActual) {
//       return;
//     }
//     const pieza = this.piezaActual.pieza;
//     const fPieza = pieza.length;
//     const cPieza = pieza[0].length;
//     for (let i = 0; i < fPieza; i++) {
//       for (let j = 0; j < cPieza; j++) {
//         if (pieza[i][j] !== 0) {
//           const filaTablero = this.piezaActual.posicionPieza.row + i;
//           const colTablero = this.piezaActual.posicionPieza.col + j;
//           if (filaTablero >= 0 && filaTablero < this.FILAS && colTablero >= 0 && colTablero < this.COLUMNAS) {
//             this.tablero[filaTablero][colTablero] = this.piezaActual.id;
//           }
//         }
//       }
//     }
//     this.borrarLineasCompletas();
//     this.generarNuevaPieza();
//   }

//   // Rota la pieza actual; si la rotación genera colisión, se revierte
//   rotarPieza(): void {
//     if (!this.piezaActual) {
//       return;
//     }
//     const formaAnterior = this.cloneMatrix(this.piezaActual.pieza);
//     this.piezaActual.rotar();
//     if (this.colision(this.piezaActual, this.piezaActual.posicionPieza.row, this.piezaActual.posicionPieza.col)) {
//       // Revierte la rotación
//       this.piezaActual.pieza = formaAnterior;
//     }
//   }

//   // Métodos para el "juega solo" (simulación de la mejor jugada)
//   fijarPiezaFantasma(tableroFantasma: number[][], tetro: Tetromino): number[][] {
//     const fPieza = tetro.pieza.length;
//     const cPieza = tetro.pieza[0].length;
//     for (let i = 0; i < fPieza; i++) {
//       for (let j = 0; j < cPieza; j++) {
//         if (tetro.pieza[i][j] !== 0) {
//           const filaTablero = tetro.posicionPieza.row + i;
//           const colTablero = tetro.posicionPieza.col + j;
//           if (filaTablero >= 0 && filaTablero < this.FILAS && colTablero >= 0 && colTablero < this.COLUMNAS) {
//             tableroFantasma[filaTablero][colTablero] = tetro.id;
//           }
//         }
//       }
//     }
//     return tableroFantasma;
//   }

//   mostrarTablero(tablero: number[][]): void {
//     let sb = '';
//     for (let i = 0; i < tablero.length; i++) {
//       sb += tablero[i].join(' ') + '\n';
//     }
//     alert(sb);
//   }

//   buscarMejorJugada(): MejorJugada | null {
//     if (!this.piezaActual) {
//       return null;
//     }
//     let mejorJugada: MejorJugada | null = null;
//     let mejorScore = -Infinity;

//     // Probar hasta 4 rotaciones (algunas piezas pueden tener menos estados distintos)
//     for (let rot = 0; rot < 4; rot++) {
//       let piezaRotada = this.piezaActual.clonar();
//       let cantRotaciones = 0;
//       for (let r = 0; r < rot; r++) {
//         piezaRotada.rotar();
//         cantRotaciones++;
//       }

//       const anchoPieza = piezaRotada.pieza[0].length;
//       for (let col = -anchoPieza + 1; col < this.COLUMNAS; col++) {
//         let piezaSimulada = piezaRotada.clonar();
//         piezaSimulada.posicionPieza = new Posicion(0, col);

//         if (this.colision(piezaSimulada, piezaSimulada.posicionPieza.row, piezaSimulada.posicionPieza.col)) {
//           continue;
//         }

//         // Simula el "hard drop"
//         while (!this.colision(piezaSimulada, piezaSimulada.posicionPieza.row + 1, piezaSimulada.posicionPieza.col)) {
//           piezaSimulada.posicionPieza.row++;
//         }

//         let tableroSimulado = this.clonarTablero(this.tablero);
//         tableroSimulado = this.fijarPiezaFantasma(tableroSimulado, piezaSimulada);

//         const { score, huecos, altura, bumpiness } = this.evaluarTablero(tableroSimulado);

//         if (score > mejorScore) {
//           mejorScore = score;
//           mejorJugada = {
//             rotacion: cantRotaciones,
//             columna: col,
//             fila: piezaSimulada.posicionPieza.row,
//             minHuecos: huecos,
//             altura: altura,
//             bumpiness: bumpiness
//           };
//         }
//       }
//     }
//     return mejorJugada;
//   }

//   evaluarTablero(tableroSimulado: number[][]): { score: number, huecos: number, altura: number, bumpiness: number } {
//     const huecos = this.contarHuecos(tableroSimulado);
//     const alturaAgregada = this.calcularAlturaAgregada(tableroSimulado);
//     const bumpiness = this.calcularBumpiness(tableroSimulado);

//     // Función de evaluación (heurística)
//     const score = -(huecos * 10 + alturaAgregada * 2 + bumpiness * 3);
//     return { score, huecos, altura: alturaAgregada, bumpiness };
//   }

//   contarHuecos(tablero: number[][]): number {
//     let huecos = 0;
//     for (let j = 0; j < this.COLUMNAS; j++) {
//       let bloqueEncontrado = false;
//       for (let i = 0; i < this.FILAS; i++) {
//         if (tablero[i][j] !== 0) {
//           bloqueEncontrado = true;
//         } else if (bloqueEncontrado) {
//           huecos++;
//         }
//       }
//     }
//     return huecos;
//   }

//   calcularAlturaAgregada(tablero: number[][]): number {
//     let alturaAgregada = 0;
//     for (let j = 0; j < this.COLUMNAS; j++) {
//       let alturaColumna = 0;
//       for (let i = 0; i < this.FILAS; i++) {
//         if (tablero[i][j] !== 0) {
//           alturaColumna = this.FILAS - i;
//           break;
//         }
//       }
//       alturaAgregada += alturaColumna;
//     }
//     return alturaAgregada;
//   }

//   calcularBumpiness(tablero: number[][]): number {
//     let alturas = new Array(this.COLUMNAS).fill(0);
//     for (let j = 0; j < this.COLUMNAS; j++) {
//       let alturaColumna = 0;
//       for (let i = 0; i < this.FILAS; i++) {
//         if (tablero[i][j] !== 0) {
//           alturaColumna = this.FILAS - i;
//           break;
//         }
//       }
//       alturas[j] = alturaColumna;
//     }
//     let bumpiness = 0;
//     for (let j = 0; j < this.COLUMNAS - 1; j++) {
//       bumpiness += Math.abs(alturas[j] - alturas[j + 1]);
//     }
//     return bumpiness;
//   }

//   clonarTablero(tablero: number[][]): number[][] {
//     return tablero.map(row => [...row]);
//   }

//   borrarLineasCompletas(): void {
//     for (let i = this.FILAS - 1; i >= 0; i--) {
//       let lineaCompleta = true;
//       for (let j = 0; j < this.COLUMNAS; j++) {
//         if (this.tablero[i][j] === 0) {
//           lineaCompleta = false;
//           break;
//         }
//       }
//       if (lineaCompleta) {
//         // Desplazar filas superiores hacia abajo
//         for (let k = i; k > 0; k--) {
//           for (let j = 0; j < this.COLUMNAS; j++) {
//             this.tablero[k][j] = this.tablero[k - 1][j];
//           }
//         }
//         // Limpia la fila superior
//         for (let j = 0; j < this.COLUMNAS; j++) {
//           this.tablero[0][j] = 0;
//         }
//         i++; // Revisa la misma fila de nuevo
//       }
//     }
//   }

//   // Dibuja el tablero y la pieza actual en el canvas
//   draw(): void {
//     if (!this.ctx) {
//       return;
//     }
//     // Limpia el canvas
//     this.ctx.clearRect(0, 0, this.COLUMNAS * this.tamCelda, this.FILAS * this.tamCelda);

//     // Dibuja el tablero (bloques fijos)
//     for (let i = 0; i < this.FILAS; i++) {
//       for (let j = 0; j < this.COLUMNAS; j++) {
//         const idCelda = this.tablero[i][j];
//         this.ctx.fillStyle = idCelda === 0 ? 'black' : this.colores[idCelda];
//         const x = j * this.tamCelda;
//         const y = i * this.tamCelda;
//         this.ctx.fillRect(x, y, this.tamCelda, this.tamCelda);
//         this.ctx.strokeStyle = 'gray';
//         this.ctx.strokeRect(x, y, this.tamCelda, this.tamCelda);
//       }
//     }

//     // Dibuja la pieza actual
//     if (this.piezaActual) {
//       const pieza = this.piezaActual.pieza;
//       const fPieza = pieza.length;
//       const cPieza = pieza[0].length;
//       for (let i = 0; i < fPieza; i++) {
//         for (let j = 0; j < cPieza; j++) {
//           if (pieza[i][j] !== 0) {
//             const x = (this.piezaActual.posicionPieza.col + j) * this.tamCelda;
//             const y = (this.piezaActual.posicionPieza.row + i) * this.tamCelda;
//             this.ctx.fillStyle = this.colores[this.piezaActual.id];
//             this.ctx.fillRect(x, y, this.tamCelda, this.tamCelda);
//             this.ctx.strokeStyle = 'gray';
//             this.ctx.strokeRect(x, y, this.tamCelda, this.tamCelda);
//           }
//         }
//       }
//     }
//   }
// }
