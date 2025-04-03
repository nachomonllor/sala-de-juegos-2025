import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HangmanComponent } from "./ahorcado/ahorcado.component";
import { MayorMenorComponent } from "./mayor-menor/mayor-menor.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, HangmanComponent, MayorMenorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'input-pipe-prueba';


  // userInput: string = '';

  userCase: string = '';

}
