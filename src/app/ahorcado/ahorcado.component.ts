import { Component } from '@angular/core';
import { WordService } from '../word.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent {
  selectedWord: string | undefined;

  constructor(private wordService: WordService) {}

  ngOnInit(): void {
    this.wordService.getRandomWord().subscribe(word => {
      this.selectedWord = word;

      console.log(word);
      // Aquí puedes inicializar otras variables necesarias para el juego (por ejemplo, letras adivinadas, contador de errores, etc.)
    });

    this.wordService.getAllPalabras().subscribe(palabras => {
      console.log(palabras);
    });
  }
}
