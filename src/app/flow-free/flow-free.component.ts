import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlowFreeSolver, Pair, Point } from './flowfree-solver';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-flow-free',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './flow-free.component.html',
  styleUrl: './flow-free.component.css'
})

export class FlowfreeComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // Dimensiones y configuración de la grilla
  cellSize: number = 30;
  gridRows: number = 15;
  gridCols: number = 15;

  // Estado del juego
  endpoints: Map<string, string> = new Map(); // Clave: "x,y" -> color (string)
  originalEndpoints: Map<string, string> = new Map();
  currentPath: Point[] = [];
  completedPaths: { path: Point[]; color: string }[] = [];
  drawing: boolean = false;
  currentPathColor: string = '';

  // Para el solver
  pairList: Pair[] = [];
  colorMapping: Map<number, string> = new Map();
  solverGrid: number[][] | null = null;
  showSolution: boolean = false;

  // Nivel (número de pares)
  currentPairsCount: number = 3;

  // Lista de colores disponibles
  availableColors: string[] = [
    'red', 'blue', 'green', 'orange', 'purple', 'yellow', 'brown',
    'cyan', 'magenta', 'lime', 'pink', 'teal', 'maroon', 'navy', 'olive'
  ];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.gridCols * this.cellSize;
    canvas.height = this.gridRows * this.cellSize;
    this.ctx = canvas.getContext('2d')!;
    this.attachCanvasEvents();
    this.generateRandomBoard();
    this.draw();
  }

  // Asigna los eventos del canvas
  attachCanvasEvents() {
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  // Obtiene las coordenadas de la celda a partir del evento del ratón
  getMousePos(e: MouseEvent): Point {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / this.cellSize),
      y: Math.floor((e.clientY - rect.top) / this.cellSize)
    };
  }

  onMouseDown(e: MouseEvent) {
    const cell = this.getMousePos(e);
    const cellKey = this.getCellKey(cell);
    if (!this.drawing && this.currentPath.length > 0 && this.isSamePoint(cell, this.currentPath[this.currentPath.length - 1])) {
      this.drawing = true;
      return;
    }
    if (this.endpoints.has(cellKey)) {
      this.drawing = true;
      this.currentPath = [];
      this.currentPath.push(cell);
      this.currentPathColor = this.endpoints.get(cellKey)!;
      this.showSolution = false;
      this.draw();
    }
  }

  onMouseMove(e: MouseEvent) {
    if (!this.drawing) return;
    const cell = this.getMousePos(e);
    if (cell.x < 0 || cell.x >= this.gridCols || cell.y < 0 || cell.y >= this.gridRows) {
      alert("Te saliste del tablero");
      this.currentPath = [];
      this.drawing = false;
      this.draw();
      return;
    }
    if (this.currentPath.length > 0) {
      const last = this.currentPath[this.currentPath.length - 1];
      if (this.isAdjacent(last, cell) && !this.containsPoint(this.currentPath, cell)) {
        if (this.isCellFreeForCurrentDrawing(cell)) {
          this.currentPath.push(cell);
          this.draw();
        } else {
          alert("Camino incorrecto");
          this.currentPath = [];
          this.drawing = false;
          this.draw();
        }
      }
    }
  }

  onMouseUp(e: MouseEvent) {
    if (!this.drawing) return;
    const cell = this.getMousePos(e);
    const cellKey = this.getCellKey(cell);
    // Verifica si se terminó correctamente el trazo en el mismo endpoint (y no es el de inicio)
    if (this.endpoints.has(cellKey) && this.endpoints.get(cellKey) === this.currentPathColor &&
       !this.isSamePoint(cell, this.currentPath[0])) {
         this.completedPaths.push({ path: [...this.currentPath], color: this.currentPathColor });
         // Remueve los endpoints completados
         const startKey = this.getCellKey(this.currentPath[0]);
         this.endpoints.delete(startKey);
         this.endpoints.delete(cellKey);
         this.currentPath = [];
         this.currentPathColor = '';
    }
    this.drawing = false;
    this.draw();

    // Si se completaron todos los endpoints, se sube de nivel
    if (this.endpoints.size === 0) {
      alert("Buen trabajo, conectaste todos los caminos");
      this.currentPairsCount++;
      alert(`Subiste al siguiente nivel: ${this.currentPairsCount} pares`);
      this.completedPaths = [];
      this.currentPath = [];
      this.drawing = false;
      this.currentPathColor = '';
      this.generateRandomBoard();
      this.draw();
    }
  }

  // Genera los endpoints y pares de forma aleatoria
  generateRandomBoard() {
    this.endpoints.clear();
    this.pairList = [];
    this.colorMapping.clear();
    const pairsCount = this.currentPairsCount;
    const usedPoints: Point[] = [];

    for (let i = 0; i < pairsCount; i++) {
      let start: Point;
      do {
        start = {
          x: Math.floor(Math.random() * this.gridCols),
          y: Math.floor(Math.random() * this.gridRows)
        };
      } while (this.pointExistsIn(start, usedPoints));
      usedPoints.push(start);

      let end: Point;
      do {
        end = {
          x: Math.floor(Math.random() * this.gridCols),
          y: Math.floor(Math.random() * this.gridRows)
        };
      } while (this.pointExistsIn(end, usedPoints) || this.isSamePoint(start, end));
      usedPoints.push(end);

      const colorID = i + 1;
      this.pairList.push({ start, end, colorID });
      const color = this.availableColors[i];
      this.endpoints.set(this.getCellKey(start), color);
      this.endpoints.set(this.getCellKey(end), color);
      this.colorMapping.set(colorID, color);
    }
    // Guarda una copia de los endpoints originales para el reset
    this.originalEndpoints = new Map(this.endpoints);
    this.showSolution = false;
  }

  // Helpers
  getCellKey(point: Point): string {
    return `${point.x},${point.y}`;
  }

  isSamePoint(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  pointExistsIn(point: Point, list: Point[]): boolean {
    return list.some(p => this.isSamePoint(p, point));
  }

  isAdjacent(a: Point, b: Point): boolean {
    return (Math.abs(a.x - b.x) === 1 && a.y === b.y) ||
           (Math.abs(a.y - b.y) === 1 && a.x === b.x);
  }

  containsPoint(list: Point[], point: Point): boolean {
    return list.some(p => this.isSamePoint(p, point));
  }

  isCellFreeForCurrentDrawing(cell: Point): boolean {
    // Si la celda está ocupada por un camino ya completado
    for (const pathObj of this.completedPaths) {
      if (this.containsPoint(pathObj.path, cell)) {
        return false;
      }
    }
    const key = this.getCellKey(cell);
    if (this.endpoints.has(key) && this.endpoints.get(key) !== this.currentPathColor) {
      return false;
    }
    return true;
  }

  // // Implementación dummy del solver. DEBES completar o integrar tu algoritmo de solución.
  // onResolverClick() {
  //   alert("Implementa el solver o integra un servicio que lo haga");
  //   // Como placeholder, no se muestra solución.
  //   this.showSolution = false;
  //   this.draw();
  // }

  onResolverClick() {
    const solver = new FlowFreeSolver(this.gridRows, this.gridCols);
    solver.requireFullFill = false; // o true si quieres forzar rellenar todo
    for (const p of this.pairList) {
      solver.addPair(p);
    }
    const solved = solver.solve();
    if (solved) {
      this.solverGrid = solver.grid;
      this.showSolution = true;
    } else {
      alert('No se encontró solución');
    }
    this.draw();
  }

  onRegenerateClick() {
    this.currentPairsCount = 3; // Reinicia el nivel
    this.generateRandomBoard();
    this.completedPaths = [];
    this.currentPath = [];
    this.drawing = false;
    this.currentPathColor = '';
    this.showSolution = false;
    this.draw();
  }

  onResetClick() {
    this.endpoints = new Map(this.originalEndpoints);
    this.completedPaths = [];
    this.currentPath = [];
    this.drawing = false;
    this.currentPathColor = '';
    this.showSolution = false;
    this.draw();
  }

  // Funciones de dibujo
  draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja la grilla
    for (let i = 0; i < this.gridCols; i++) {
      for (let j = 0; j < this.gridRows; j++) {
        this.ctx.strokeStyle = '#808080';
        this.ctx.strokeRect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
      }
    }
    if (this.showSolution && this.solverGrid) {
      // Aquí debes implementar el dibujo de la solución según los datos de solverGrid
    } else {
      // Dibuja endpoints
      this.endpoints.forEach((color, key) => {
        const parts = key.split(',').map(Number);
        const point: Point = { x: parts[0], y: parts[1] };
        this.drawCircleInCell(point, color);
      });
      // Dibuja caminos completados
      for (const pathObj of this.completedPaths) {
        this.drawPath(pathObj.path, pathObj.color);
      }
      // Dibuja el camino actual
      if (this.currentPath.length > 0) {
        this.drawPath(this.currentPath, this.currentPathColor);
      }
    }
  }

  drawCircleInCell(cell: Point, color: string) {
    const padding = 10;
    const x = cell.x * this.cellSize + padding;
    const y = cell.y * this.cellSize + padding;
    const size = this.cellSize - 2 * padding;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x + size / 2, y + size / 2, size / 2, size / 2, 0, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
  }

  drawPath(path: Point[], color: string) {
    if (path.length < 2) return;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const x = path[i].x * this.cellSize + this.cellSize / 2;
      const y = path[i].y * this.cellSize + this.cellSize / 2;
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
  }


  

}