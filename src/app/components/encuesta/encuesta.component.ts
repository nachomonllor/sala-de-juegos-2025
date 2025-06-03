// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-encuesta',
//   imports: [],
//   templateUrl: './encuesta.component.html',
//   styleUrl: './encuesta.component.css'
// })
// export class EncuestaComponent {

// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css']
})
export class EncuestaComponent implements OnInit {
  encuestaForm!: FormGroup;
  // Opciones para pregunta por checkbox y radio
  opcionesCheck: string[] = ['Opción A', 'Opción B', 'Opción C'];
  opcionesRadio: string[] = ['Rojo', 'Verde', 'Azul'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // 1) Definimos el FormGroup con todos los controles y sus validadores
    this.encuestaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
      edad: ['', [Validators.required, Validators.min(19), Validators.max(98)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{1,10}$/)]],
      // Tres preguntas distintas:
      preguntaTexto: ['', [Validators.required]],
      preguntaRadio: ['', [Validators.required]],
      preguntaCheckbox: this.buildCheckboxArray()
    }, {
      // Validador adicional: “No repetir opciones” en checkbox
      validators: [this.noRepetirCheckboxValidator]
    });
  }

  /** Crea un FormArray de checkbox inicializado en false para cada opción */
  private buildCheckboxArray(): FormArray {
    const arr = this.opcionesCheck.map(() => this.fb.control(false));
    return this.fb.array(arr, this.minCheckboxSelected(1));
  }

  /** Validador para que al menos una casilla esté seleccionada */
  private minCheckboxSelected(min: number) {
    return (formArray: AbstractControl) => {
      const totalSeleccionados = (formArray as FormArray).controls
        .map(control => control.value)
        .reduce((prev, next) => next ? prev + 1 : prev, 0);
      return totalSeleccionados >= min ? null : { minCheckbox: true };
    };
  }

  /** Validador personalizado para evitar respuestas repetidas (no aplica aquí, lo dejamos de ejemplo) */
  private noRepetirCheckboxValidator(formGroup: AbstractControl): { [key: string]: any } | null {
    // En caso de tener que validar que varias preguntas no compartan la misma respuesta,
    // se haría aquí. Actualmente devolvemos null para no bloquear.
    return null;
  }

  /** Conveniencia para acceder al FormArray de checkboxes en la plantilla */
  get preguntaCheckboxArray(): FormArray {
    return this.encuestaForm.get('preguntaCheckbox') as FormArray;
  }

  /** Método que se ejecuta al enviar el formulario */
  onSubmit(): void {
    if (this.encuestaForm.invalid) {
      // Marcamos todos los controles como “touched” para mostrar mensajes de error
      this.markAllAsTouched(this.encuestaForm);
      return;
    }

    // Extraemos datos del formulario
    const datos = {
      nombre: this.encuestaForm.value.nombre.trim(),
      apellido: this.encuestaForm.value.apellido.trim(),
      edad: this.encuestaForm.value.edad,
      telefono: this.encuestaForm.value.telefono,
      respuestaTexto: this.encuestaForm.value.preguntaTexto.trim(),
      respuestaRadio: this.encuestaForm.value.preguntaRadio,
      respuestaCheckbox: this.opcionesCheck
        .filter((_, i) => this.preguntaCheckboxArray.at(i).value)
    };

    console.log('Encuesta enviada:', datos);
    // Aquí podrías enviar los datos a un servicio o a Firebase

    // Reiniciar formulario tras envío
    this.encuestaForm.reset();
    // Reconstruir el array de checkboxes en false
    this.encuestaForm.setControl('preguntaCheckbox', this.buildCheckboxArray());
  }

  /** Marca todos los controles como touched para forzar visualización de errores */
  private markAllAsTouched(control: AbstractControl): void {
    if (control.hasOwnProperty('controls')) {
      // es FormGroup o FormArray
      for (const inner in (control as any).controls) {
        this.markAllAsTouched((control as any).controls[inner]);
      }
    }
    control.markAsTouched();
  }
}
