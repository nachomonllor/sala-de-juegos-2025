import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DragonBallService } from '../services/dragon-ball';
import { Question } from './preguntados-dbz.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-preguntados-dbz',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  templateUrl: './preguntados-dbz.html',
  styleUrl: './preguntados-dbz.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreguntadosDbzComponent {
  private readonly api = inject(DragonBallService);

  // Estado reactivo con signals
  loading = signal<boolean>(true);
  question = signal<Question | null>(null);
  selectedId = signal<number | null>(null);
  score = signal<number>(0);
  total = signal<number>(0);

  // Derivados
  answered = computed(() => this.selectedId() !== null);
  isCorrect = computed(() =>
    this.answered() && this.selectedId() === this.question()?.correct.id
  );

  constructor() {
    this.nextQuestion();
    // Si la respuesta es correcta, sumar al score
    effect(() => {
      if (this.isCorrect()) this.score.update(s => s + 1);
    });
  }

  nextQuestion(): void {
    this.loading.set(true);
    this.selectedId.set(null);
    this.api.getRandomQuestion(4, 100).subscribe({
      next: q => {
        this.question.set(q);
        this.total.update(t => t + (this.answered() ? 0 : 1)); // cuenta pregunta mostrada
        this.loading.set(false);
      },
      error: _ => {
        this.loading.set(false);
        // Fallback simple: limpiar pregunta
        this.question.set(null);
      }
    });
  }

  choose(id: number): void {
    if (this.answered()) return; // no permitir cambiar
    this.selectedId.set(id);
  }

  resetScore(): void {
    this.score.set(0);
    this.total.set(0);
  }
}


// import { Component } from '@angular/core';
// @Component({
//   selector: 'app-preguntados-dbz',
//   imports: [],
//   templateUrl: './preguntados-dbz.html',
//   styleUrl: './preguntados-dbz.css'
// })
// export class PreguntadosDbz {

// }