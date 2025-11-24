
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WordEntry, WordService } from '../services_pista/word';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.scss'
})
export class AhorcadoComponent implements OnInit {
  selectedWord = '';
  selectedDisplay = '';
  selectedHint = '';
  selectedCategory = '';

  guessedLetters: string[] = [];
  errorCount = 0;
  maxErrors = 6;
  gameOver = false;
  gameStatus: 'win' | 'lose' | null = null;
  alphabet = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');
  stages: string[] = [
    'hangman_1k.png', 'hangman_2k.png', 'hangman_3k.png', 'hangman_4k.png',
    'hangman_5k.png', 'hangman_6k.png', 'hangman_7k.png'
  ];

  constructor(private wordService: WordService) { }

  ngOnInit(): void { this.resetGame(); }

  get displayCells() {
    const word = this.selectedDisplay || '';
    return [...word].map(ch => {
      const isLetter = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch);
      if (!isLetter) return { text: ch, revealed: true, separator: true };
      const hit = this.guessedLetters.includes(ch.toLowerCase());
      return { text: hit ? ch.toUpperCase() : '_', revealed: hit, separator: false };
    });
  }

  resetGame(): void {
    this.errorCount = 0;
    this.guessedLetters = [];
    this.gameOver = false;
    this.gameStatus = null;

    this.wordService.getRandomWord().subscribe((w: WordEntry) => {
      this.selectedWord = w.text.toLowerCase();
      this.selectedDisplay = w.display || w.text;
      this.selectedHint = w.hint;
      this.selectedCategory = w.category;
    });
  }

  confirmGuess(letter: string): void {
    if (this.gameOver) return;
    letter = letter.toLowerCase();
    if (this.guessedLetters.includes(letter)) return;
    this.guessedLetters.push(letter);

    if (this.selectedWord.includes(letter)) {
      const won = [...this.selectedWord].every(ch =>
        !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch) || this.guessedLetters.includes(ch.toLowerCase())
      );
      if (won) {
        this.gameOver = true;
        this.gameStatus = 'win';
      }
    } else {
      this.errorCount++;
      if (this.errorCount >= this.maxErrors) {
        this.gameOver = true;
        this.gameStatus = 'lose';
      }
    }
  }

  getHangmanImage(): string {
    const idx = Math.min(this.errorCount, this.stages.length - 1);
    return `/assets/parts/${this.stages[idx]}`;
  }
}


// import { Component } from '@angular/core';
// @Component({
//   selector: 'app-ahorcado',
//   imports: [],
//   templateUrl: './ahorcado.html',
//   styleUrl: './ahorcado.css'
// })
// export class Ahorcado {
// }




// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { WordEntry, WordService } from '../services_pista/word';

// @Component({
//   selector: 'app-ahorcado',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MatToolbarModule,
//     MatCardModule,
//     MatButtonModule
//   ],
//   templateUrl: './ahorcado.html',
//   styleUrl: './ahorcado.scss'
// })
// export class AhorcadoComponent implements OnInit {
//   selectedWord = '';
//   selectedDisplay = '';
//   selectedHint = '';
//   selectedCategory = '';

//   guessedLetters: string[] = [];
//   errorCount = 0;
//   maxErrors = 6;
//   gameOver = false;
//   gameStatus: 'win' | 'lose' | null = null;
//   alphabet = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');
//   stages: string[] = [
//     'hangman_1k.png', 'hangman_2k.png', 'hangman_3k.png', 'hangman_4k.png',
//     'hangman_5k.png', 'hangman_6k.png', 'hangman_7k.png'
//   ];

//   constructor(private wordService: WordService) { }

//   ngOnInit(): void { this.resetGame(); }

//   get displayCells() {
//     const word = this.selectedDisplay || '';
//     return [...word].map(ch => {
//       const isLetter = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch);
//       if (!isLetter) return { text: ch, revealed: true, separator: true };
//       const hit = this.guessedLetters.includes(ch.toLowerCase());
//       return { text: hit ? ch.toUpperCase() : '_', revealed: hit, separator: false };
//     });
//   }

//   resetGame(): void {
//     this.errorCount = 0;
//     this.guessedLetters = [];
//     this.gameOver = false;
//     this.gameStatus = null;

//     this.wordService.getRandomWord().subscribe((w: WordEntry) => {
//       this.selectedWord = w.text.toLowerCase();
//       this.selectedDisplay = w.display || w.text;
//       this.selectedHint = w.hint;
//       this.selectedCategory = w.category;
//     });
//   }

//   confirmGuess(letter: string): void {
//     if (this.gameOver) return;
//     letter = letter.toLowerCase();
//     if (this.guessedLetters.includes(letter)) return;
//     this.guessedLetters.push(letter);

//     if (this.selectedWord.includes(letter)) {
//       const won = [...this.selectedWord].every(ch =>
//         !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch) || this.guessedLetters.includes(ch.toLowerCase())
//       );
//       if (won) {
//         this.gameOver = true;
//         this.gameStatus = 'win';
//       }
//     } else {
//       this.errorCount++;
//       if (this.errorCount >= this.maxErrors) {
//         this.gameOver = true;
//         this.gameStatus = 'lose';
//       }
//     }
//   }

//   getHangmanImage(): string {
//     const idx = Math.min(this.errorCount, this.stages.length - 1);
//     return `/assets/parts/${this.stages[idx]}`;
//   }
// }



