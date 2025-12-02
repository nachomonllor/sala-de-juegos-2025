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
  // async onSubmit(): Promise<void> {
  //   if (this.form.invalid) {
  //     this.markAllAsTouched(this.form);
  //     return;
  //   }

  //   this.enviando = true;
  //   try {
  //     // 1) Verificar sesión
  //     const { data, error } = await this.supabaseSvc.client.auth.getSession();
  //     if (error) throw error;

  //     const session = data?.session;
  //     if (!session?.user) {
  //       this.snack.open('Iniciá sesión para enviar la encuesta', 'OK', { duration: 4000 });
  //       return;
  //     }
  //     const user = session.user;

  //     // 2) Obtener usuario_id de esquema_juegos.usuarios
  //     const usuarioId = await this.supabaseSvc.getUsuarioIdFromSupabaseUid(user.id);

  //     // 3) Obtener encuesta activa (usar la que ya cargamos en ngOnInit)
  //     if (!this.encuestaId) {
  //       this.snack.open('No hay encuestas disponibles en este momento. Por favor, contactá al administrador.', 'Cerrar', { duration: 6000 });
  //       return;
  //     }

  //     // 4) Insertar respuesta principal en respuestas_encuesta
  //     const { data: respuestaEncuesta, error: insertErr } = await this.supabaseSvc.client
  //       .schema('esquema_juegos')
  //       .from('respuestas_encuesta')
  //       .insert({
  //         encuesta_id: this.encuestaId!,
  //         usuario_id: usuarioId,
  //         nombre_apellido: (this.form.value.nombreApellido as string).trim(),
  //         edad: Number(this.form.value.edad),
  //         telefono: (this.form.value.telefono as string).trim()
  //       })
  //       .select('id')
  //       .single();

  //     if (insertErr) throw insertErr;

  //     // 5) Guardar respuestas de preguntas en respuestas_pregunta
  //     const preguntas = this.preguntas();
  //     const respuestasPregunta: Array<{
  //       respuesta_encuesta_id: number;
  //       pregunta_id: number;
  //       opcion_id: number | null;
  //       valor_texto: string | null;
  //     }> = [];

  //     for (const pregunta of preguntas) {
  //       const controlName = `pregunta_${pregunta.id}`;
  //       const controlValue = this.form.get(controlName)?.value;

  //       if (pregunta.tipo_control === 'checkbox') {
  //         // Para checkbox, guardar cada opción seleccionada
  //         const formArray = this.getPreguntaFormArray(pregunta.id);
  //         pregunta.opciones.forEach((opcion, index) => {
  //           if (formArray.at(index).value === true) {
  //             respuestasPregunta.push({
  //               respuesta_encuesta_id: respuestaEncuesta.id,
  //               pregunta_id: pregunta.id,
  //               opcion_id: opcion.id,
  //               valor_texto: null
  //             });
  //           }
  //         });
  //       } else if (pregunta.tipo_control === 'radio') {
  //         // Para radio, buscar la opción seleccionada
  //         const opcionSeleccionada = pregunta.opciones.find(op => op.valor === controlValue);
  //         if (opcionSeleccionada) {
  //           respuestasPregunta.push({
  //             respuesta_encuesta_id: respuestaEncuesta.id,
  //             pregunta_id: pregunta.id,
  //             opcion_id: opcionSeleccionada.id,
  //             valor_texto: null
  //           });
  //         }
  //       } else {
  //         // Para textbox, guardar el texto libre
  //         respuestasPregunta.push({
  //           respuesta_encuesta_id: respuestaEncuesta.id,
  //           pregunta_id: pregunta.id,
  //           opcion_id: null,
  //           valor_texto: (controlValue as string)?.trim() || null
  //         });
  //       }
  //     }

  //     // Insertar todas las respuestas
  //     if (respuestasPregunta.length > 0) {
  //       const { error: respuestasError } = await this.supabaseSvc.client
  //         .schema('esquema_juegos')
  //         .from('respuestas_pregunta')
  //         .insert(respuestasPregunta);

  //       if (respuestasError) {
  //         console.error('Error guardando respuestas de preguntas:', respuestasError);
  //         // No lanzamos error aquí para no perder la respuesta principal
  //       }
  //     }

  //     this.snack.open('¡Gracias! Encuesta enviada correctamente.', 'OK', { duration: 3000 });
  //     this.form.reset();
  //     // Reconstruir formulario para resetear checkboxes dinámicos
  //     this.construirFormulario(this.preguntas());

  //   } catch (e: any) {
  //     console.error(e);
  //     this.snack.open(e?.message || e?.error_description || 'Error al guardar', 'Cerrar', { duration: 5000 });
  //   } finally {
  //     this.enviando = false;
  //   }
  // }



    async onSubmit(): Promise<void> {
    // Validación inicial del formulario
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
      // (Asumiendo que este método existe en tu servicio y devuelve el ID numérico)
      const usuarioId = await this.supabaseSvc.getUsuarioIdFromSupabaseUid(user.id);

      // 3) Obtener encuesta activa
      if (!this.encuestaId) {
        this.snack.open('No hay encuestas disponibles. Contactá al administrador.', 'Cerrar', { duration: 6000 });
        return;
      }

      // 4) Insertar CABECERA (respuestas_encuesta)
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

      // 5) Preparar DETALLES (respuestas_pregunta)
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
          // Checkbox: guardar cada opción marcada (true)
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
          // Radio: buscar la opción que coincide con el valor seleccionado
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
          // Textbox: guardar el texto directo
          respuestasPregunta.push({
            respuesta_encuesta_id: respuestaEncuesta.id,
            pregunta_id: pregunta.id,
            opcion_id: null,
            valor_texto: (controlValue as string)?.trim() || null
          });
        }
      }

      // Insertar todos los detalles en lote
      if (respuestasPregunta.length > 0) {
        const { error: respuestasError } = await this.supabaseSvc.client
          .schema('esquema_juegos')
          .from('respuestas_pregunta')
          .insert(respuestasPregunta);

        if (respuestasError) {
          console.error('Error guardando detalles de encuesta:', respuestasError);
          // IMPORTANTE: Lanzamos el error para que el catch lo capture y avise al usuario
          throw new Error('Se guardaron tus datos básicos, pero hubo un error al guardar las respuestas específicas.');
        }
      }

      // 6) Éxito
      this.snack.open('¡Gracias! Encuesta enviada correctamente.', 'OK', { duration: 3000 });
      this.form.reset();
      this.construirFormulario(this.preguntas()); // Resetear visualmente los validadores

    } catch (e: any) {
      console.error(e);
      // Muestra el error en el SnackBar o donde prefieras
      const msg = e.message || e.error_description || 'Error desconocido al guardar';
      this.snack.open(msg, 'Cerrar', { duration: 5000 });
    } finally {
      this.enviando = false;
    }
  }




}



