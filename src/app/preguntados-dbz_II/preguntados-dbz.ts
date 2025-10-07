import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { Pregunta } from '../models/preguntados-dbz.model';
import { ResultadosService } from '../services/resultados.service';
import { PersonajesDbzService } from '../services/personajes-dbz';

@Component({
  selector: 'app-preguntados-dbz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados-dbz.html',
  styleUrls: ['./preguntados-dbz.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntadosDbzComponent {
  readonly LIMITE_RONDA = 10;

  cargando = signal(true);
  guardando = signal(false);
  finalizada = signal(false);

  //  para medir duración de la partida
  private inicioMs = signal<number>(Date.now());

  pregunta = signal<Pregunta | null>(null);
  idSeleccionado = signal<number | null>(null);

  puntaje = signal(0);
  totalPreguntas = signal(0);

  respondida = computed(() => this.idSeleccionado() !== null);
  esCorrecta = computed(() =>
    this.respondida() && this.idSeleccionado() === this.pregunta()?.correct.id
  );

  constructor(
    private servicio: PersonajesDbzService,
    private resultadosSrv: ResultadosService
  ) {
    this.inicioMs.set(Date.now());
    this.siguientePregunta();
  }

  private async finalizarPartida(): Promise<void> {
    if (this.finalizada()) return;
    this.finalizada.set(true);

    try {
      this.guardando.set(true);
      const dur = Math.round((Date.now() - this.inicioMs()) / 1000);

      const res = await this.resultadosSrv.guardarScore({
        game_code: 'preguntados_dbz',     //   snake_case  
        points: this.puntaje(),
        duration_sec: dur,
        meta: { preguntas: this.LIMITE_RONDA }
      });

      console.log('[DBZ] guardarScore ->', res);



    } finally {
      this.guardando.set(false);
    }
  }

  siguientePregunta(): void {
    if (this.totalPreguntas() >= this.LIMITE_RONDA) {
      this.finalizarPartida();
      return;
    }
    this.cargando.set(true);
    this.idSeleccionado.set(null);

    this.servicio.obtenerPreguntaAleatoria$(4)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (q) => { this.pregunta.set(q); this.totalPreguntas.update(t => t + 1); },
        error: (err) => { console.error('Error al armar la pregunta:', err); this.pregunta.set(null); }
      });
  }

  elegir(id: number): void {
    if (this.respondida()) return;
    this.idSeleccionado.set(id);
    if (this.esCorrecta()) this.puntaje.update(p => p + 1);
  }

  nuevaPartida(): void {
    this.finalizada.set(false);
    this.puntaje.set(0);
    this.totalPreguntas.set(0);
    this.pregunta.set(null);
    this.idSeleccionado.set(null);
    this.inicioMs.set(Date.now());  // reinicia CRONOMETRO
    this.siguientePregunta();
  }
}





// import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { finalize } from 'rxjs/operators';

// import { Pregunta } from '../models/preguntados-dbz.model';
// import { PersonajesDbzService } from '../services/personajes-dbz';
// // Usa el mismo servicio que en tus otros juegos:
// import { ResultadosService } from '../services/resultados.service';

// @Component({
//   selector: 'app-preguntados-dbz',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './preguntados-dbz.html',
//   styleUrls: ['./preguntados-dbz.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class PreguntadosDbzComponent {
//   readonly LIMITE_RONDA = 10;

//   cargando = signal(true);
//   guardando = signal(false);
//   finalizada = signal(false);

//   pregunta = signal<Pregunta | null>(null);
//   idSeleccionado = signal<number | null>(null);

//   puntaje = signal(0);
//   totalPreguntas = signal(0);

//   respondida = computed(() => this.idSeleccionado() !== null);
//   esCorrecta = computed(() =>
//     this.respondida() && this.idSeleccionado() === this.pregunta()?.correct.id
//   );

//   constructor(
//     private servicio: PersonajesDbzService,
//     private resultadosSrv: ResultadosService
//   ) {
//     this.siguientePregunta(); // arranca en 1/10
//   }

//   // private async finalizarPartida(): Promise<void> {
//   //   if (this.finalizada()) return;
//   //   this.finalizada.set(true);

//   //   // guardado en BD: una fila con el total de aciertos de la ronda
//   //   try {
//   //     this.guardando.set(true);
//   //     await this.resultadosSrv.guardar({
//   //       game: 'preguntados-dbz',
//   //       score: this.puntaje(),
//   //       detail: { preguntas: this.LIMITE_RONDA }
//   //     });
//   //   } finally {
//   //     this.guardando.set(false);
//   //   }
//   // }

