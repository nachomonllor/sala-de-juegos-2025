// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { WordService } from '../word.service';
// import { ScoreService } from '../services/score.service';
// import { pointsAhorcado } from '../models/score-utils';

// @Component({
//   selector: 'app-ahorcado',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatToolbarModule, MatCardModule, MatButtonModule],
//   templateUrl: './ahorcado.component.html',
//   styleUrls: ['./ahorcado.component.css']
// })
// export class AhorcadoComponent implements OnInit {
//   palabraSeleccionada = '';
//   guessedLetters: string[] = [];
//   letterInput = '';
//   errorCount = 0;
//   maxErrors = 6;
//   gameOver = false;

//   private t0 = performance.now();
//   errores = 0;
  
//   // palabraSecreta = '...';
//   // private t0 = performance.now();
//   // errores = 0;
//   // palabraSecreta = '...';
//   // constructor(private score: ScoreService) {}

//   // nuevo: estado del resultado y mensaje
//   gameStatus: 'win' | 'lose' | null = null;
//   winningMessage = '';

//   alphabet = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');

//   stages: string[] = [
//     'hangman_1k.png', 'hangman_2k.png', 'hangman_3k.png', 'hangman_4k.png',
//     'hangman_5k.png', 'hangman_6k.png', 'hangman_7k.png'
//   ];

//   //constructor(private score: ScoreService) {}
//   constructor(private wordService: WordService, private score: ScoreService) { }

//   ngOnInit(): void { this.resetGame(); }

//   get displayCells() {
//     const word = this.palabraSeleccionada ?? '';
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
//     this.winningMessage = '';
//     this.wordService.getRandomWord().subscribe(word => {
//       this.palabraSeleccionada = word;
//       console.log('Palabra seleccionada:', word);
//     });
//   }

//   confirmGuess(): void {
//     if (this.gameOver) return;

//     const letter = this.letterInput.trim().toLowerCase();
//     this.letterInput = '';
//     if (!letter || letter.length !== 1 || this.guessedLetters.includes(letter)) return;

//     this.guessedLetters.push(letter);

//     const hasLetter = this.palabraSeleccionada.toLowerCase().includes(letter);

//     if (hasLetter) {
//       // ¿ganó? -> todas las letras (solo alfabéticas) están adivinadas
//       const won = [...this.palabraSeleccionada].every(ch =>
//         !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch) || this.guessedLetters.includes(ch.toLowerCase())
//       );
//       if (won) {
//         this.gameOver = true;



//         this.finalizarPartida(true);  // ====> para el puntaje y listado dE resultados 



//         this.gameStatus = 'win';
//         this.winningMessage = '¡Ganaste! 🎉';
//       }
//     } else {
//       this.errorCount++;
//       if (this.errorCount >= this.maxErrors) {
//         this.gameOver = true;

//         this.finalizarPartida(false); // ====> para el puntaje y listado dE resultados 


//         this.gameStatus = 'lose';
//         this.winningMessage = '¡Perdiste!';
//       }
//     }
//   }

//   getDisplayWord(): string {
//     return this.palabraSeleccionada
//       .split('')
//       .map(ch => this.guessedLetters.includes(ch.toLowerCase()) ? ch : '_')
//       .join(' ');
//   }

//   getHangmanImage(): string {
//     const idx = Math.min(this.errorCount, this.stages.length - 1);
//     return `/assets/parts/${this.stages[idx]}`;
//   }

//   finalizarPartida(victoria: boolean) {
//     const duracionSec = Math.round((performance.now() - this.t0) / 1000);
//     const pts = pointsAhorcado({ errores: this.errores, duracionSec });
//     this.score.recordScore({
//       gameCode: 'ahorcado',
//       points: pts,
//       durationSec: duracionSec,
//       metaJson: { errores: this.errores, victoria, palabra: this.palabraSeleccionada }
//     }).catch(console.error);
//   }


// }






// // import { CommonModule } from '@angular/common';
// // import { Component, OnInit } from '@angular/core';
// // import { FormsModule } from '@angular/forms';
// // import { WordService } from '../word.service';
// // import { RouterLink } from '@angular/router';
// // import { MatCardModule } from '@angular/material/card';
// // import { MatButtonModule } from '@angular/material/button';
// // import { MatToolbarModule } from '@angular/material/toolbar';

