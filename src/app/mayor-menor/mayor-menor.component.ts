import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScoreService } from '../services/score.service';
import { pointsMayorMenor } from '../models/score-utils';

export interface Carta {
  palo: 'oro' | 'espada' | 'copa' | 'basto';
  valor: number;     // 1–7, 10–12
  etiqueta: string;  // '1'..'7', '10', '11', '12'
}

type Adivinanza = 'mayor' | 'menor' | 'igual';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.css']
})
export class MayorMenorComponent implements OnInit {

  /** Jerarquía de palos: oro > espada > copa > basto */
  private jerarquiaPalo: Record<Carta['palo'], number> = {
    basto: 1,
    copa: 2,
    espada: 3,
    oro: 4,
  };

  mazo: Carta[] = [];
  cartaActual!: Carta;
  cartaSiguiente!: Carta;

  puntaje = 0;
  vidas = 3;
  mejorPuntaje = 0;
  juegoTerminado = false;
  nuevoRecord = false;

  t0 = performance.now();
  rachaMax = 0;

  // NUEVO: llevar la racha actual y un guard para el save
  private rachaActual = 0;           // NUEVO
  private scoreGuardado = false;     // NUEVO

  //----------------------------------------------------------------
  constructor(private score: ScoreService) { }

  ngOnInit() {
    // Migración de récord guardado (para no perder el valor anterior)
    const legacy = localStorage.getItem('bestScore');
    const actual = localStorage.getItem('mejorPuntaje');

    if (actual !== null) {
      this.mejorPuntaje = Number(actual);
    } else if (legacy !== null) {
      this.mejorPuntaje = Number(legacy);
      localStorage.setItem('mejorPuntaje', this.mejorPuntaje.toString());
    } else {
      this.mejorPuntaje = 0;
    }

    this.iniciarJuego();
  }

  //   iniciarJuego() {
  //   this.juegoTerminado = false;
  //   this.puntaje = 0;
  //   this.vidas = 3;
  //   this.construirMazo();
  //   this.barajarMazo();

  //   this.cartaActual = this.robarCarta();
  //   this.cartaSiguiente = this.robarCarta();

  //   console.log(`Carta actual: ${this.cartaActual.etiqueta} de ${this.cartaActual.palo}`);
  //   console.log(`Próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);
  // }

