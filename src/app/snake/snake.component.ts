// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-snake',
//   imports: [],
//   templateUrl: './snake.component.html',
//   styleUrl: './snake.component.css'
// })
// export class SnakeComponent {

// }

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';

interface Coordenada {
  x: number;
  y: number;
}

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements OnInit, OnDestroy {
  
  gridSize = 20;
  snake: Coordenada[] = [];
  comida: Coordenada = { x: 0, y: 0 };
  
  direccion: Coordenada = { x: 0, y: -1 }; // Arranca yendo hacia arriba
  proximaDireccion: Coordenada = { x: 0, y: -1 };
  
  puntaje = 0;
  jugando = false;
  juegoTerminado = false;
  
  gameLoop: any;
  velocidadBase = 150; // Milisegundos por frame (menor = más rápido)

  constructor(private sb: SupabaseService) {}

  ngOnInit() {
    this.iniciarNivel();
  }

  ngOnDestroy() {
    this.detenerJuego();
  }

  iniciarNivel() {
    // La serpiente arranca en el medio, con 3 segmentos
    this.snake = [
      { x: 10, y: 10 }, // Cabeza
      { x: 10, y: 11 }, // Cuerpo
      { x: 10, y: 12 }  // Cola
    ];
    this.direccion = { x: 0, y: -1 };
    this.proximaDireccion = { x: 0, y: -1 };
    this.puntaje = 0;
    this.juegoTerminado = false;
    this.generarComida();
  }

  comenzar() {
    this.jugando = true;
    this.juegoTerminado = false;
    this.iniciarNivel();
    this.actualizarLoop();
  }

  detenerJuego() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.jugando = false;
  }

  actualizarLoop() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    // Aumentamos la velocidad ligeramente cada 50 puntos
    const velocidadActual = Math.max(50, this.velocidadBase - Math.floor(this.puntaje / 50) * 10);
    this.gameLoop = setInterval(() => this.tick(), velocidadActual);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.jugando) return;

    // Evitar que la serpiente de vuelta en U (colisionando consigo misma instantáneamente)
    if (event.key === 'ArrowUp' && this.direccion.y !== 1) {
      this.proximaDireccion = { x: 0, y: -1 };
    } else if (event.key === 'ArrowDown' && this.direccion.y !== -1) {
      this.proximaDireccion = { x: 0, y: 1 };
    } else if (event.key === 'ArrowLeft' && this.direccion.x !== 1) {
      this.proximaDireccion = { x: -1, y: 0 };
    } else if (event.key === 'ArrowRight' && this.direccion.x !== -1) {
      this.proximaDireccion = { x: 1, y: 0 };
    }

    // Prevenir el scroll de la página
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }

  tick() {
    this.direccion = { ...this.proximaDireccion };
    const nuevaCabeza = {
      x: this.snake[0].x + this.direccion.x,
      y: this.snake[0].y + this.direccion.y
    };

    // 1. Chequear colisiones con los bordes
    if (
      nuevaCabeza.x < 0 || nuevaCabeza.x >= this.gridSize ||
      nuevaCabeza.y < 0 || nuevaCabeza.y >= this.gridSize
    ) {
      this.finalizarPartida();
      return;
    }

    // 2. Chequear colisiones consigo misma
    if (this.snake.some(segmento => segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y)) {
      this.finalizarPartida();
      return;
    }

    // Movemos la serpiente (añadimos la nueva cabeza)
    this.snake.unshift(nuevaCabeza);

    // 3. Chequear si comió
    if (nuevaCabeza.x === this.comida.x && nuevaCabeza.y === this.comida.y) {
      this.puntaje += 10;
      this.generarComida();
      this.actualizarLoop(); // Actualizamos por si subió de nivel/velocidad
    } else {
      // Si no comió, removemos la cola para simular el movimiento
      this.snake.pop();
    }
  }

  generarComida() {
    let nuevaPosicion: Coordenada;
    let sobreSerpiente = true;
    
    // Generamos coordenadas al azar hasta que caiga en un lugar vacío
    while (sobreSerpiente) {
      nuevaPosicion = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize)
      };
      // eslint-disable-next-line no-loop-func
      sobreSerpiente = this.snake.some(s => s.x === nuevaPosicion.x && s.y === nuevaPosicion.y);
    }
    
    this.comida = nuevaPosicion!;
  }

  async finalizarPartida() {
    this.detenerJuego();
    this.juegoTerminado = true;

    Swal.fire({
      title: '¡Game Over!',
      text: `Conseguiste ${this.puntaje} puntos.`,
      icon: 'error',
      confirmButtonText: 'Guardar Puntaje'
    }).then(async (result) => {
      if (result.isConfirmed && this.puntaje > 0) {
        await this.sb.saveResult('snake', this.puntaje, { longitud: this.snake.length });
        Swal.fire('Guardado', 'Puntaje registrado en la base de datos', 'success');
      }
    });
  }

  // Helper para generar el array del tablero (solo para dibujarlo en HTML)
  get gridArray() {
    return Array(this.gridSize).fill(0).map((x, i) => i);
  }
}