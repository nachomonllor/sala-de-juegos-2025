import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl
} from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Ajustá la ruta real de tu servicio
import { SupabaseService } from '../services/supabase.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    // Material
    MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule,
    MatRadioModule, MatCheckboxModule, MatButtonToggleModule, MatIconModule,
    MatSnackBarModule,

    // PARA EL DIVISOR 
    MatDividerModule
  ],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css'],
})
export class EncuestaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private supabaseSvc = inject(SupabaseService);

  form!: FormGroup;
  enviando = false;

  // Opciones
  juegos = ['Ahorcado', 'Mayor-Menor', 'Flow Free', 'Preguntados DBZ'];
  mejorasOpciones = [
    'Más niveles', 'Mejor UI/estilos', 'Sonidos y música',
    'Ranking/Leaderboard', 'Multijugador', 'Performance'
  ];
  opinionOpciones = [
    'relaja',
    'agudiza tu mente',
    'informativo',
    'mejora tu concentración',
    'te distrae'
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      // Datos personales
      nombreApellido: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+$/)
      ]],
      edad: ['', [
        Validators.required,
        Validators.min(19),  // > 18
        Validators.max(98)   // < 99
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\d{1,10}$/) // solo números, hasta 10
      ]],

      // Preguntas (todas distintas)
      juegoFavorito: ['', Validators.required],          // mat-button-toggle-group
      motivo: ['', [Validators.required, Validators.minLength(10)]], // textarea
      mejoras: this.buildCheckboxArray(),                 // checkbox group (>=1)
      opinion: ['', Validators.required],                 // radio group
    });
  }

  // --- Helpers de checkbox ---
  private buildCheckboxArray(): FormArray {
    const arr = this.mejorasOpciones.map(() => this.fb.control(false));
    return this.fb.array(arr, this.minCheckboxSelected(1));
  }

  private minCheckboxSelected(min: number) {
    return (formArray: AbstractControl) => {
      const total = (formArray as FormArray).controls
        .map(c => !!c.value)
        .reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
      return total >= min ? null : { minCheckbox: true };
    };
  }

  get mejorasFA(): FormArray {
    return this.form.get('mejoras') as FormArray;
  }

  private markAllAsTouched(control: AbstractControl): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((c) => this.markAllAsTouched(c));
    }
    control.markAsTouched({ onlySelf: true });
  }

  // // --- Envío a Supabase ---
  // async onSubmit(): Promise<void> {
  //   if (this.form.invalid) {
  //     this.markAllAsTouched(this.form);
  //     return;
  //   }

  //   this.enviando = true;
  //   try {
  //     // 1) Usuario logueado
  //     // const { data: userData, error: userErr } = await this.supabaseSvc.client.auth.getUser();
  //     // if (userErr || !userData?.user) {
  //     //   throw new Error('No se encontró el usuario autenticado.');
  //     // }

  //     const { data: { session } } = await this.supabaseSvc.client.auth.getSession();

  //     const user = session.user ;


  //     if (!session) {
  //       this.snack.open('Iniciá sesión para enviar la encuesta', 'OK', { duration: 4000 });
  //       return; // el finally igual se ejecuta
  //     }

  //     const seleccionMejoras = this.mejorasOpciones
  //       .filter((_, idx) => this.mejorasFA.at(idx).value);

  //     // 2) Armar fila
  //     const row = {
  //       user_id: userData.user.id,
  //       nombre_apellido: (this.form.value.nombreApellido as string).trim(),
  //       edad: Number(this.form.value.edad),
  //       telefono: (this.form.value.telefono as string).trim(),
  //       juego_favorito: this.form.value.juegoFavorito,
  //       motivo: (this.form.value.motivo as string).trim(),
  //       mejoras: seleccionMejoras,     // text[]
  //       opinion: this.form.value.opinion
  //     };

  //     // 3) Insert
  //     const { error: insertErr } = await this.supabaseSvc.client
  //       .from('encuestas')
  //       .insert(row);

  //     if (insertErr) throw insertErr;

  //     this.snack.open('¡Gracias! Encuesta enviada correctamente.', 'OK', { duration: 3000 });
  //     this.form.reset();
  //     // Rehacer checkboxes
  //     this.form.setControl('mejoras', this.buildCheckboxArray());

  //   } catch (e: any) {
  //     console.error(e);
  //     // this.snack.open('No se pudo guardar la encuesta. Intenta otra vez.', 'Cerrar', { duration: 3500 });

  //     this.snack.open(e?.message || e?.error_description || 'Error al guardar', 'Cerrar', { duration: 5000 });

  //   } finally {
  //     this.enviando = false;
  //   }
  // }

  // --- Envío a Supabase ---
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.markAllAsTouched(this.form);
      return;
    }

    this.enviando = true;
    try {
      // 1) Verificar sesión
      const { data, error } = await this.supabaseSvc.client.auth.getSession();
      if (error) throw error;

      const session = data?.session;
      if (!session?.user) {
        this.snack.open('Iniciá sesión para enviar la encuesta', 'OK', { duration: 4000 });
        return;
      }
      const user = session.user;

      // 2) Selección de mejoras
      const seleccionMejoras = this.mejorasOpciones
        .filter((_, idx) => this.mejorasFA.at(idx).value === true);

      // 3) Armar fila
      const row = {
        user_id: user.id,
        nombre_apellido: (this.form.value.nombreApellido as string).trim(),
        edad: Number(this.form.value.edad),
        telefono: (this.form.value.telefono as string).trim(),
        juego_favorito: this.form.value.juegoFavorito as string,
        motivo: (this.form.value.motivo as string).trim(),
        mejoras: seleccionMejoras,     // text[]
        opinion: this.form.value.opinion as string
      };

      // 4) Insert
      const { error: insertErr } = await this.supabaseSvc.client
        .from('encuestas')
        .insert(row);

      if (insertErr) throw insertErr;

      this.snack.open('¡Gracias! Encuesta enviada correctamente.', 'OK', { duration: 3000 });
      this.form.reset();
      // Rehacer checkboxes
      this.form.setControl('mejoras', this.buildCheckboxArray());

    } catch (e: any) {
      console.error(e);
      this.snack.open(e?.message || e?.error_description || 'Error al guardar', 'Cerrar', { duration: 5000 });
    } finally {
      this.enviando = false;
    }
  }



}


