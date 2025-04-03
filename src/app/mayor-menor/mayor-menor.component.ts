import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-mayor-menor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})
export class MayorMenorComponent implements OnInit {
  gameForm!: FormGroup;
  secretNumber: number = 0;
  attempts: number  = 0;
  maxAttempts: number = 10;
  message: string = '';

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.resetGame();
    this.gameForm = this.fb.group({
      guess: ['', [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  resetGame() {
    // Genera un número aleatorio entre 1 y 100
    this.secretNumber = Math.floor(Math.random() * 100) + 1;
    this.attempts = this.maxAttempts;
    this.message = '';
  }

  onSubmit() {
    if (this.gameForm.invalid || this.attempts <= 0) {
      return;
    }

    const guess = parseInt(this.gameForm.value.guess, 10);
    this.attempts--;

    if (guess === this.secretNumber) {
      this.message = '¡Acertaste!';
    } else if (guess < this.secretNumber) {
      this.message = 'El número es mayor.';
    } else {
      this.message = 'El número es menor.';
    }

    if (this.attempts === 0 && guess !== this.secretNumber) {
      this.message = `Has agotado los intentos. El número era ${this.secretNumber}.`;
    }

    this.gameForm.reset();
  }
}
