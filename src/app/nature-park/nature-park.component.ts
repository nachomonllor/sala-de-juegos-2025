// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-nature-park',
//   imports: [],
//   templateUrl: './nature-park.component.html',
//   styleUrl: './nature-park.component.css'
// })
// export class NatureParkComponent {

// }


import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';

const COLUMNAS = 8;
const FILAS = 14;
const COLORES = 5; // Cantidad de colores posibles
const VACIO = 0;

interface BloqueActivo {
  x: number;
  y: number; // Posición del bloque inferior
  colorArriba: number;
  colorAbajo: number;
}

@Component({
  selector: 'app-nature-park',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './nature-park.component.html',
  styleUrls: ['./nature-park.component.scss']
})
export class NatureParkComponent implements OnInit, OnDestroy {
  
  // Tablero: 0 es vacío, 1-5 son colores
  tablero: number[][] = [];
  
  piezaActiva: BloqueActivo | null = null;
  gameLoop: any;
  jugando = false;
  puntaje = 0;

  constructor(private sb: SupabaseService) {
    this.crearTableroVacio();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.detenerJuego();
  }

  crearTableroVacio() {
    this.tablero = Array(FILAS).fill(0).map(() => Array(COLUMNAS).fill(VACIO));
  }

  iniciarJuego() {
    this.crearTableroVacio();
    this.puntaje = 0;
    this.jugando = true;
    this.generarNuevaPieza();
    this.gameLoop = setInterval(() => this.tick(), 500); // Velocidad de caída
  }

  detenerJuego() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.jugando = false;
  }

  generarNuevaPieza() {
    this.piezaActiva = {
      x: Math.floor(COLUMNAS / 2),
      y: 1, // Empieza arriba
      colorArriba: Math.floor(Math.random() * COLORES) + 1,
      colorAbajo: Math.floor(Math.random() * COLORES) + 1
    };

    // Si al nacer ya choca, es Game Over
    if (this.tablero[this.piezaActiva.y][this.piezaActiva.x] !== VACIO || 
        this.tablero[this.piezaActiva.y - 1][this.piezaActiva.x] !== VACIO) {
      this.finalizarPartida();
    }
  }

  @HostListener('window:keydown', ['$event'])
  manejarTeclado(event: KeyboardEvent) {
    if (!this.jugando || !this.piezaActiva) return;

    if (event.key === 'ArrowLeft') this.moverPieza(-1, 0);
    if (event.key === 'ArrowRight') this.moverPieza(1, 0);
    if (event.key === 'ArrowDown') this.tick(); // Acelerar caída

    if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault(); // Evita el scroll
    }
  }

  moverPieza(dx: number, dy: number) {
    if (!this.piezaActiva) return;

    const nuevaX = this.piezaActiva.x + dx;
    const nuevaY = this.piezaActiva.y + dy;

    // Verificar límites y colisiones laterales/fondo
    if (nuevaX >= 0 && nuevaX < COLUMNAS && nuevaY < FILAS) {
      if (this.tablero[nuevaY][nuevaX] === VACIO && this.tablero[nuevaY - 1][nuevaX] === VACIO) {
        this.piezaActiva.x = nuevaX;
        this.piezaActiva.y = nuevaY;
        return true;
      }
    }
    return false;
  }

  tick() {
    if (!this.piezaActiva) return;

    // Intentar mover abajo
    const pudoBajar = this.moverPieza(0, 1);

    // Si no pudo bajar, se fija en el tablero
    if (!pudoBajar) {
      this.fijarPieza();
    }
  }

  fijarPieza() {
    if (!this.piezaActiva) return;

    this.tablero[this.piezaActiva.y][this.piezaActiva.x] = this.piezaActiva.colorAbajo;
    this.tablero[this.piezaActiva.y - 1][this.piezaActiva.x] = this.piezaActiva.colorArriba;
    
    this.piezaActiva = null;
    
    // Acá pausamos la caída para buscar coincidencias
    this.buscarCoincidencias();
  }

  buscarCoincidencias() {
    let bloquesAEliminar = new Set<string>();

    // Escaneamos todo el tablero
    for (let y = 0; y < FILAS; y++) {
      for (let x = 0; x < COLUMNAS; x++) {
        const color = this.tablero[y][x];
        if (color !== VACIO) {
          const conectados = this.obtenerConectados(x, y, color, new Set<string>());
          if (conectados.size >= 3) {
            conectados.forEach(coord => bloquesAEliminar.add(coord));
          }
        }
      }
    }

    if (bloquesAEliminar.size > 0) {
      // Eliminamos los bloques
      bloquesAEliminar.forEach(coord => {
        const [x, y] = coord.split(',').map(Number);
        this.tablero[y][x] = VACIO;
      });

      this.puntaje += bloquesAEliminar.size * 10;

      // TODO para el futuro: Hacer que los bloques flotantes caigan (Gravedad)
      // Por ahora, generamos la siguiente pieza directamente
      setTimeout(() => this.generarNuevaPieza(), 200);
    } else {
      this.generarNuevaPieza();
    }
  }

  // Algoritmo Flood Fill para encontrar bloques del mismo color pegados
  obtenerConectados(x: number, y: number, color: number, visitados: Set<string>): Set<string> {
    const coord = `${x},${y}`;
    if (x < 0 || x >= COLUMNAS || y < 0 || y >= FILAS || this.tablero[y][x] !== color || visitados.has(coord)) {
      return visitados;
    }

    visitados.add(coord);

    this.obtenerConectados(x + 1, y, color, visitados);
    this.obtenerConectados(x - 1, y, color, visitados);
    this.obtenerConectados(x, y + 1, color, visitados);
    this.obtenerConectados(x, y - 1, color, visitados);

    return visitados;
  }

  async finalizarPartida() {
    this.detenerJuego();
    Swal.fire({
      title: '¡Tablero Lleno!',
      text: `Conseguiste ${this.puntaje} puntos.`,
      icon: 'info',
      confirmButtonText: 'Guardar Puntaje'
    }).then(async (result) => {
      if (result.isConfirmed && this.puntaje > 0) {
        await this.sb.saveResult('nature_park', this.puntaje, {});
        Swal.fire('Guardado', 'Puntaje registrado.', 'success');
      }
    });
  }

  // Helpers para la vista HTML
  getClaseColor(valor: number): string {
    const clases = ['', 'color-rojo', 'color-azul', 'color-verde', 'color-amarillo', 'color-violeta'];
    return clases[valor] || '';
  }

  esPiezaActiva(x: number, y: number): number {
    if (!this.piezaActiva) return 0;
    if (this.piezaActiva.x === x && this.piezaActiva.y === y) return this.piezaActiva.colorAbajo;
    if (this.piezaActiva.x === x && this.piezaActiva.y - 1 === y) return this.piezaActiva.colorArriba;
    return 0;
  }
}