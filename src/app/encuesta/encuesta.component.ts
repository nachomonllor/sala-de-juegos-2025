import { Component, OnInit, inject, signal } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Ajustá la ruta real de tu servicio
import { SupabaseService } from '../services/supabase.service';
import { MatDividerModule } from '@angular/material/divider';

// Interfaces para preguntas dinámicas
export interface OpcionPregunta {
  id: number;
  texto: string;
  valor: string;
  orden: number;
}

export interface PreguntaEncuesta {
  id: number;
  texto: string;
  tipo_control: string | null; // 'textbox', 'radio', 'checkbox'
  es_requerida: boolean;
  orden: number;
  opciones: OpcionPregunta[];
}

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    // Material
    MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule,
    MatRadioModule, MatCheckboxModule, MatButtonToggleModule, MatIconModule,
    MatSnackBarModule, MatProgressBarModule,

    // PARA EL DIVISOR 
    MatDividerModule
  ],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.scss'],
})
export class EncuestaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private supabaseSvc = inject(SupabaseService);

  form!: FormGroup;
  enviando = false;
  cargando = signal(true);
  error = signal<string | null>(null);

  // Preguntas cargadas desde BD
  preguntas = signal<PreguntaEncuesta[]>([]);
  encuestaId: number | null = null;

  ngOnInit(): void {
    this.cargarEncuesta();
  }

  async cargarEncuesta(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      // 1) Buscar encuesta activa
      const { data: encuesta, error: encuestaError } = await this.supabaseSvc.client
        .schema('esquema_juegos')
        .from('encuestas')
        .select('id, titulo, descripcion')
        .eq('activa', true)
        .order('creada_en', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (encuestaError) throw encuestaError;
      if (!encuesta) {
        this.error.set('No hay encuestas disponibles en este momento.');
        return;
      }

      this.encuestaId = encuesta.id;

      // 2) Cargar preguntas con sus opciones
      const { data: preguntasData, error: preguntasError } = await this.supabaseSvc.client
        .schema('esquema_juegos')
        .from('preguntas_encuesta')
        .select('id, texto, tipo_control, es_requerida, orden')
        .eq('encuesta_id', encuesta.id)
        .order('orden', { ascending: true });

      if (preguntasError) throw preguntasError;

      if (!preguntasData || preguntasData.length === 0) {
        this.error.set('La encuesta no tiene preguntas configuradas.');
        return;
      }

      // 3) Cargar opciones para cada pregunta
      const preguntasConOpciones: PreguntaEncuesta[] = [];
      for (const pregunta of preguntasData) {
        const { data: opcionesData, error: opcionesError } = await this.supabaseSvc.client
          .schema('esquema_juegos')
          .from('opciones_pregunta')
          .select('id, texto, valor, orden')
          .eq('pregunta_id', pregunta.id)
          .order('orden', { ascending: true });

        if (opcionesError) {
          console.warn(`Error cargando opciones para pregunta ${pregunta.id}:`, opcionesError);
        }

        preguntasConOpciones.push({
          id: pregunta.id,
          texto: pregunta.texto,
          tipo_control: pregunta.tipo_control,
          es_requerida: pregunta.es_requerida,
          orden: pregunta.orden,
          opciones: (opcionesData || []).map(op => ({
            id: op.id,
            texto: op.texto,
            valor: op.valor,
            orden: op.orden
          }))
        });
      }

      this.preguntas.set(preguntasConOpciones);

      // 4) Construir formulario dinámicamente
      this.construirFormulario(preguntasConOpciones);
    } catch (err: any) {
      console.error('[Encuesta] Error cargando encuesta:', err);
      this.error.set(err?.message || 'Error al cargar la encuesta.');
    } finally {
      this.cargando.set(false);
    }
  }

  construirFormulario(preguntas: PreguntaEncuesta[]): void {
    const formControls: { [key: string]: any } = {
      // Datos personales (siempre presentes)
      nombreApellido: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+$/)
      ]],
      edad: ['', [
        Validators.required,
        Validators.min(19),
        Validators.max(98)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\d{1,10}$/)
      ]]
    };

    // Agregar controles dinámicos para cada pregunta
    preguntas.forEach((pregunta, index) => {
      const controlName = `pregunta_${pregunta.id}`;
      
      if (pregunta.tipo_control === 'checkbox') {
        // Para checkbox, crear FormArray
        const formArray = this.fb.array(
          pregunta.opciones.map(() => this.fb.control(false)),
          pregunta.es_requerida ? this.minCheckboxSelected(1) : null
        );
        formControls[controlName] = formArray;
      } else {
        // Para radio o textbox, crear control simple
        const validators = pregunta.es_requerida ? [Validators.required] : [];
        if (pregunta.tipo_control === 'textbox') {
          validators.push(Validators.minLength(10));
        }
        formControls[controlName] = ['', validators];
      }
    });

    this.form = this.fb.group(formControls);
  }

  // --- Helpers de checkbox ---
  private minCheckboxSelected(min: number) {
    return (formArray: AbstractControl) => {
      const total = (formArray as FormArray).controls
        .map(c => !!c.value)
        .reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
      return total >= min ? null : { minCheckbox: true };
    };
  }

  getPreguntaFormArray(preguntaId: number): FormArray {
    return this.form.get(`pregunta_${preguntaId}`) as FormArray;
  }

  getPreguntaFormControl(preguntaId: number): AbstractControl {
    return this.form.get(`pregunta_${preguntaId}`)!;
  }

  private markAllAsTouched(control: AbstractControl): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((c) => this.markAllAsTouched(c));
    }
    control.markAsTouched({ onlySelf: true });
  }

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

      // 2) Obtener usuario_id de esquema_juegos.usuarios
      const usuarioId = await this.supabaseSvc.getUsuarioIdFromSupabaseUid(user.id);

      // 3) Obtener encuesta activa (usar la que ya cargamos en ngOnInit)
      if (!this.encuestaId) {
        this.snack.open('No hay encuestas disponibles en este momento. Por favor, contactá al administrador.', 'Cerrar', { duration: 6000 });
        return;
      }

      // 4) Insertar respuesta principal en respuestas_encuesta
      const { data: respuestaEncuesta, error: insertErr } = await this.supabaseSvc.client
        .schema('esquema_juegos')
        .from('respuestas_encuesta')
        .insert({
          encuesta_id: this.encuestaId!,
          usuario_id: usuarioId,
          nombre_apellido: (this.form.value.nombreApellido as string).trim(),
          edad: Number(this.form.value.edad),
          telefono: (this.form.value.telefono as string).trim()
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      // 5) Guardar respuestas de preguntas en respuestas_pregunta
      const preguntas = this.preguntas();
      const respuestasPregunta: Array<{
        respuesta_encuesta_id: number;
        pregunta_id: number;
        opcion_id: number | null;
        valor_texto: string | null;
      }> = [];

      for (const pregunta of preguntas) {
        const controlName = `pregunta_${pregunta.id}`;
        const controlValue = this.form.get(controlName)?.value;

        if (pregunta.tipo_control === 'checkbox') {
          // Para checkbox, guardar cada opción seleccionada
          const formArray = this.getPreguntaFormArray(pregunta.id);
          pregunta.opciones.forEach((opcion, index) => {
            if (formArray.at(index).value === true) {
              respuestasPregunta.push({
                respuesta_encuesta_id: respuestaEncuesta.id,
                pregunta_id: pregunta.id,
                opcion_id: opcion.id,
                valor_texto: null
              });
            }
          });
        } else if (pregunta.tipo_control === 'radio') {
          // Para radio, buscar la opción seleccionada
          const opcionSeleccionada = pregunta.opciones.find(op => op.valor === controlValue);
          if (opcionSeleccionada) {
            respuestasPregunta.push({
              respuesta_encuesta_id: respuestaEncuesta.id,
              pregunta_id: pregunta.id,
              opcion_id: opcionSeleccionada.id,
              valor_texto: null
            });
          }
        } else {
          // Para textbox, guardar el texto libre
          respuestasPregunta.push({
            respuesta_encuesta_id: respuestaEncuesta.id,
            pregunta_id: pregunta.id,
            opcion_id: null,
            valor_texto: (controlValue as string)?.trim() || null
          });
        }
      }

      // Insertar todas las respuestas
      if (respuestasPregunta.length > 0) {
        const { error: respuestasError } = await this.supabaseSvc.client
          .schema('esquema_juegos')
          .from('respuestas_pregunta')
          .insert(respuestasPregunta);

        if (respuestasError) {
          console.error('Error guardando respuestas de preguntas:', respuestasError);
          // No lanzamos error aquí para no perder la respuesta principal
        }
      }

      this.snack.open('¡Gracias! Encuesta enviada correctamente.', 'OK', { duration: 3000 });
      this.form.reset();
      // Reconstruir formulario para resetear checkboxes dinámicos
      this.construirFormulario(this.preguntas());

    } catch (e: any) {
      console.error(e);
      this.snack.open(e?.message || e?.error_description || 'Error al guardar', 'Cerrar', { duration: 5000 });
    } finally {
      this.enviando = false;
    }
  }


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


