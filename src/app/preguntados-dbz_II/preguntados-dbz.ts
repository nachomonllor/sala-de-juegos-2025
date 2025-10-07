import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Pregunta } from '../models/preguntados-dbz.model';
import { finalize } from 'rxjs/operators';
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
  cargando = signal(true);
  pregunta = signal<Pregunta | null>(null);
  idSeleccionado = signal<number | null>(null);
  puntaje = signal(0);
  totalPreguntas = signal(0);

  respondida = computed(() => this.idSeleccionado() !== null);
  esCorrecta = computed(() =>
    this.respondida() && this.idSeleccionado() === this.pregunta()?.correct.id
  );

  constructor(private servicio: PersonajesDbzService) {
    this.siguientePregunta();
  }

  siguientePregunta(): void {
    this.cargando.set(true);
    this.idSeleccionado.set(null);

    this.servicio
      .obtenerPreguntaAleatoria$(4)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (q) => {
          this.pregunta.set(q);
          this.totalPreguntas.update(t => t + 1);
        },
        error: (err) => {
          console.error('Error al armar la pregunta:', err);
          this.pregunta.set(null);
        }
      });
  }

  elegir(id: number): void {
    if (this.respondida()) return;
    this.idSeleccionado.set(id);
    if (this.esCorrecta()) this.puntaje.update(p => p + 1);
  }

  reiniciarPuntaje(): void {
    this.puntaje.set(0);
    this.totalPreguntas.set(0);
  }
}



// import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';

// import { Pregunta } from '../models/preguntados-dbz.model';
// import { finalize } from 'rxjs/operators';
// import { PersonajesDbzService } from '../services/personajes-dbz';

// @Component({
//   selector: 'app-preguntados-dbz',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './preguntados-dbz.html',
//   styleUrls: ['./preguntados-dbz.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class PreguntadosDbzComponent {
//   cargando = signal(true);
//   pregunta = signal<Pregunta | null>(null);
//   idSeleccionado = signal<number | null>(null);
//   puntaje = signal(0);
//   totalPreguntas = signal(0);

//   respondida = computed(() => this.idSeleccionado() !== null);
//   esCorrecta = computed(() =>
//     this.respondida() && this.idSeleccionado() === this.pregunta()?.correct.id
//   );

//   constructor(private servicio: PersonajesDbzService) {
//     this.siguientePregunta();
//   }

//   siguientePregunta(): void {
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

//   reiniciarPuntaje(): void {
//     this.puntaje.set(0);
//     this.totalPreguntas.set(0);
//   }

// }


