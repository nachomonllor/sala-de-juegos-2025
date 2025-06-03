import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WordService } from '../word.service';

// Importa esta interfaz arriba del @Component
// interface HangmanPart {
//   name: string;
//   img: string;
// }

export interface HangmanPart {
  name: string;
  img: string;
  top: number;  // porcentaje
  left: number;  // porcentaje
  width: number;  // porcentaje
  height: number;  // porcentaje
}


@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css']
})

// Identacion: Shift + Alt + F (Windows/Linux)  

export class HangmanComponent implements OnInit {

  selectedWord: string = '';               // La palabra a adivinar
  guessedLetters: string[] = [];           // Letras ingresadas
  letterInput: string = '';                // Valor del input
  errorCount: number = 0;                  // Número de errores cometidos
  aciertos: number = 0;                    // Contador de aciertos (puedes ajustar la lógica según palabras repetidas)
  maxErrors: number = 6;                   // Máximo de errores permitidos
  gameOver: boolean = false;               // Estado del juego: false = en juego, true = terminado
  winningMessage: string = '';             // Mensaje de victoria

  // AGREGA ESTA LÍNEA justo debajo de donde defines tus propiedades:
  alphabet: string[] = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');
  removedParts: string[] = [];

  // todas las partes con sus coords en %
  private initialParts: HangmanPart[] = [
    { name: 'cabeza', img: 'cabeza.JPG', top: 40, left: 46, width: 26, height: 12 },
    { name: 'torso', img: 'torso.JPG', top: 32, left: 58, width: 10, height: 14 },
    { name: 'brazo-derecho', img: 'brazo-derecho.JPG', top: 32, left: 46, width: 12, height: 14 },
    { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG', top: 32, left: 60, width: 12, height: 14 },
    { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG', top: 46, left: 46, width: 12, height: 14 },
    { name: 'pierna-derecha', img: 'pierna-derecha.JPG', top: 48, left: 60, width: 12, height: 12 },
  ];

  // Array mutable que usa el template
  hangmanParts: HangmanPart[] = [];

  constructor(private wordService: WordService) { }

  ngOnInit(): void {
    this.resetGame();
  }

  resetGame(): void {
    // Restaura todas las partes
    this.hangmanParts = [...this.initialParts];
    // resto de tu lógica de palabra, contadores, etc.

    this.wordService.getRandomWord().subscribe(word => {
      this.selectedWord = word;
      this.guessedLetters = [];
      this.errorCount = 0;
      this.aciertos = 0;
      this.gameOver = false;
      this.winningMessage = '';

      // Reinicia las partes con sus imágenes
      this.hangmanParts = [
        /* { name: 'cabeza', img: 'cabeza.JPG', top: 20, left: 46, width: 26, height: 12 }, */

        { name: 'cabeza', img: 'cabeza.JPG', top:5, left:50, width:20, height:20 },


        { name: 'torso', img: 'torso.JPG', top: 32, left: 58, width: 2, height: 14 },
        { name: 'brazo-derecho', img: 'brazo-derecho.JPG', top: 32, left: 46, width: 12, height: 14 },
        { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG', top: 32, left: 60, width: 12, height: 14 },
        { name: 'pierna-derecha', img: 'pierna-derecha.JPG', top: 46, left: 46, width: 12, height: 14 },
        { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG', top: 48, left: 60, width: 12, height: 12 },
      ];

      console.log('Palabra seleccionada: ' + this.selectedWord);

    });

  }

  // removeRandomPart(): void {
  //   if (!this.hangmanParts.length) return;
  //   const idx = Math.floor(Math.random() * this.hangmanParts.length);
  //   this.hangmanParts.splice(idx, 1);
  //   // resto de tu lógica de errorCount, gameOver…
  // }

  removeRandomPart(): void {
    if (this.hangmanParts.length > 0) {
      const idx = Math.floor(Math.random() * this.hangmanParts.length);
      const removedPart = this.hangmanParts.splice(idx, 1)[0];
      console.log('Se ha removido:', removedPart.name);
      this.errorCount++;

      // Añade la clave para la máscara
      this.removedParts.push(
        removedPart.name.replace(' ', '-').toLowerCase()
      );
    }

    // … resto de la lógica …
    if (this.errorCount >= this.maxErrors) {
      this.gameOver = true;
      console.log("¡Juego terminado! Perdiste.");
      // Aquí podrías definir un mensaje de derrota o reiniciar el juego automáticamente.
    }
  }

  /** Obtiene la palabra formateada mostrando _ por cada letra no adivinada */
  getDisplayWord(): string {
    if (!this.selectedWord) {
      return '';
    }
    return this.selectedWord
      .split('')
      .map(ch => this.guessedLetters.includes(ch.toLowerCase()) ? ch : '_')
      .join(' ');
  }

  /** Procesa la letra actual en letterInput, comprueba acierto o error */
  confirmGuess(): void {
    if (this.gameOver) {
      return; // ya terminó el juego
    }

    // Validación básica
    if (!this.letterInput || this.letterInput.length !== 1) {
      console.log('Por favor, ingresa una sola letra.');
      return;
    }

    const letter = this.letterInput.toLowerCase();
    this.letterInput = '';        // limpiamos el input

    // Si ya la ingresó antes, no hacemos nada
    if (this.guessedLetters.includes(letter)) {
      console.log(`Ya ingresaste la letra "${letter}".`);
      return;
    }

    // Registramos la letra
    this.guessedLetters.push(letter);

    // Comprueba si está en la palabra
    if (this.selectedWord.toLowerCase().includes(letter)) {
      this.aciertos++;

      // ¿Ganar? todos los caracteres adivinados
      const allGuessed = this.selectedWord
        .toLowerCase()
        .split('')
        .every(ch => this.guessedLetters.includes(ch));
      if (allGuessed) {
        this.gameOver = true;
        this.winningMessage = '¡Ganaste!';
        console.log(this.winningMessage);
      } else {
        console.log(`¡Bien! La letra "${letter}" está en la palabra.`);
      }

    } else {
      // Letra incorrecta → quita una parte
      console.log(`La letra "${letter}" NO está en la palabra.`);
      this.removeRandomPart();
    }
  }



}


// this.hangmanParts = [
//   { name: 'cabeza', img: 'cabeza.JPG' },
//   { name: 'torso', img: 'torso.JPG' },
//   { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG' },
//   { name: 'brazo-derecho', img: 'brazo-derecho.JPG' },
//   { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG' },
//   { name: 'pierna-derecha', img: 'pierna-derecha.JPG' }
// ];

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

//   // Nuevo: lista de objetos con ruta de imagen
//   hangmanParts: HangmanPart[] = [
//     { name: 'cabeza', img: 'cabeza.JPG' },
//     { name: 'torso', img: 'torso.JPG' },
//     { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG' },
//     { name: 'brazo-derecho', img: 'brazo-derecho.JPG' },
//     { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG' },
//     { name: 'pierna-derecha', img: 'pierna-derecha.JPG' }
//   ];

//   constructor(private wordService: WordService) { }

//   ngOnInit(): void {
//     this.resetGame();
//   }

//   // En resetGame, vuelve a reiniciar este array completo:
//   resetGame(): void {
//     // 1) Limpias los cuadrados tapados
//     this.removedParts = [];

//     this.wordService.getRandomWord().subscribe(word => {
//       this.selectedWord = word;
//       this.guessedLetters = [];
//       this.errorCount = 0;
//       this.aciertos = 0;
//       this.gameOver = false;
//       this.winningMessage = '';
//       // Reinicia las partes con sus imágenes
//       this.hangmanParts = [
//         { name: 'cabeza', img: 'cabeza.JPG' },
//         { name: 'torso', img: 'torso.JPG' },
//         { name: 'brazo-izquierdo', img: 'brazo-izquierdo.JPG' },
//         { name: 'brazo-derecho', img: 'brazo-derecho.JPG' },
//         { name: 'pierna-izquierda', img: 'pierna-izquierda.JPG' },
//         { name: 'pierna-derecha', img: 'pierna-derecha.JPG' }
//       ];

//       console.log('Palabra seleccionada: ' + this.selectedWord);
//     });
//   }

//   // Método para validar que solo se ingrese una letra (solo permite caracteres alfabéticos)
//   validateLetter(event: KeyboardEvent): void {
//     const pattern = /^[a-zA-Z]$/;
//     const inputChar = event.key;
//     if (!pattern.test(inputChar)) {
//       event.preventDefault();
//     }
//   }

//   // Método para confirmar la letra ingresada
//   confirmGuess(): void {
//     if (this.gameOver) {
//       // Si el juego ya terminó, no se procesa nada
//       return;
//     }

//     if (!this.letterInput || this.letterInput.length !== 1) {
//       console.log("Por favor, ingresa una sola letra.");
//       return;
//     }

//     const letter = this.letterInput.toLowerCase();
//     // Limpiamos el input para el siguiente intento
//     this.letterInput = '';

//     // Si la letra ya fue ingresada, no hacemos nada
//     if (this.guessedLetters.includes(letter)) {
//       console.log("Ya ingresaste esa letra.");
//       return;
//     }

//     this.guessedLetters.push(letter);

//     // Verificamos si la letra está en la palabra (comparando en minúsculas)
//     if (!this.selectedWord.toLowerCase().includes(letter)) {
//       console.log(`La letra "${letter}" no está en la palabra.`);
//       this.removeRandomPart();
//     } else {
//       console.log(`¡Bien! La letra "${letter}" está en la palabra.`);
//       this.aciertos++;

//       // Si aciertos es mayor o igual a la longitud de la palabra, el usuario gana.
//       if (this.aciertos >= this.selectedWord.length) {
//         this.gameOver = true;
//         this.winningMessage = '¡Ganaste!';
//         console.log(this.winningMessage);
//       }
//     }
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

//   getDisplayWord(): string {
//     if (!this.selectedWord) {
//       return '';
//     }
//     return this.selectedWord
//       .split('')
//       .map(letter => this.guessedLetters.includes(letter.toLowerCase()) ? letter : '_')
//       .join(' ');
//   }
// }



//---------------------------------------------------------------------------------------------------

// // Función para remover aleatoriamente una parte del muñeco
// removeRandomPart(): void {
//   // if (this.hangmanParts.length > 0) {
//   //   const randomIndex = Math.floor(Math.random() * this.hangmanParts.length);
//   //   const removed = this.hangmanParts.splice(randomIndex, 1);
//   //   console.log("Se ha removido:", removed[0]);
//   //   this.errorCount++;
//   // }

//   if (this.hangmanParts.length > 0) {
//     const idx = Math.floor(Math.random() * this.hangmanParts.length);
//     const removed = this.hangmanParts.splice(idx, 1)[0];
//     console.log("Se ha removido:", removed.name);
//     this.errorCount++;
//   }

//   if (this.errorCount >= this.maxErrors) {
//     this.gameOver = true;
//     console.log("¡Juego terminado! Perdiste.");
//     // Aquí podrías definir un mensaje de derrota o reiniciar el juego automáticamente.
//   }
// }


// hangmanParts: string[] = [
//   'cabeza',
//   'brazo izquierdo',
//   'brazo derecho',
//   'torso',
//   'pierna izquierda',
//   'pierna derecha'
// ];

