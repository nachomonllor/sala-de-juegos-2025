import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';      // IMPORTAR
import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { RouterLink } from '@angular/router';
import { LogsJuegosService } from '../services/logs-juegos.service';

@Component({
  standalone: true,                                         //AGREGAR 
  selector: 'app-duel',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule ,                                     //AGREGAR 
  ],
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.css']                     //CAMBIAR 
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

  constructor(private qs: QuestionService, private logService: LogsJuegosService  ) { }

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

    this.logService.registrarLog(
      'supa-uid-placeholder', // Aquí deberías pasar el UID real del usuario
      true, // Asumimos que iniciar el juego es un evento exitoso
      'DuelComponent',
      'loadQuestion',
      'Cargó una nueva pregunta en el duelo'
    );

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

    this.logService.registrarLog( 
      'supa-uid-placeholder', // Aquí deberías pasar el UID real del usuario
      true, // Asumimos que cada intento es un evento exitoso (aunque falle la respuesta)

      'DuelComponent',
      'selectAnswer',
      `Seleccionó la respuesta "${opt}" - ${opt === this.correctAnswer ? 'Correcta' : 'Incorrecta'}`
    );
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

