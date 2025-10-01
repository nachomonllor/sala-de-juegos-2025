// preguntados-dbz.ts
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DragonBallService } from '../services/dragon-ball';
import { Pregunta } from './preguntados-dbz.model';

@Component({
  selector: 'app-preguntados-dbz',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './preguntados-dbz.html',
  styleUrls: ['./preguntados-dbz.css'], // <- plural para evitar problemas
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreguntadosDbzComponent {
  private readonly servicioDragonBall = inject(DragonBallService);

  // Estado reactivo (signals) en castellano
  cargando = signal<boolean>(true);
  pregunta = signal<Pregunta | null>(null);
  idSeleccionado = signal<number | null>(null);
  puntaje = signal<number>(0);
  totalPreguntas = signal<number>(0);

  // Derivados
  respondida = computed(() => this.idSeleccionado() !== null);
  esCorrecta = computed(() =>
    this.respondida() && this.idSeleccionado() === this.pregunta()?.correct.id
  );

  constructor() {
    this.siguientePregunta();

    // Si la respuesta es correcta, sumar al puntaje
    effect(() => {
      if (this.esCorrecta()) this.puntaje.update(p => p + 1);
    });
  }

  siguientePregunta(): void {
    this.cargando.set(true);
    this.idSeleccionado.set(null);

    // Mantengo el nombre del método del servicio para no romper nada
    this.servicioDragonBall.getRandomQuestion(4, 100).subscribe({
      next: q => {
        this.pregunta.set(q);
        // contar la pregunta mostrada una sola vez
        this.totalPreguntas.update(t => t + (this.respondida() ? 0 : 1));
        this.cargando.set(false);
      },
      error: _ => {
        this.cargando.set(false);
        this.pregunta.set(null);
      }
    });
  }

  elegir(id: number): void {
    if (this.respondida()) return; // no permitir cambiar
    this.idSeleccionado.set(id);
  }

  reiniciarPuntaje(): void {
    this.puntaje.set(0);
    this.totalPreguntas.set(0);
  }
}





// import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { DragonBallService } from '../services/dragon-ball';
// import { Question } from './preguntados-dbz.model';

// @Component({
//   selector: 'app-preguntados-dbz',
//   standalone: true,
//   imports: [CommonModule, HttpClientModule],
//   templateUrl: './preguntados-dbz.html',
//   styleUrl: './preguntados-dbz.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class PreguntadosDbzComponent {
//   private readonly api = inject(DragonBallService);

//   // Estado reactivo con signals
//   loading = signal<boolean>(true);
//   question = signal<Question | null>(null);
//   selectedId = signal<number | null>(null);
//   score = signal<number>(0);
//   total = signal<number>(0);

//   // Derivados
//   answered = computed(() => this.selectedId() !== null);
//   isCorrect = computed(() =>
//     this.answered() && this.selectedId() === this.question()?.correct.id
//   );

//   constructor() {
//     this.nextQuestion();
//     // Si la respuesta es correcta, sumar al score
//     effect(() => {
//       if (this.isCorrect()) this.score.update(s => s + 1);
//     });
//   }

//   nextQuestion(): void {
//     this.loading.set(true);
//     this.selectedId.set(null);
//     this.api.getRandomQuestion(4, 100).subscribe({
//       next: q => {
//         this.question.set(q);
//         this.total.update(t => t + (this.answered() ? 0 : 1)); // cuenta pregunta mostrada
//         this.loading.set(false);
//       },
//       error: _ => {
//         this.loading.set(false);
//         // Fallback simple: limpiar pregunta
//         this.question.set(null);
//       }
//     });
//   }

//   choose(id: number): void {
//     if (this.answered()) return; // no permitir cambiar
//     this.selectedId.set(id);
//   }

//   resetScore(): void {
//     this.score.set(0);
//     this.total.set(0);
//   }
// }


//-------------------------------------------

// import { Component } from '@angular/core';
// @Component({
//   selector: 'app-preguntados-dbz',
//   imports: [],
//   templateUrl: './preguntados-dbz.html',
//   styleUrl: './preguntados-dbz.css'
// })
// export class PreguntadosDbz {

// }