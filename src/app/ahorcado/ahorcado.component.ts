import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WordService } from '../word.service';

export interface HangmanPart {
  name: string;
  img: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css']
})

export class HangmanComponent implements OnInit {
  selectedWord = '';
  guessedLetters: string[] = [];
  letterInput = '';
  errorCount = 0;
  maxErrors = 6;
  gameOver = false;
  winningMessage = '';
  alphabet = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');

  // Lista de imágenes compuestas por etapa (0 a maxErrors)
  stages: string[] = [
    'hangman_1k.png', // solo soga
    'hangman_2k.png', // + cabeza
    'hangman_3k.png', // + torso
    'hangman_4k.png', // + brazo derecho
    'hangman_5k.png', // + brazo izquierdo
    'hangman_6k.png', // + pierna derecha
    'hangman_7k.png', // + pierna izquierda (juego terminado)
  ];

  constructor(private wordService: WordService) { }

  ngOnInit(): void {
    this.resetGame();
  }

  resetGame(): void {
    this.errorCount = 0;
    this.guessedLetters = [];
    this.gameOver = false;
    this.winningMessage = '';
    this.wordService.getRandomWord().subscribe(word => {
      this.selectedWord = word;
      console.log('Palabra seleccionada:', word);
    });
  }

  confirmGuess(): void {
    if (this.gameOver) return;
    const letter = this.letterInput.trim().toLowerCase();
    this.letterInput = '';
    if (!letter || letter.length !== 1 || this.guessedLetters.includes(letter)) return;

    this.guessedLetters.push(letter);

    if (this.selectedWord.toLowerCase().includes(letter)) {
      // ¿Ganar?
      const allGuessed = this.selectedWord
        .toLowerCase()
        .split('')
        .every(ch => this.guessedLetters.includes(ch));
      if (allGuessed) {
        this.gameOver = true;
        this.winningMessage = '¡Ganaste!';
      }
    } else {
      // Error: avanzamos a la siguiente etapa
      this.errorCount++;
      if (this.errorCount >= this.maxErrors) {
        this.gameOver = true;
        this.winningMessage = `¡Perdiste! La palabra era ${this.selectedWord}`;
      }
    }
  }

  getDisplayWord(): string {
    return this.selectedWord
      .split('')
      .map(ch => this.guessedLetters.includes(ch.toLowerCase()) ? ch : '_')
      .join(' ');
  }

  // Devuelve la ruta de la imagen según etapa actual
  getHangmanImage(): string {
    const idx = Math.min(this.errorCount, this.stages.length - 1);
    return `/assets/parts/${this.stages[idx]}`;
  }

}