//   private async finalizarPartida(): Promise<void> {
//     if (this.finalizada()) return;
//     this.finalizada.set(true);

//     try {
//       this.guardando.set(true);
//       const res = await this.resultadosSrv.guardar({
//         game: 'preguntados-dbz',
//         score: this.puntaje(),
//         detail: { preguntas: this.LIMITE_RONDA }
//       });
//       console.log('[DBZ] guardar resultado:', res);
//     } finally {
//       this.guardando.set(false);
//     }
//   }


//   siguientePregunta(): void {
//     // si ya llegamos al límite, cerramos la ronda
//     if (this.totalPreguntas() >= this.LIMITE_RONDA) {
//       this.finalizarPartida();
//       return;
//     }

//     this.cargando.set(true);
//     this.idSeleccionado.set(null);

//     this.servicio
//       .obtenerPreguntaAleatoria$(4)
//       .pipe(finalize(() => this.cargando.set(false)))
//       .subscribe({
//         next: (q) => {
//           this.pregunta.set(q);
//           this.totalPreguntas.update(t => t + 1);
//         },
//         error: (err) => {
//           console.error('Error al armar la pregunta:', err);
//           this.pregunta.set(null);
//         }
//       });
//   }

//   elegir(id: number): void {
//     if (this.respondida()) return;
//     this.idSeleccionado.set(id);
//     if (this.esCorrecta()) this.puntaje.update(p => p + 1);
//   }

//   nuevaPartida(): void {
//     // resetea todo y arranca otra ronda
//     this.finalizada.set(false);
//     this.puntaje.set(0);
//     this.totalPreguntas.set(0);
//     this.pregunta.set(null);
//     this.idSeleccionado.set(null);
//     this.siguientePregunta();
//   }


// }






// // import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { Pregunta } from '../models/preguntados-dbz.model';
// // import { finalize } from 'rxjs/operators';
// // import { PersonajesDbzService } from '../services/personajes-dbz';
// // import { ResultadosService } from '../services/resultados.service';

// // @Component({
// //   selector: 'app-preguntados-dbz',
// //   standalone: true,
// //   imports: [CommonModule],
// //   templateUrl: './preguntados-dbz.html',
// //   styleUrls: ['./preguntados-dbz.css'],
// //   changeDetection: ChangeDetectionStrategy.OnPush,
// // })
// // export class PreguntadosDbzComponent {
// //   cargando = signal(true);
// //   pregunta = signal<Pregunta | null>(null);
// //   idSeleccionado = signal<number | null>(null);
// //   puntaje = signal(0);
// //   totalPreguntas = signal(0);

// //   respondida = computed(() => this.idSeleccionado() !== null);
// //   esCorrecta = computed(() =>
// //     this.respondida() && this.idSeleccionado() === this.pregunta()?.correct.id
// //   );

// //   constructor(private servicio: PersonajesDbzService, private resultadosSrv: ResultadosService,) {
// //     this.siguientePregunta();
// //   }

// //   siguientePregunta(): void {
// //     this.cargando.set(true);
// //     this.idSeleccionado.set(null);

// //     this.servicio
// //       .obtenerPreguntaAleatoria$(4)
// //       .pipe(finalize(() => this.cargando.set(false)))
// //       .subscribe({
// //         next: (q) => {
// //           this.pregunta.set(q);
// //           this.totalPreguntas.update(t => t + 1);
// //         },
// //         error: (err) => {
// //           console.error('Error al armar la pregunta:', err);
// //           this.pregunta.set(null);
// //         }
// //       });
// //   }


// //   async elegir(id: number): Promise<void> {
// //     if (this.respondida()) return;
// //     this.idSeleccionado.set(id);

// //     // suma local inmediata
// //     if (this.esCorrecta()) {
// //       this.puntaje.update(p => p + 1);

// //       // guarda 1 punto en DB (una fila por acierto)
// //       const p = this.pregunta();
// //       await this.resultadosSrv.guardar({
// //         game: 'preguntados-dbz',
// //         score: 1,
// //         detail: {
// //           correctId: p?.correct.id,
// //           correctName: p?.correct.name,
// //           selectedId: id,
// //           options: p?.options
// //         }
// //       });
// //     }
// //   }

// //   reiniciarPuntaje(): void {
// //     this.puntaje.set(0);
// //     this.totalPreguntas.set(0);
// //   }
// // }