  iniciarJuego() {
    this.juegoTerminado = false;
    this.scoreGuardado = false;     // NUEVO
    this.puntaje = 0;
    this.vidas = 3;
    this.rachaActual = 0;           // NUEVO
    this.rachaMax = 0;              // NUEVO
    this.t0 = performance.now();    // NUEVO

    this.construirMazo();
    this.barajarMazo();

    this.cartaActual = this.robarCarta();
    this.cartaSiguiente = this.robarCarta();

    console.log(`Carta actual: ${this.cartaActual.etiqueta} de ${this.cartaActual.palo}`);
    console.log(`Próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);
  }

  hacerAdivinanza(opcion: Adivinanza) {
    if (this.juegoTerminado) return; // antes llamaba a finalizarJuego(); evitamos doble save

    const valAct = this.cartaActual.valor;
    const valSig = this.cartaSiguiente.valor;
    let acierto = false;

    if (opcion === 'mayor') {
      if (valSig > valAct) acierto = true;
      else if (valSig === valAct && this.jerarquiaPalo[this.cartaSiguiente.palo] > this.jerarquiaPalo[this.cartaActual.palo]) acierto = true;
    } else if (opcion === 'menor') {
      if (valSig < valAct) acierto = true;
      else if (valSig === valAct && this.jerarquiaPalo[this.cartaSiguiente.palo] < this.jerarquiaPalo[this.cartaActual.palo]) acierto = true;
    } else { // igual
      if (valSig === valAct && this.cartaSiguiente.palo === this.cartaActual.palo) acierto = true;
    }

    // Avance de cartas
    this.cartaActual = this.cartaSiguiente;
    if (this.mazo.length > 0) {
      this.cartaSiguiente = this.robarCarta();
    }

    // Puntaje/Vidas/Racha
    if (acierto) {
      this.puntaje++;
      this.rachaActual++;                      // NUEVO
      if (this.rachaActual > this.rachaMax) {  // NUEVO
        this.rachaMax = this.rachaActual;      // NUEVO
      }
    } else {
      this.rachaActual = 0;                    // NUEVO
      this.vidas--;
      if (this.vidas <= 0) this.finalizarJuego();  // ya lo tenías
    }

    // NUEVO: si se agotaron las cartas, terminar el juego
    if (!this.juegoTerminado && this.mazo.length === 0) {
      this.finalizarJuego();
    }
  }

  finalizarJuego() {
    this.juegoTerminado = true;
    this.nuevoRecord = this.puntaje > this.mejorPuntaje;

    if (this.nuevoRecord) {
      this.mejorPuntaje = this.puntaje;
      localStorage.setItem('mejorPuntaje', this.mejorPuntaje.toString());
      localStorage.setItem('bestScore', this.mejorPuntaje.toString()); // compat
    }

    // PERSISTIR PUNTAJE (solo una vez)
    if (!this.scoreGuardado) {
      this.terminar();               // llama a ScoreService.recordScore(...)
      this.scoreGuardado = true;
    }
  }

  terminar() {
    const duracionSec = Math.round((performance.now() - this.t0) / 1000);
    const pts = pointsMayorMenor({ rachaMax: this.rachaMax, duracionSec });
    this.score.recordScore({
      gameCode: 'mayor_menor',
      points: pts,
      durationSec: duracionSec,
      metaJson: { rachaMax: this.rachaMax }
    }).catch(console.error);
  }

  construirMazo() {
    this.mazo = [];
    const palos: Carta['palo'][] = ['oro', 'espada', 'copa', 'basto'];
    const definiciones = [
      { valor: 1, etiqueta: '1' },
      { valor: 2, etiqueta: '2' },
      { valor: 3, etiqueta: '3' },
      { valor: 4, etiqueta: '4' },
      { valor: 5, etiqueta: '5' },
      { valor: 6, etiqueta: '6' },
      { valor: 7, etiqueta: '7' },
      { valor: 10, etiqueta: '10' },
      { valor: 11, etiqueta: '11' },
      { valor: 12, etiqueta: '12' },
    ];

    for (const palo of palos) {
      for (const def of definiciones) {
        this.mazo.push({ palo, valor: def.valor, etiqueta: def.etiqueta });
      }
    }
  }

  barajarMazo() {
    for (let i = this.mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.mazo[i], this.mazo[j]] = [this.mazo[j], this.mazo[i]];
    }
  }

  robarCarta(): Carta {
    const carta = this.mazo.pop();
    if (!carta) throw new Error('No quedan más cartas');
    return carta;
  }

  obtenerImagenCarta(carta: Carta): string {
    // Mantengo la convención de nombres y extensión original
    return `assets/cards/${carta.etiqueta}_${carta.palo}.JPG`;
  }

}


// ----------------------------------------------------------------

// iniciarJuego() {
//   this.juegoTerminado = false;
//   this.puntaje = 0;
//   this.vidas = 3;
//   this.construirMazo();
//   this.barajarMazo();

//   this.cartaActual = this.robarCarta();
//   this.cartaSiguiente = this.robarCarta();

//   console.log(`Carta actual: ${this.cartaActual.etiqueta} de ${this.cartaActual.palo}`);
//   console.log(`Próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);
// }

// terminar() {
//   const duracionSec = Math.round((performance.now() - this.t0) / 1000);
//   const pts = pointsMayorMenor({ rachaMax: this.rachaMax, duracionSec });
//   this.score.recordScore({
//     gameCode: 'mayor_menor',
//     points: pts,
//     durationSec: duracionSec,
//     metaJson: { rachaMax: this.rachaMax }
//   }).catch(console.error);
// }

// hacerAdivinanza(opcion: Adivinanza) {
//   if (this.juegoTerminado) {
//     this.finalizarJuego();
//     return;
//   }

//   console.log(`Carta actual: ${this.cartaActual.etiqueta} de ${this.cartaActual.palo}`);
//   console.log(`Próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);

//   const valAct = this.cartaActual.valor;
//   const valSig = this.cartaSiguiente.valor;
//   let acierto = false;

//   if (opcion === 'mayor') {
//     if (valSig > valAct) acierto = true;
//     else if (valSig === valAct && this.jerarquiaPalo[this.cartaSiguiente.palo] > this.jerarquiaPalo[this.cartaActual.palo]) {
//       acierto = true;
//     }
//   } else if (opcion === 'menor') {
//     if (valSig < valAct) acierto = true;
//     else if (valSig === valAct && this.jerarquiaPalo[this.cartaSiguiente.palo] < this.jerarquiaPalo[this.cartaActual.palo]) {
//       acierto = true;
//     }
//   } else { // 'igual'
//     if (valSig === valAct && this.cartaSiguiente.palo === this.cartaActual.palo) {
//       acierto = true;
//     }
//   }

//   // Avance de cartas
//   this.cartaActual = this.cartaSiguiente;
//   if (this.mazo.length > 0) {
//     this.cartaSiguiente = this.robarCarta();
//   }

//   // Puntaje/Vidas
//   if (acierto) {
//     this.puntaje++;
//   } else {
//     this.vidas--;
//     if (this.vidas <= 0) this.finalizarJuego();
//   }

//   if (!this.juegoTerminado && this.mazo.length > 0) {
//     console.log(`Nueva próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);
//   }
// }

// finalizarJuego() {
//   this.juegoTerminado = true;
//   this.nuevoRecord = this.puntaje > this.mejorPuntaje;

//   if (this.nuevoRecord) {
//     this.mejorPuntaje = this.puntaje;
//     localStorage.setItem('mejorPuntaje', this.mejorPuntaje.toString());
//     localStorage.setItem('bestScore', this.mejorPuntaje.toString()); // compat
//   }
// }