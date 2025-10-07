// ResultsListComponent (arriba de todo)
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Component, signal, computed, effect, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { ScoreService } from '../services/score.service';
import { SupabaseService } from '../services/supabase.service';
import { GameCode, ScoreWithUser } from '../models/resultados';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [
    CommonModule,
    // Material
    MatCardModule, MatToolbarModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule,
    MatIconModule, MatButtonModule, MatProgressBarModule
  ],
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.css']
})
export class ResultsListComponent implements AfterViewInit {

  juegos: GameCode[] = ['ahorcado', 'mayor_menor', 'flow_free', 'preguntados_dbz'];
  juegoSeleccionado = signal<GameCode | 'todos'>('todos');

  cargando = signal(false);
  error = signal<string | null>(null);

  soloMios = signal(false);
  currentUserId = signal<string | null>(null);

  /** Texto del input de búsqueda (tabla) */
  textoFiltro = signal<string>('');

  /** Todos los resultados crudos */
  private todos = signal<ScoreWithUser[]>([]);

  /** Resultados filtrados por juego + “solo míos” (antes de la tabla) */
  resultados = computed(() => {
    const filtroJuego = this.juegoSeleccionado();
    const mios = this.soloMios();
    const uid = this.currentUserId();
    return this.todos().filter(r =>
      (filtroJuego === 'todos' || r.gameCode === filtroJuego) &&
      (!mios || (uid !== null && r.userId === uid))
    );
  });

  /** Angular Material Table */
  columnas: (keyof ScoreWithUser)[] = ['createdAt', 'userDisplayName', 'gameCode', 'points', 'durationSec'];
  dataSource = new MatTableDataSource<ScoreWithUser>([]);

  // dentro de ResultsListComponent
modoFondo: 'solid' | 'glass' = 'solid'; // por defecto legible

toggleFondo() {
  this.modoFondo = this.modoFondo === 'solid' ? 'glass' : 'solid';
}


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private scores: ScoreService,
    private route: ActivatedRoute,
    private supa: SupabaseService
  ) {
    // Lee ?me=1|true
    this.route.queryParamMap.subscribe(p => {
      const me = p.get('me');
      this.soloMios.set(me === '1' || me === 'true');
    });

    // Usuario autenticado (id)
    this.supa.client.auth.getUser().then(({ data: { user } }) => {
      this.currentUserId.set(user?.id ?? null);
    });

    // Mantener sincronizada la tabla con los resultados
    effect(() => {
      this.dataSource.data = this.resultados();
      // filtro de texto (global)
      this.dataSource.filter = this.textoFiltro().trim().toLowerCase();
    });

    // Filtro por múltiples campos
    this.dataSource.filterPredicate = (data, filter) => {
      const blob =
        `${data.userDisplayName} ${data.gameCode} ${data.points} ${data.durationSec ?? ''} ${data.createdAt}`
        .toString()
        .toLowerCase();
      return blob.includes(filter);
    };

    this.refrescar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // --- UI handlers ---

  onJuegoChangeSelect(val: GameCode | 'todos') {
    this.juegoSeleccionado.set(val);
    // Reseteo a primera página cuando cambio filtros
    if (this.paginator) this.paginator.firstPage();
  }

  onTextoFiltro(ev: Event) {
    const value = (ev.target as HTMLInputElement).value ?? '';
    this.textoFiltro.set(value);
    if (this.paginator) this.paginator.firstPage();
  }

  limpiarFiltro() {
    this.textoFiltro.set('');
  }

  async refrescar() {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const all = await this.scores.listRecent(200);
      this.todos.set(all);
    } catch (e: any) {
      console.error(e);
      this.error.set(e?.message ?? 'Error al cargar resultados');
    } finally {
      this.cargando.set(false);
    }
  }
}



// import { Component, signal, effect, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ScoreService } from '../services/score.service';
// import { GameCode, ScoreWithUser } from '../models/resultados';
// import { ActivatedRoute } from '@angular/router';
// import { SupabaseService } from '../services/supabase.service';

// // ResultsListComponent (arriba de todo)
// import { MatCardModule } from '@angular/material/card';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatTableModule, MatTableDataSource } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSortModule } from '@angular/material/sort';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatProgressBarModule } from '@angular/material/progress-bar';


// @Component({
//   selector: 'app-results-list',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './results-list.component.html',
//   styleUrls: ['./results-list.component.css']
// })
// export class ResultsListComponent {

//   juegos: GameCode[] = ['ahorcado', 'mayor_menor', 'flow_free', 'preguntados_dbz'];
//   juegoSeleccionado = signal<GameCode | 'todos'>('todos');

//   cargando = signal(false);
//   error = signal<string | null>(null);
  
//   soloMios = signal(false);
//   currentUserId = signal<string | null>(null);

//   // todos los resultados desde Supabase
//   private todos = signal<ScoreWithUser[]>([]);

//   resultados = computed(() => {
//     const filtro = this.juegoSeleccionado();
//     const mios = this.soloMios();
//     const uid = this.currentUserId();
//     return this.todos().filter(r =>
//       (filtro === 'todos' || r.gameCode === filtro) &&
//       (!mios || (uid !== null && r.userId === uid))
//     );
//   });

//   constructor(
//     private scores: ScoreService,
//     private route: ActivatedRoute,
//     private supa: SupabaseService
//   ) {
//     // Lee ?me=1|true
//     this.route.queryParamMap.subscribe(p => {
//       const me = p.get('me');
//       this.soloMios.set(me === '1' || me === 'true');
//     });

//     // Obtiene el userId actual
//     this.supa.client.auth.getUser().then(({ data: { user } }) => {
//       this.currentUserId.set(user?.id ?? null);
//     });

//     this.refrescar();
//   }

//   onJuegoChange(ev: Event) {
//     const val = (ev.target as HTMLSelectElement).value as 'todos' | GameCode;
//     this.juegoSeleccionado.set(val);
//   }

//   async refrescar() {
//     this.cargando.set(true);
//     this.error.set(null);
//     try {
//       const all = await this.scores.listRecent(200);
//       this.todos.set(all);
//     } catch (e: any) {
//       console.error(e);
//       this.error.set(e?.message ?? 'Error al cargar resultados');
//     } finally {
//       this.cargando.set(false);
//     }
//   }

// }



