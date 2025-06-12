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

  // Definimos las partes en orden
  private initialParts: HangmanPart[] = [
    { name: 'cabeza', img: 'cabeza.JPG', top: 5, left: 50, width: 20, height: 20 },
    { name: 'torso', img: 'torso.JPG', top: 32, left: 58, width: 2, height: 14 },
    { name: 'brazo-derecho', img: 'brazo-derecho.JPG', top: 32, left: 46, width: 12, height: 14 },
    { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG', top: 32, left: 60, width: 12, height: 14 },
    { name: 'pierna-derecha', img: 'pierna-derecha.JPG', top: 46, left: 46, width: 12, height: 14 },
    { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG', top: 48, left: 60, width: 12, height: 12 },
  ];
  hangmanParts: HangmanPart[] = [];

  constructor(private wordService: WordService) { }

  ngOnInit(): void {
    this.resetGame();
  }

  resetGame(): void {
    this.errorCount = 0;
    this.guessedLetters = [];
    this.gameOver = false;
    this.winningMessage = '';
    this.hangmanParts = [];
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
      const allGuessed = this.selectedWord.toLowerCase()
        .split('').every(ch => this.guessedLetters.includes(ch));
      if (allGuessed) {
        this.gameOver = true;
        this.winningMessage = '¡Ganaste!';
      }
    } else {
      // Error: agregamos parte del muñeco
      this.errorCount++;
      if (this.errorCount <= this.initialParts.length) {
        this.hangmanParts.push(this.initialParts[this.errorCount - 1]);
      }
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
}






// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { WordService } from '../word.service';

// export interface HangmanPart {
//   name: string;
//   img: string;
//   top: number;  // porcentaje
//   left: number;  // porcentaje
//   width: number;  // porcentaje
//   height: number;  // porcentaje
// }

// @Component({
//   selector: 'app-ahorcado',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './ahorcado.component.html',
//   styleUrls: ['./ahorcado.component.css']
// })

// // Identacion: Shift + Alt + F (Windows/Linux)  

// export class HangmanComponent implements OnInit {

//   selectedWord: string = '';               // La palabra a adivinar
//   guessedLetters: string[] = [];           // Letras ingresadas
//   letterInput: string = '';                // Valor del input
//   errorCount: number = 0;                  // Número de errores cometidos
//   aciertos: number = 0;                    // Contador de aciertos (puedes ajustar la lógica según palabras repetidas)
//   maxErrors: number = 6;                   // Máximo de errores permitidos
//   gameOver: boolean = false;               // Estado del juego: false = en juego, true = terminado
//   winningMessage: string = '';             // Mensaje de victoria

//   // AGREGA ESTA LÍNEA justo debajo de donde defines tus propiedades:
//   alphabet: string[] = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');
//   removedParts: string[] = [];

//   // todas las partes con sus coords en %
//   private initialParts: HangmanPart[] = [
//     { name: 'cabeza', img: 'cabeza.JPG', top: 40, left: 46, width: 26, height: 12 },
//     { name: 'torso', img: 'torso.JPG', top: 32, left: 58, width: 10, height: 14 },
//     { name: 'brazo-derecho', img: 'brazo-derecho.JPG', top: 32, left: 46, width: 12, height: 14 },
//     { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG', top: 32, left: 60, width: 12, height: 14 },
//     { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG', top: 46, left: 46, width: 12, height: 14 },
//     { name: 'pierna-derecha', img: 'pierna-derecha.JPG', top: 48, left: 60, width: 12, height: 12 },
//   ];

//   // Array mutable que usa el template
//   hangmanParts: HangmanPart[] = [];

//   constructor(private wordService: WordService) { }

//   ngOnInit(): void {
//     this.resetGame();
//   }

//   resetGame(): void {
//     // Restaura todas las partes
//     this.hangmanParts = [...this.initialParts];
//     // resto de tu lógica de palabra, contadores, etc.

//     this.wordService.getRandomWord().subscribe(word => {
//       this.selectedWord = word;
//       this.guessedLetters = [];
//       this.errorCount = 0;
//       this.aciertos = 0;
//       this.gameOver = false;
//       this.winningMessage = '';

//       // Reinicia las partes con sus imágenes
//       this.hangmanParts = [
//         /* { name: 'cabeza', img: 'cabeza.JPG', top: 20, left: 46, width: 26, height: 12 }, */

//         { name: 'cabeza', img: 'cabeza.JPG', top:5, left:50, width:20, height:20 },

//         { name: 'torso', img: 'torso.JPG', top: 32, left: 58, width: 2, height: 14 },
//         { name: 'brazo-derecho', img: 'brazo-derecho.JPG', top: 32, left: 46, width: 12, height: 14 },
//         { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG', top: 32, left: 60, width: 12, height: 14 },
//         { name: 'pierna-derecha', img: 'pierna-derecha.JPG', top: 46, left: 46, width: 12, height: 14 },
//         { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG', top: 48, left: 60, width: 12, height: 12 },
//       ];

//       console.log('Palabra seleccionada: ' + this.selectedWord);
//     });
//   }

//   removeRandomPart(): void {
//     if (this.hangmanParts.length > 0) {
//       const idx = Math.floor(Math.random() * this.hangmanParts.length);
//       const removedPart = this.hangmanParts.splice(idx, 1)[0];
//       console.log('Se ha removido:', removedPart.name);
//       this.errorCount++;

//       // Añade la clave para la máscara
//       this.removedParts.push(
//         removedPart.name.replace(' ', '-').toLowerCase()
//       );
//     }

//     // … resto de la lógica …
//     if (this.errorCount >= this.maxErrors) {
//       this.gameOver = true;
//       console.log("¡Juego terminado! Perdiste.");
//       // Aquí podrías definir un mensaje de derrota o reiniciar el juego automáticamente.
//     }
//   }

//   /** Obtiene la palabra formateada mostrando _ por cada letra no adivinada */
//   getDisplayWord(): string {
//     if (!this.selectedWord) {
//       return '';
//     }
//     return this.selectedWord
//       .split('')
//       .map(ch => this.guessedLetters.includes(ch.toLowerCase()) ? ch : '_')
//       .join(' ');
//   }

//   /** Procesa la letra actual en letterInput, comprueba acierto o error */
//   confirmGuess(): void {
//     if (this.gameOver) {
//       return; // ya terminó el juego
//     }

//     // Validación básica
//     if (!this.letterInput || this.letterInput.length !== 1) {
//       console.log('Por favor, ingresa una sola letra.');
//       return;
//     }

//     const letter = this.letterInput.toLowerCase();
//     this.letterInput = '';        // limpiamos el input

//     // Si ya la ingresó antes, no hacemos nada
//     if (this.guessedLetters.includes(letter)) {
//       console.log(`Ya ingresaste la letra "${letter}".`);
//       return;
//     }

//     // Registramos la letra
//     this.guessedLetters.push(letter);

//     // Comprueba si está en la palabra
//     if (this.selectedWord.toLowerCase().includes(letter)) {
//       this.aciertos++;

//       // ¿Ganar? todos los caracteres adivinados
//       const allGuessed = this.selectedWord
//         .toLowerCase()
//         .split('')
//         .every(ch => this.guessedLetters.includes(ch));
//       if (allGuessed) {
//         this.gameOver = true;
//         this.winningMessage = '¡Ganaste!';
//         console.log(this.winningMessage);
//       } else {
//         console.log(`¡Bien! La letra "${letter}" está en la palabra.`);
//       }

//     } else {
//       // Letra incorrecta → quita una parte
//       console.log(`La letra "${letter}" NO está en la palabra.`);
//       this.removeRandomPart();
//     }
//   }

// }