// // export interface HangmanPart {
// //   name: string;
// //   img: string;
// //   top: number;
// //   left: number;
// //   width: number;
// //   height: number;
// // }

// // @Component({
// //   selector: 'app-ahorcado',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, RouterLink,
// //     MatToolbarModule, MatCardModule, MatButtonModule

// //   ],
// //   templateUrl: './ahorcado.component.html',
// //   styleUrls: ['./ahorcado.component.css']
// // })

// // export class HangmanComponent implements OnInit {
// //   selectedWord = '';
// //   guessedLetters: string[] = [];
// //   letterInput = '';
// //   errorCount = 0;
// //   maxErrors = 6;
// //   gameOver = false;
// //   winningMessage = '';
// //   alphabet = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');

// //   secretWord = ''; // La palabra a adivinar
// //   // Lista de imágenes compuestas por etapa (0 a maxErrors)
// //   stages: string[] = [
// //     'hangman_1k.png', // solo soga
// //     'hangman_2k.png', // + cabeza
// //     'hangman_3k.png', // + torso
// //     'hangman_4k.png', // + brazo derecho
// //     'hangman_5k.png', // + brazo izquierdo
// //     'hangman_6k.png', // + pierna derecha
// //     'hangman_7k.png', // + pierna izquierda (juego terminado)
// //   ];

// //   constructor(private wordService: WordService) { }

// //   ngOnInit(): void {
// //     this.resetGame();
// //   }

// //   get displayCells() {
// //     const word = this.selectedWord ?? ''; // tu variable de palabra
// //     return [...word].map(ch => {
// //       const isLetter = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch);
// //       if (!isLetter) {
// //         // espacios, guiones, etc. siempre visibles
// //         return { text: ch, revealed: true, separator: true };
// //       }
// //       const hit = this.guessedLetters.includes(ch.toLowerCase());
// //       return { text: hit ? ch.toUpperCase() : '_', revealed: hit, separator: false };
// //     });
// //   }

// //   resetGame(): void {
// //     this.errorCount = 0;
// //     this.guessedLetters = [];
// //     this.gameOver = false;
// //     this.winningMessage = '';
// //     this.wordService.getRandomWord().subscribe(word => {
// //       this.selectedWord = word;
// //       console.log('Palabra seleccionada:', word);
// //     });
// //   }

// //   // gameStatus: 'win' | 'lose' | null = null;

// //   confirmGuess(): void {
// //     if (this.gameOver) return;
// //     const letter = this.letterInput.trim().toLowerCase();
// //     this.letterInput = '';
// //     if (!letter || letter.length !== 1 || this.guessedLetters.includes(letter)) return;

// //     this.guessedLetters.push(letter);

// //     if (this.selectedWord.toLowerCase().includes(letter)) {
// //       // ¿Ganar?
// //       const allGuessed = this.selectedWord
// //         .toLowerCase()
// //         .split('')
// //         .every(ch => this.guessedLetters.includes(ch));
// //       if (allGuessed) {
// //         this.gameOver = true;
// //         this.winningMessage = '¡Ganaste!';
// //       }
// //     } else {
// //       // Error: avanzamos a la siguiente etapa
// //       this.errorCount++;
// //       if (this.errorCount >= this.maxErrors) {
// //         this.gameOver = true;
// //         this.winningMessage = `¡Perdiste! La palabra era ${this.selectedWord}`;
// //       }
// //     }

// //   }

// //   getDisplayWord(): string {
// //     return this.selectedWord
// //       .split('')
// //       .map(ch => this.guessedLetters.includes(ch.toLowerCase()) ? ch : '_')
// //       .join(' ');
// //   }

// //   // Devuelve la ruta de la imagen según etapa actual
// //   getHangmanImage(): string {
// //     const idx = Math.min(this.errorCount, this.stages.length - 1);
// //     return `/assets/parts/${this.stages[idx]}`;
// //   }

// // }