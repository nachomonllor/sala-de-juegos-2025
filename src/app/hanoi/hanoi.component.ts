// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-hanoi',
//   imports: [],
//   templateUrl: './hanoi.component.html',
//   styleUrl: './hanoi.component.css'
// })
// export class HanoiComponent {

// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-hanoi',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './hanoi.component.html',
  styleUrls: ['./hanoi.component.scss']
})
export class HanoiComponent implements OnInit {
  
  // Representa los 3 pilares. Cada número es el tamaño de un disco.
  torres: number[][] = [[], [], []];
  
  discosTotal = 5; // Dificultad por defecto
  movimientos = 0;
  
  // Índice del pilar seleccionado
  torreSeleccionada: number | null = null;
  juegoTerminado = false;

  constructor(private sb: SupabaseService) {}

  ngOnInit() {
    this.iniciarJuego(this.discosTotal);
  }

  iniciarJuego(cantidadDiscos: number) {
    this.discosTotal = cantidadDiscos;
    this.movimientos = 0;
    this.juegoTerminado = false;
    this.torreSeleccionada = null;

    // Vaciamos las torres
    this.torres = [[], [], []];

    // Llenamos el primer pilar (el más grande abajo, ej: 5, 4, 3, 2, 1)
    for (let i = this.discosTotal; i > 0; i--) {
      this.torres[0].push(i);
    }
  }

  seleccionarTorre(index: number) {
    if (this.juegoTerminado) return;

    // Si no hay nada seleccionado, elegimos la torre si es que tiene discos
    if (this.torreSeleccionada === null) {
      if (this.torres[index].length > 0) {
        this.torreSeleccionada = index;
      }
      return;
    }

    // Si volvemos a tocar la misma torre, la deseleccionamos
    if (this.torreSeleccionada === index) {
      this.torreSeleccionada = null;
      return;
    }

    // Intentamos realizar el movimiento
    this.intentarMover(this.torreSeleccionada, index);
  }

  intentarMover(origen: number, destino: number) {
    const torreOrigen = this.torres[origen];
    const torreDestino = this.torres[destino];

    const discoAMover = torreOrigen[torreOrigen.length - 1];
    const discoDestinoTop = torreDestino.length > 0 ? torreDestino[torreDestino.length - 1] : null;

    // REGLA DE ORO DE HANÓI: El destino debe estar vacío, o el disco superior debe ser más grande
    if (discoDestinoTop === null || discoDestinoTop > discoAMover) {
      torreOrigen.pop();
      torreDestino.push(discoAMover);
      this.movimientos++;
      this.verificarVictoria();
    }

    // Limpiamos la selección después de cada intento
    this.torreSeleccionada = null;
  }

  verificarVictoria() {
    // Si la torre del medio o la de la derecha tienen todos los discos, ganaste
    if (this.torres[1].length === this.discosTotal || this.torres[2].length === this.discosTotal) {
      this.juegoTerminado = true;
      
      // Calculamos los movimientos ideales (2^n - 1) para dar un mejor puntaje
      const movimientosIdeales = Math.pow(2, this.discosTotal) - 1;
      
      Swal.fire({
        title: '¡Resolución Perfecta!',
        text: `Lo lograste en ${this.movimientos} movimientos. (El mínimo posible era ${movimientosIdeales})`,
        icon: 'success',
        confirmButtonText: 'Guardar Puntaje'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Penalidad por movimientos extra
          const penalidad = Math.max(0, this.movimientos - movimientosIdeales);
          const puntajeBase = this.discosTotal * 20; // Más discos = más puntos base
          const puntajeFinal = Math.max(10, puntajeBase - (penalidad * 2));

          await this.sb.saveResult('hanoi', puntajeFinal, { 
            movimientos: this.movimientos, 
            dificultad: `${this.discosTotal} discos` 
          });
          Swal.fire('Guardado', 'Tu intelecto quedó registrado.', 'success');
        }
      });
    }
  }

  // Generador dinámico de clases CSS para pintar los anillos de distintos colores
  getColorClase(tamanio: number): string {
    const colores = ['neon-blue', 'neon-pink', 'neon-green', 'neon-yellow', 'neon-orange', 'neon-purple'];
    return colores[(tamanio - 1) % colores.length];
  }
}