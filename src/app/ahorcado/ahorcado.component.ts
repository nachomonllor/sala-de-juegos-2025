import { Component, OnInit } from '@angular/core';
import { WordService } from '../word.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LetterOnlyPipe } from "../letter-only.pipe";

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LetterOnlyPipe],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})

export class HangmanComponent implements OnInit {


  selectedWord: string='';              // La palabra a adivinar
  guessedLetters: string[] = [];       // Letras que ya han sido ingresadas
  letterInput: string = '';            // Valor del input
  errorCount: number = 0;              // Contador de errores
  maxErrors: number = 6;               // Máximo de errores permitidos
  removedParts: string[] = [];
  
  // Partes del muñeco (en orden, aunque en este caso se removerán aleatoriamente)
  hangmanParts: string[] = [
    'cabeza',
    'brazo izquierdo',
    'brazo derecho',
    'torso',
    'pierna izquierda',
    'pierna derecha'
  ];
  
  constructor(private wordService: WordService) { }
  
  ngOnInit(): void {
    // Se obtiene una palabra aleatoria al iniciar el juego
    this.wordService.getRandomWord().subscribe(word => {
      this.selectedWord = word;
      console.log("Palabra seleccionada:", word);
    });
  }
  
 
  // Método para validar que solo se ingrese una letra (solo permite caracteres alfabéticos)
  validateLetter(event: KeyboardEvent): void {
    const pattern = /^[a-zA-Z]$/;
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  
  // Método para confirmar la letra ingresada
  confirmGuess(): void {
    if (!this.letterInput || this.letterInput.length !== 1) {
      console.log("Por favor, ingresa una sola letra.");
      return;
    }
    
    const letter = this.letterInput.toLowerCase();
    // Limpiamos el input para el siguiente intento
    this.letterInput = '';
    
    // Si la letra ya fue ingresada, no hacemos nada
    if (this.guessedLetters.includes(letter)) {
      console.log("Ya ingresaste esa letra.");
      return;
    }
    
    this.guessedLetters.push(letter);
    
    // Verificamos si la letra está en la palabra (comparando en minúsculas)
    if (!this.selectedWord.toLowerCase().includes(letter)) {
      console.log(`La letra "${letter}" no está en la palabra.`);
      this.removeRandomPart();
    } else {
      console.log(`¡Bien! La letra "${letter}" está en la palabra.`);
    }
    
    // Aquí podrías agregar lógica para verificar si se ha ganado o perdido el juego.
  }
  
  // Función que remueve aleatoriamente una parte del muñeco cuando se comete un error.
  removeRandomPart(): void {
    if (this.hangmanParts.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.hangmanParts.length);
      const removed = this.hangmanParts.splice(randomIndex, 1);
      console.log("Se ha removido:", removed[0]);
      this.errorCount++;
    }
    
    if (this.errorCount >= this.maxErrors) {
      console.log("¡Juego terminado! Se han removido todas las partes del muñeco.");
      // Aquí podrías reiniciar el juego o mostrar un mensaje de derrota.
    }
  }


  getDisplayWord(): string {
    if (!this.selectedWord) {
      return '';
    }
    return this.selectedWord
      .split('')
      .map(letter => this.guessedLetters.includes(letter.toLowerCase()) ? letter : '_')
      .join(' ');
  }

}




// export class AhorcadoComponent {
//   selectedWord: string = '';
//   guessedLetters: string[] = []; // Letras que el usuario ha adivinado correctamente o no
//   errorCount: number = 0;        // Cantidad de errores cometidos
//   maxErrors: number = 6;         // Número máximo de errores permitidos

//   hangmanParts: string[] = [
//     'cabeza',
//     'brazo izquierdo',
//     'brazo derecho',
//     'torso',
//     'pierna izquierda',
//     'pierna derecha'
//   ];

//   constructor(private wordService: WordService) { }

//   // Opcional: Array para las partes ya retiradas
//   removedParts: string[] = [];


//   ngOnInit(): void {
//     this.wordService.getRandomWord().subscribe(word => {
//       this.selectedWord = word;

//       console.log(word);
//       // Aquí puedes inicializar otras variables necesarias para el juego (por ejemplo, letras adivinadas, contador de errores, etc.)
//     });

//     this.wordService.getAllPalabras().subscribe(palabras => {
//       console.log(palabras);
//     });
//   }

//   // Método para procesar el intento del usuario
//   guessLetter(letter: string): void {
//     // Si la letra ya fue adivinada, no hacemos nada
//     if (this.guessedLetters.includes(letter)) {
//       return;
//     }

//     // Agregamos la letra a la lista de letras adivinadas
//     this.guessedLetters.push(letter);

//     // Si la letra no se encuentra en la palabra, incrementamos el contador de errores
//     if (!this.selectedWord.includes(letter)) {
//       this.errorCount++;
//       console.log(`Error: La letra ${letter} no está en la palabra.`);
//     } else {
//       console.log(`Acertaste: La letra ${letter} sí está en la palabra.`);
//     }

//     // Aquí podrías agregar lógica adicional para comprobar si el juego terminó
//   }

//   // Método para simular un error y remover aleatoriamente una parte
//   removeRandomPart(): void {
//     if (this.hangmanParts.length > 0) {
//       const randomIndex = Math.floor(Math.random() * this.hangmanParts.length);
//       // Removemos la parte seleccionada del array de partes restantes
//       const removed = this.hangmanParts.splice(randomIndex, 1);
//       // Guardamos la parte removida, si queremos mostrarla en otro lado
//       this.removedParts.push(removed[0]);
//     }
//   }

// }
