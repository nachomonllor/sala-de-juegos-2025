import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  OnInit } from '@angular/core';
import {  Router } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    // Configuramos el formulario con validadores para cada campo.
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void { }

  // Validator personalizado para que password y confirmPassword coincidan.
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Usuario Registrado:', this.registerForm.value);
      // Aquí podrías enviar los datos a tu backend y luego redirigir, por ejemplo, a la pantalla de inicio.
      this.router.navigate(['/']);
    } else {
      // Marca todos los controles como tocados para mostrar los errores
      this.registerForm.markAllAsTouched();
    }
  }
}
