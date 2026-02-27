// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-water-sort',
//   imports: [],
//   templateUrl: './water-sort.component.html',
//   styleUrl: './water-sort.component.css'
// })
// export class WaterSortComponent {

// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-water-sort',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './water-sort.component.html',
  styleUrls: ['./water-sort.component.scss']
})
export class WaterSortComponent implements OnInit {
  
  // Capacidad máxima de cada tubo
  capacidadTubo = 4;
  
  // Estado del juego: Array de arrays de strings (colores)
  tubos: string[][] = [];
  
  // Índice del tubo actualmente seleccionado para verter
  tuboSeleccionado: number | null = null;
  
  movimientos = 0;
  juegoTerminado = false;

  // Paleta de colores neón (clases CSS)
  colores = ['neon-blue', 'neon-green', 'neon-pink', 'neon-yellow'];

  constructor(private sb: SupabaseService) {}

  ngOnInit(): void {
    this.iniciarNivel();
  }

  iniciarNivel() {
    this.movimientos = 0;
    this.juegoTerminado = false;
    this.tuboSeleccionado = null;

    // Nivel hardcodeado para empezar (la base de cada array es el fondo del tubo)
    this.tubos = [
      ['neon-blue', 'neon-pink', 'neon-green', 'neon-blue'],
      ['neon-pink', 'neon-green', 'neon-yellow', 'neon-pink'],
      ['neon-yellow', 'neon-blue', 'neon-yellow', 'neon-green'],
      [], // Tubo vacío
      []  // Tubo vacío
    ];
  }

  seleccionarTubo(index: number) {
    if (this.juegoTerminado) return;

    // Si no hay nada seleccionado, y el tubo tocado tiene líquido, lo seleccionamos
    if (this.tuboSeleccionado === null) {
      if (this.tubos[index].length > 0) {
        this.tuboSeleccionado = index;
      }
      return;
    }

    // Si tocamos el mismo tubo, lo deseleccionamos
    if (this.tuboSeleccionado === index) {
      this.tuboSeleccionado = null;
      return;
    }

    // Si tocamos un tubo distinto, intentamos verter el líquido
    this.intentarVerter(this.tuboSeleccionado, index);
  }

  intentarVerter(origen: number, destino: number) {
    const tuboOrigen = this.tubos[origen];
    const tuboDestino = this.tubos[destino];

    // No se puede verter si el destino está lleno
    if (tuboDestino.length >= this.capacidadTubo) {
      this.tuboSeleccionado = null;
      return;
    }

    const colorAVerter = tuboOrigen[tuboOrigen.length - 1];
    const colorDestinoTop = tuboDestino.length > 0 ? tuboDestino[tuboDestino.length - 1] : null;

    // Regla de oro: El destino debe estar vacío o el color superior debe coincidir
    if (colorDestinoTop === null || colorDestinoTop === colorAVerter) {
      
      // Calculamos cuánto líquido IGUAL hay en el tope del origen
      let cantidadAVerter = 0;
      for (let i = tuboOrigen.length - 1; i >= 0; i--) {
        if (tuboOrigen[i] === colorAVerter) cantidadAVerter++;
        else break;
      }

      // Espacio disponible en el destino
      const espacioDisponible = this.capacidadTubo - tuboDestino.length;
      
      // Vertemos la cantidad que entre (mínimo entre lo que hay y lo que entra)
      const liquidoARecibir = Math.min(cantidadAVerter, espacioDisponible);

      for (let i = 0; i < liquidoARecibir; i++) {
        tuboOrigen.pop();
        tuboDestino.push(colorAVerter);
      }

      this.movimientos++;
      this.verificarVictoria();
    }

    // Siempre limpiamos la selección después de un intento
    this.tuboSeleccionado = null;
  }

  verificarVictoria() {
    // Para ganar, todos los tubos deben estar vacíos o completamente llenos del mismo color
    const gano = this.tubos.every(tubo => {
      if (tubo.length === 0) return true;
      if (tubo.length !== this.capacidadTubo) return false;
      const primerColor = tubo[0];
      return tubo.every(color => color === primerColor);
    });

    if (gano) {
      this.juegoTerminado = true;
      Swal.fire({
        title: '¡Nivel Completado!',
        text: `Lo lograste en ${this.movimientos} movimientos.`,
        icon: 'success',
        confirmButtonText: 'Guardar Puntaje'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // El puntaje puede ser inversamente proporcional a los movimientos
          const puntaje = Math.max(10, 100 - this.movimientos); 
          await this.sb.saveResult('water_sort', puntaje, { movimientos: this.movimientos });
          Swal.fire('Guardado', 'Tu progreso ha sido registrado', 'success');
        }
      });
    }
  }
}