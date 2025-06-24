import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';      // ← IMPORTA ESTO
import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';

@Component({
  standalone: true,                                         // ← AGREGA ESTO
  selector: 'app-duel',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule                                      // ← Y ESTO
  ],
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.css']                     // ← CORRIGE A styleUrls
})

export class DuelComponent implements OnInit {
  selectedTheme = 'historia';
  currentQuestion = '';
  currentImage = '';
  options: string[] = [];
  message = '';
  answered = false;
  lives = 3;
  gameOver = false;

  // ← NUEVO: almacena aquí la respuesta correcta
  correctAnswer = '';

  constructor(private qs: QuestionService) { }

  ngOnInit(): void {
    this.loadQuestion();
  }

  loadQuestion(): void {
    this.message = '';
    this.answered = false;
    if (this.gameOver) { return; }

    this.qs.getQuestion(this.selectedTheme).subscribe(q => {
      this.currentQuestion = q.questionText;
      this.currentImage    = q.imageUrl;
      this.correctAnswer   = q.correctAnswer;           // ← GUARDA la respuesta correcta
      this.options         = this.shuffle([
        this.correctAnswer, 
        ...q.incorrectAnswers
      ]);
    });
  }

  selectAnswer(opt: string): void {
    if (this.answered) { return; }
    this.answered = true;

    if (opt === this.correctAnswer) {
      this.message = '¡Correcto!';
    } else {
      this.message = `Incorrecto. La respuesta era: ${this.correctAnswer}`;
      this.lives--;
      if (this.lives === 0) {
        this.gameOver = true;
        this.message += ' — Game Over.';
      }
    }
  }

  nextQuestion(): void {
    if (!this.gameOver) {
      this.loadQuestion();
    }
  }

  reset(): void {
    this.lives = 3;
    this.gameOver = false;
    this.loadQuestion();
  }

  private shuffle(arr: any[]): any[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}


// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Component, OnInit } from '@angular/core';
// import { QuestionService } from '../question.service';
// import { Question } from '../models/question.model';

// @Component({
//   selector: 'app-duel',
//   imports: [CommonModule, FormsModule],
//   templateUrl: './duel.component.html',
//   styleUrl: './duel.component.css'
// })

// export class DuelComponent implements OnInit {
//   selectedTheme = 'historia';            // O el tema que elijas
//   currentQuestion = '';
//   currentImage = '';
//   options: string[] = [];
//   message = '';
//   answered = false;
//   lives = 3;
//   gameOver = false;

//   constructor(private qs: QuestionService) { }

//   ngOnInit(): void {
//     this.loadQuestion();
//   }

//   loadQuestion(): void {
//     this.message = '';
//     this.answered = false;
//     if (this.gameOver) { return; }

//     this.qs.getQuestion(this.selectedTheme).subscribe((q: Question) => {
//       this.currentQuestion = q.questionText;
//       this.currentImage    = q.imageUrl;
//       const answers = [q.correctAnswer, ...q.incorrectAnswers];
//       this.options = this.shuffle(answers);
//     });
//   }

//   selectAnswer(opt: string): void {
//     if (this.answered) { return; }
//     this.answered = true;
//     if (opt === this.getCorrect()) {
//       this.message = '¡Correcto!';
//     } else {
//       this.message = `Incorrecto. La respuesta era: ${this.getCorrect()}`;
//       this.lives--;
//       if (this.lives === 0) {
//         this.gameOver = true;
//         this.message += ' — Game Over.';
//       }
//     }
//   }

//   nextQuestion(): void {
//     if (!this.gameOver) {
//       this.loadQuestion();
//     }
//   }

//   private getCorrect(): string {
//     // La opción correcta queda guardada en `message` o en la comparación previa
//     // Pero puedes extraerla de `options` y `message` si quieres.
//     return this.message.startsWith('¡Correcto!') 
//       ? this.options.find(o => this.message.includes(o))! 
//       : this.options.find(o => !this.options.includes(o) || true)!; 
//     // Mejor: guarda `correctAnswer` en una propiedad separada al cargar.
//   }

//   private shuffle(arr: any[]): any[] {
//     for (let i = arr.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [arr[i], arr[j]] = [arr[j], arr[i]];
//     }
//     return arr;
//   }

//   reset(): void {
//     this.lives = 3;
//     this.gameOver = false;
//     this.loadQuestion();
//   }

// }
