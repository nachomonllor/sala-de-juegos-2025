import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimpleFormComponent } from "./simple-form/simple-form.component";
import { LoginComponent } from "./login/login.component";
import { AhorcadoComponent } from "./ahorcado/ahorcado.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, LoginComponent, AhorcadoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'input-pipe-prueba';


  // userInput: string = '';

  userCase: string = '';

}
