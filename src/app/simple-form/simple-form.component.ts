import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-simple-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './simple-form.component.html',
  styleUrl: './simple-form.component.css'

  
})
export class SimpleFormComponent {

  // El FormControl utiliza dos validadores:
  // - Validators.pattern: solo permite letras (mayúsculas o minúsculas) y espacios.
  // - Validators.maxLength: limita la longitud a 10 caracteres.
  lettersControl = new FormControl('', [
    Validators.pattern('^[a-zA-Z ]*$'),
    Validators.maxLength(10)
  ]);

  // Este método evita que se ingresen caracteres no permitidos en tiempo real.
  onKeyPress(event: KeyboardEvent) {
    const allowedPattern = /[a-zA-Z ]/;
    const inputChar = event.key;
    if (!allowedPattern.test(inputChar)) {
      event.preventDefault();
    }
  }

}
