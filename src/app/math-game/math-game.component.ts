import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import Swal from 'sweetalert2';
import { SupabaseService } from '../services/supabase.service';


interface PreguntaMatematica {
  texto: string;
  opciones: any[];
  respuestaCorrecta: any;
}

@Component({
  selector: 'app-math-game',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './math-game.component.html',
  styleUrls: ['./math-game.component.scss']
})
export class MathGameComponent implements OnInit, OnDestroy {
  jugando = false;
  puntaje = 0;
  tiempoRestante = 60;
  preguntaActual!: PreguntaMatematica;

  private timer: any;

  constructor(private sb: SupabaseService) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.detenerTimer();
  }

  iniciarJuego() {
    this.jugando = true;
    this.puntaje = 0;
    this.tiempoRestante = 60;
    this.generarPregunta();

    this.timer = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        this.finalizarJuego();
      }
    }, 1000);
  }

  detenerTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  generarPregunta() {
    const operadores = ['+', '-', '*', '/'];
    const operador = operadores[Math.floor(Math.random() * operadores.length)];
    let a = 0, b = 0;

    let respuestaCorrecta: number | string = 0;

    // Lógica para que los números tengan sentido según el operador
    switch (operador) {
      case '+':
        a = this.randomInt(1, 50);
        b = this.randomInt(1, 50);
        respuestaCorrecta = a + b;
        break;
      case '-':
        a = this.randomInt(20, 100);
        b = this.randomInt(1, a); // b siempre menor a 'a' para evitar negativos
        respuestaCorrecta = a - b;
        break;
      case '*':
        a = this.randomInt(2, 12);
        b = this.randomInt(2, 12);
        respuestaCorrecta = a * b;
        break;
      case '/':
        b = this.randomInt(2, 12);
        respuestaCorrecta = this.randomInt(2, 12);
        a = b * respuestaCorrecta; // a siempre será divisible por b
        break;
    }

    // Decidimos al azar si preguntamos por el resultado o por el operador
    const tipoPregunta = Math.random() > 0.3 ? 'resultado' : 'operador';
    let texto = '';
    let opciones: any[] = [];

    if (tipoPregunta === 'resultado') {
      texto = `${a} ${operador} ${b} = ?`;
      opciones = this.generarOpcionesNumericas(respuestaCorrecta);
    } else {
      texto = `${a} ? ${b} = ${respuestaCorrecta}`;
      opciones = ['+', '-', '*', '/'];
      respuestaCorrecta = operador;
    }

    this.preguntaActual = { texto, opciones, respuestaCorrecta };
  }

  generarOpcionesNumericas(correcta: number): number[] {
    const opciones = new Set<number>();
    opciones.add(correcta);

    while (opciones.size < 4) {
      // Generamos números engañosos cerca del resultado real
      const desvio = this.randomInt(-10, 10);
      const opcionFalsa = correcta + desvio;
      if (opcionFalsa !== correcta && opcionFalsa >= 0) {
        opciones.add(opcionFalsa);
      }
    }

    // Convertimos el Set a Array y lo mezclamos
    return Array.from(opciones).sort(() => Math.random() - 0.5);
  }

  responder(opcionSeleccionada: any) {
    if (opcionSeleccionada === this.preguntaActual.respuestaCorrecta) {
      this.puntaje += 10;
    } else {
      // Penalidad por error para que no toquen botones al azar
      this.puntaje = Math.max(0, this.puntaje - 5);
    }
    this.generarPregunta(); // Pasamos a la siguiente inmediatamente
  }

  async finalizarJuego() {
    this.jugando = false;
    this.detenerTimer();

    Swal.fire({
      title: '¡Tiempo agotado!',
      text: `Conseguiste ${this.puntaje} puntos.`,
      icon: 'info',
      confirmButtonText: 'Guardar Puntaje'
    }).then(async (result) => {
      if (result.isConfirmed && this.puntaje > 0) {
        try {
          // Cambiá 'calculo_rapido' por el código que uses en tu tabla de juegos
          await this.sb.saveResult('calculo_rapido', this.puntaje, { tiempo: 60 });
          Swal.fire('Guardado', 'Tu puntaje fue registrado', 'success');
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}