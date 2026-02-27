// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-mastermind',
//   imports: [],
//   templateUrl: './mastermind.component.html',
//   styleUrl: './mastermind.component.css'
// })
// export class MastermindComponent {

// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';

interface Intento {
  adivinanza: string[];
  pistas: { exactos: number; parciales: number };
}

@Component({
  selector: 'app-mastermind',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './mastermind.component.html',
  styleUrls: ['./mastermind.component.scss']
})
export class MastermindComponent implements OnInit {
  
  // Paleta de colores neón
  coloresDisponibles = ['neon-blue', 'neon-pink', 'neon-green', 'neon-yellow', 'neon-orange', 'neon-purple'];
  
  codigoSecreto: string[] = [];
  intentosMaximos = 10;
  historialIntentos: Intento[] = [];
  intentoActual: string[] = [];
  
  juegoTerminado = false;
  victoria = false;

  constructor(private sb: SupabaseService) {}

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.historialIntentos = [];
    this.intentoActual = [];
    this.juegoTerminado = false;
    this.victoria = false;
    this.generarCodigoSecreto();
  }

  generarCodigoSecreto() {
    this.codigoSecreto = [];
    for (let i = 0; i < 4; i++) {
      const colorAlAzar = this.coloresDisponibles[Math.floor(Math.random() * this.coloresDisponibles.length)];
      this.codigoSecreto.push(colorAlAzar);
    }
    // console.log('Shh, secreto:', this.codigoSecreto); // Descomentar para hacer trampas testeando
  }

  agregarColor(color: string) {
    if (this.juegoTerminado || this.intentoActual.length >= 4) return;
    this.intentoActual.push(color);
  }

  removerColor(index: number) {
    if (this.juegoTerminado) return;
    this.intentoActual.splice(index, 1);
  }

  comprobarIntento() {
    if (this.intentoActual.length !== 4) return;

    const pistas = this.calcularPistas(this.intentoActual, this.codigoSecreto);
    
    this.historialIntentos.push({
      adivinanza: [...this.intentoActual],
      pistas: pistas
    });

    this.intentoActual = []; // Limpiamos para el próximo turno

    // Chequear fin de juego
    if (pistas.exactos === 4) {
      this.finalizarPartida(true);
    } else if (this.historialIntentos.length >= this.intentosMaximos) {
      this.finalizarPartida(false);
    }
  }

  calcularPistas(adivinanza: string[], secreto: string[]) {
    let exactos = 0;
    let parciales = 0;
    
    // Arrays para marcar qué posiciones ya procesamos y no contarlas doble
    const secretoUsado = [false, false, false, false];
    const adivinanzaUsada = [false, false, false, false];

    // PRIMERA PASADA: Buscar "Exactos" (Color y posición correcta)
    for (let i = 0; i < 4; i++) {
      if (adivinanza[i] === secreto[i]) {
        exactos++;
        secretoUsado[i] = true;
        adivinanzaUsada[i] = true;
      }
    }

    // SEGUNDA PASADA: Buscar "Parciales" (Color correcto, posición incorrecta)
    for (let i = 0; i < 4; i++) {
      if (!adivinanzaUsada[i]) {
        for (let j = 0; j < 4; j++) {
          if (!secretoUsado[j] && adivinanza[i] === secreto[j]) {
            parciales++;
            secretoUsado[j] = true;
            break; // Solo emparejamos este color parcial una vez
          }
        }
      }
    }

    return { exactos, parciales };
  }

  // Genera un array iterativo para dibujar los puntitos de las pistas en el HTML
  obtenerArrayPistas(exactos: number, parciales: number) {
    const pistas = [];
    for (let i = 0; i < exactos; i++) pistas.push('exacto');
    for (let i = 0; i < parciales; i++) pistas.push('parcial');
    // Rellenamos el resto con vacíos para mantener la grilla de 4
    while (pistas.length < 4) pistas.push('vacio');
    return pistas;
  }

  async finalizarPartida(gano: boolean) {
    this.juegoTerminado = true;
    this.victoria = gano;

    const titulo = gano ? '¡Sistema Hackeado!' : '¡Acceso Denegado!';
    const icono = gano ? 'success' : 'error';
    const puntos = gano ? Math.max(10, 100 - (this.historialIntentos.length * 5)) : 0;

    Swal.fire({
      title: titulo,
      html: `El código era:<br> 
             <div style="display:flex; justify-content:center; gap:10px; margin-top:15px;">
               ${this.codigoSecreto.map(c => `<div style="width:25px; height:25px; border-radius:50%; background:var(--${c}-color, ${this.getColorCode(c)})"></div>`).join('')}
             </div>`,
      icon: icono,
      confirmButtonText: gano ? 'Guardar Puntaje' : 'Intentar de nuevo'
    }).then(async (result) => {
      if (result.isConfirmed && gano) {
        await this.sb.saveResult('mastermind', puntos, { intentos: this.historialIntentos.length });
        Swal.fire('Guardado', 'Tu récord fue registrado.', 'success');
      } else if (!gano) {
        this.iniciarJuego();
      }
    });
  }

  // Helper para el cartel de SweetAlert
  getColorCode(clase: string) {
    const mapa: any = { 'neon-blue': '#00d2ff', 'neon-pink': '#ff00ff', 'neon-green': '#39ff14', 'neon-yellow': '#ffff00', 'neon-orange': '#ff8c00', 'neon-purple': '#8a2be2' };
    return mapa[clase] || 'gray';
  }
}