// private markAllAsTouched(control: AbstractControl): void {
//   if ((control as any).controls) {
//     Object.values((control as any).controls).forEach((c: AbstractControl) => this.markAllAsTouched(c));
//   }
//   control.markAsTouched();
// }

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';

// @Component({
//   selector: 'app-encuesta',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './encuesta.component.html',
//   styleUrls: ['./encuesta.component.css']
// })
// export class EncuestaComponent implements OnInit {
//   encuestaForm!: FormGroup;
//   // Opciones para pregunta por checkbox y radio
//   opcionesCheck: string[] = ['Opción A', 'Opción B', 'Opción C'];
//   opcionesRadio: string[] = ['Rojo', 'Verde', 'Azul'];

//   constructor(private fb: FormBuilder) { }

//   ngOnInit(): void {
//     // 1) Definimos el FormGroup con todos los controles y sus validadores
//     this.encuestaForm = this.fb.group({
//       nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
//       apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
//       edad: ['', [Validators.required, Validators.min(19), Validators.max(98)]],
//       telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{1,10}$/)]],
//       // Tres preguntas distintas:
//       preguntaTexto: ['', [Validators.required]],
//       preguntaRadio: ['', [Validators.required]],
//       preguntaCheckbox: this.buildCheckboxArray()
//     }, {
//       // Validador adicional: “No repetir opciones” en checkbox
//       validators: [this.noRepetirCheckboxValidator]
//     });
//   }

//   /** Crea un FormArray de checkbox inicializado en false para cada opción */
//   private buildCheckboxArray(): FormArray {
//     const arr = this.opcionesCheck.map(() => this.fb.control(false));
//     return this.fb.array(arr, this.minCheckboxSelected(1));
//   }

//   /** Validador para que al menos una casilla esté seleccionada */
//   private minCheckboxSelected(min: number) {
//     return (formArray: AbstractControl) => {
//       const totalSeleccionados = (formArray as FormArray).controls
//         .map(control => control.value)
//         .reduce((prev, next) => next ? prev + 1 : prev, 0);
//       return totalSeleccionados >= min ? null : { minCheckbox: true };
//     };
//   }

//   /** Validador personalizado para evitar respuestas repetidas (no aplica aquí, lo dejamos de ejemplo) */
//   private noRepetirCheckboxValidator(formGroup: AbstractControl): { [key: string]: any } | null {
//     // En caso de tener que validar que varias preguntas no compartan la misma respuesta,
//     // se haría aquí. Actualmente devolvemos null para no bloquear.
//     return null;
//   }

//   /** Conveniencia para acceder al FormArray de checkboxes en la plantilla */
//   get preguntaCheckboxArray(): FormArray {
//     return this.encuestaForm.get('preguntaCheckbox') as FormArray;
//   }

//   /** Método que se ejecuta al enviar el formulario */
//   onSubmit(): void {
//     if (this.encuestaForm.invalid) {
//       // Marcamos todos los controles como “touched” para mostrar mensajes de error
//       this.markAllAsTouched(this.encuestaForm);
//       return;
//     }

//     // Extraemos datos del formulario
//     const datos = {
//       nombre: this.encuestaForm.value.nombre.trim(),
//       apellido: this.encuestaForm.value.apellido.trim(),
//       edad: this.encuestaForm.value.edad,
//       telefono: this.encuestaForm.value.telefono,
//       respuestaTexto: this.encuestaForm.value.preguntaTexto.trim(),
//       respuestaRadio: this.encuestaForm.value.preguntaRadio,
//       respuestaCheckbox: this.opcionesCheck
//         .filter((_, i) => this.preguntaCheckboxArray.at(i).value)
//     };

//     console.log('Encuesta enviada:', datos);
//     // Aquí podrías enviar los datos a un servicio o a Firebase

//     // Reiniciar formulario tras envío
//     this.encuestaForm.reset();
//     // Reconstruir el array de checkboxes en false
//     this.encuestaForm.setControl('preguntaCheckbox', this.buildCheckboxArray());
//   }

//   /** Marca todos los controles como touched para forzar visualización de errores */
//   private markAllAsTouched(control: AbstractControl): void {
//     if (control.hasOwnProperty('controls')) {
//       // es FormGroup o FormArray
//       for (const inner in (control as any).controls) {
//         this.markAllAsTouched((control as any).controls[inner]);
//       }
//     }
//     control.markAsTouched();
//   }
// }


