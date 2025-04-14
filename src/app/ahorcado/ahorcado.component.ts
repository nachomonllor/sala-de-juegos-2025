import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WordService } from '../word.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css']
})

export class HangmanComponent implements OnInit {
  selectedWord: string = '';               // La palabra a adivinar
  guessedLetters: string[] = [];           // Letras ingresadas
  letterInput: string = '';                // Valor del input
  errorCount: number = 0;                  // Número de errores cometidos
  aciertos: number = 0;                    // Contador de aciertos (puedes ajustar la lógica según palabras repetidas)
  maxErrors: number = 6;                   // Máximo de errores permitidos
  gameOver: boolean = false;               // Estado del juego: false = en juego, true = terminado
  winningMessage: string = '';             // Mensaje de victoria

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
    this.resetGame();
  }

  // Reinicia el juego (puedes ampliar la lógica según lo necesites)
  resetGame(): void {
    this.wordService.getRandomWord().subscribe(word => {
      this.selectedWord = word;
      this.guessedLetters = [];
      this.errorCount = 0;
      this.aciertos = 0;
      this.gameOver = false;
      this.winningMessage = '';
      // Reiniciamos el arreglo de partes del muñeco si es necesario
      this.hangmanParts = [
        'cabeza',
        'brazo izquierdo',
        'brazo derecho',
        'torso',
        'pierna izquierda',
        'pierna derecha'
      ];
      console.log('Palabra seleccionada: ' + this.selectedWord);
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
    if (this.gameOver) {
      // Si el juego ya terminó, no se procesa nada
      return;
    }

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
      this.aciertos++;

      // Si aciertos es mayor o igual a la longitud de la palabra, el usuario gana.
      if (this.aciertos >= this.selectedWord.length) {
        this.gameOver = true;
        this.winningMessage = '¡Ganaste!';
        console.log(this.winningMessage);
      }
    }
  }

  // Función para remover aleatoriamente una parte del muñeco
  removeRandomPart(): void {
    if (this.hangmanParts.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.hangmanParts.length);
      const removed = this.hangmanParts.splice(randomIndex, 1);
      console.log("Se ha removido:", removed[0]);
      this.errorCount++;
    }
    
    if (this.errorCount >= this.maxErrors) {
      this.gameOver = true;
      console.log("¡Juego terminado! Perdiste.");
      // Aquí podrías definir un mensaje de derrota o reiniciar el juego automáticamente.
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








