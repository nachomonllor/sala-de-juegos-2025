// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-pacman',
//   imports: [],
//   templateUrl: './pacman.component.html',
//   styleUrl: './pacman.component.css'
// })
// export class PacmanComponent {

// }

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';

// Tipos de celdas en el mapa
const MURO = 1;
const PUNTO = 2;
const VACIO = 0;

@Component({
  selector: 'app-pacman',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './pacman.component.html',
  styleUrls: ['./pacman.component.scss']
})
export class PacmanComponent implements OnInit, OnDestroy {
  
  // Mapa simplificado 15x15 (1 = Muro, 2 = Punto, 0 = Vacío)
  mapaInicial = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,2,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  mapa: number[][] = [];
  
  // Estado de Pacman
  pacman = { x: 7, y: 11, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 };
  
  // Estado de los fantasmas (Blinky y Clyde para empezar)
  fantasmas = [
    { x: 6, y: 7, color: 'red', dirX: 1, dirY: 0 },
    { x: 8, y: 7, color: 'orange', dirX: -1, dirY: 0 }
  ];

  puntaje = 0;
  puntosTotales = 0;
  jugando = false;
  juegoTerminado = false;
  gameLoop: any;

  constructor(private sb: SupabaseService) {}

  ngOnInit() {
    this.iniciarNivel();
  }

  ngOnDestroy() {
    this.detenerJuego();
  }

  iniciarNivel() {
    // Clonamos el mapa para poder "comer" los puntos sin romper el original
    this.mapa = this.mapaInicial.map(row => [...row]);
    
    // Contamos cuántos puntos hay para saber cuándo ganamos
    this.puntosTotales = this.mapa.flat().filter(celda => celda === PUNTO).length;
    
    this.pacman = { x: 7, y: 11, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 };
    this.fantasmas = [
      { x: 6, y: 7, color: 'ghost-red', dirX: 1, dirY: 0 },
      { x: 8, y: 7, color: 'ghost-orange', dirX: -1, dirY: 0 }
    ];
    
    this.puntaje = 0;
    this.jugando = false;
    this.juegoTerminado = false;
  }

  comenzar() {
    this.jugando = true;
    this.pacman.dirX = -1; // Arranca moviéndose a la izquierda
    // Game loop de 200ms (velocidad del juego)
    this.gameLoop = setInterval(() => this.tick(), 200);
  }

  detenerJuego() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.jugando = false;
  }

  // Escuchamos el teclado para mover a Pacman
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.jugando) return;
    
    // Guardamos la "próxima" dirección deseada. 
    // Pacman doblará cuando pueda.
    if (event.key === 'ArrowUp') { this.pacman.nextDirX = 0; this.pacman.nextDirY = -1; }
    if (event.key === 'ArrowDown') { this.pacman.nextDirX = 0; this.pacman.nextDirY = 1; }
    if (event.key === 'ArrowLeft') { this.pacman.nextDirX = -1; this.pacman.nextDirY = 0; }
    if (event.key === 'ArrowRight') { this.pacman.nextDirX = 1; this.pacman.nextDirY = 0; }
    
    // Prevenir el scroll de la página al jugar
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }

  tick() {
    this.moverPacman();
    this.moverFantasmas();
    this.chequearColisiones();
  }

  moverPacman() {
    // Intentamos doblar hacia la próxima dirección si no hay muro
    let tryX = this.pacman.x + this.pacman.nextDirX;
    let tryY = this.pacman.y + this.pacman.nextDirY;
    
    // Teletransportación en los túneles laterales
    if (tryX < 0) tryX = this.mapa[0].length - 1;
    if (tryX >= this.mapa[0].length) tryX = 0;

    if (this.mapa[tryY] && this.mapa[tryY][tryX] !== MURO) {
      this.pacman.dirX = this.pacman.nextDirX;
      this.pacman.dirY = this.pacman.nextDirY;
    }

    // Nos movemos en la dirección actual si no hay muro
    let newX = this.pacman.x + this.pacman.dirX;
    let newY = this.pacman.y + this.pacman.dirY;

    if (newX < 0) newX = this.mapa[0].length - 1;
    if (newX >= this.mapa[0].length) newX = 0;

    if (this.mapa[newY] && this.mapa[newY][newX] !== MURO) {
      this.pacman.x = newX;
      this.pacman.y = newY;
    }

    // Comer punto
    if (this.mapa[this.pacman.y][this.pacman.x] === PUNTO) {
      this.mapa[this.pacman.y][this.pacman.x] = VACIO;
      this.puntaje += 10;
      this.puntosTotales--;

      if (this.puntosTotales === 0) {
        this.finalizarPartida(true);
      }
    }
  }

  moverFantasmas() {
    // IA Básica: Movimiento aleatorio en intersecciones
    const direcciones = [ {x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0} ];

    this.fantasmas.forEach(fantasma => {
      let newX = fantasma.x + fantasma.dirX;
      let newY = fantasma.y + fantasma.dirY;

      // Si choca contra un muro, elige una nueva dirección al azar
      if (!this.mapa[newY] || this.mapa[newY][newX] === MURO) {
        let opcionesValidas = direcciones.filter(d => {
          let tx = fantasma.x + d.x;
          let ty = fantasma.y + d.y;
          return this.mapa[ty] && this.mapa[ty][tx] !== MURO;
        });

        if (opcionesValidas.length > 0) {
          let eleccion = opcionesValidas[Math.floor(Math.random() * opcionesValidas.length)];
          fantasma.dirX = eleccion.x;
          fantasma.dirY = eleccion.y;
        }
      } else {
        fantasma.x = newX;
        fantasma.y = newY;
      }
    });
  }

  chequearColisiones() {
    const choco = this.fantasmas.some(f => f.x === this.pacman.x && f.y === this.pacman.y);
    if (choco) {
      this.finalizarPartida(false);
    }
  }

  async finalizarPartida(victoria: boolean) {
    this.detenerJuego();
    this.juegoTerminado = true;

    const titulo = victoria ? '¡Nivel Limpio!' : '¡Te atraparon!';
    const icono = victoria ? 'success' : 'error';

    Swal.fire({
      title: titulo,
      text: `Puntaje final: ${this.puntaje}`,
      icon: icono,
      confirmButtonText: 'Guardar y Salir'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.sb.saveResult('pacman', this.puntaje, { victoria });
        Swal.fire('Guardado', 'Puntaje registrado.', 'success');
      }
    });
  }

  // Funciones auxiliares para la vista
  esMuro(y: number, x: number) { return this.mapa[y][x] === MURO; }
  esPunto(y: number, x: number) { return this.mapa[y][x] === PUNTO; }
  esPacman(y: number, x: number) { return this.pacman.y === y && this.pacman.x === x; }
  obtenerFantasma(y: number, x: number) { return this.fantasmas.find(f => f.y === y && f.x === x); }
  
  // Para rotar la boca de Pacman según hacia donde va
  getRotacionPacman() {
    if (this.pacman.dirX === 1) return 'rotate(0deg)';
    if (this.pacman.dirX === -1) return 'rotate(180deg)';
    if (this.pacman.dirY === 1) return 'rotate(90deg)';
    if (this.pacman.dirY === -1) return 'rotate(-90deg)';
    return 'rotate(0deg)';
  }
}