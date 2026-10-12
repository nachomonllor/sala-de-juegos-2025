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
import { MatChipsModule } from '@angular/material/chips';
import { LogsJuegosService } from '../services/logs-juegos.service';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [
    CommonModule,

    MatCardModule, MatToolbarModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule,
    MatIconModule, MatButtonModule, MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.css']
})
export class ResultsListComponent implements AfterViewInit {

  juegos: GameCode[] = ['ahorcado', 'mayor_menor', 'flow_free', 'preguntados_dbz', 'escultor',
    'bloxorz', 'river_run', 'lightbot', 'sokoban', 'cube_crash', 'cube_move', 'neon_slide', 'neon_shapes', 'rayland'];
  juegoSeleccionado = signal<GameCode | 'todos'>('todos');

  cargando = signal(false);
  error = signal<string | null>(null);

  soloMios = signal(false);
  currentUserId = signal<string | null>(null);

  textoFiltro = signal<string>('');

  private todos = signal<ScoreWithUser[]>([]);

  resultados = computed(() => {
    const filtroJuego = this.juegoSeleccionado();
    const mios = this.soloMios();
    const uid = this.currentUserId();
    return this.todos().filter(r =>
      (filtroJuego === 'todos' || r.gameCode === filtroJuego) &&
      (!mios || (uid !== null && r.userId === uid))
    );
  });

  columnas: (keyof ScoreWithUser)[] = ['createdAt', 'userDisplayName', 'gameCode', 'points', 'durationSec'];
  dataSource = new MatTableDataSource<ScoreWithUser>([]);

modoFondo: 'solid' | 'glass' = 'solid';

toggleFondo() {
  this.modoFondo = this.modoFondo === 'solid' ? 'glass' : 'solid';
}

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private scores: ScoreService,
    private route: ActivatedRoute,
    private supa: SupabaseService,

  ) {

    this.route.queryParamMap.subscribe(p => {
      const me = p.get('me');
      this.soloMios.set(me === '1' || me === 'true');
    });

    this.supa.client.auth.getUser().then(({ data: { user } }) => {
      this.currentUserId.set(user?.id ?? null);
    });

    effect(() => {
      this.dataSource.data = this.resultados();

      this.dataSource.filter = this.textoFiltro().trim().toLowerCase();
    });

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

  onJuegoChangeSelect(val: GameCode | 'todos') {
    this.juegoSeleccionado.set(val);

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

// import { Component, signal, computed, effect, ViewChild, AfterViewInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';

// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';

// import { ScoreService } from '../services/score.service';
// import { SupabaseService } from '../services/supabase.service';
// import { GameCode, ScoreWithUser } from '../models/resultados';
// import { MatChipsModule } from '@angular/material/chips';
// import { LogsJuegosService } from '../services/logs-juegos.service';

// @Component({
//   selector: 'app-results-list',
//   standalone: true,
//   imports: [
//     CommonModule,

//     MatCardModule, MatToolbarModule, MatTableModule, MatPaginatorModule, MatSortModule,
//     MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule,
//     MatIconModule, MatButtonModule, MatProgressBarModule,
//     MatChipsModule
//   ],
//   templateUrl: './results-list.component.html',
//   styleUrls: ['./results-list.component.css']
// })
// export class ResultsListComponent implements AfterViewInit {

//   juegos: GameCode[] = ['ahorcado', 'mayor_menor', 'flow_free', 'preguntados_dbz', 'escultor'];
//   juegoSeleccionado = signal<GameCode | 'todos'>('todos');

//   cargando = signal(false);
//   error = signal<string | null>(null);

//   soloMios = signal(false);
//   currentUserId = signal<string | null>(null);

//   textoFiltro = signal<string>('');

//   private todos = signal<ScoreWithUser[]>([]);

//   resultados = computed(() => {
//     const filtroJuego = this.juegoSeleccionado();
//     const mios = this.soloMios();
//     const uid = this.currentUserId();
//     return this.todos().filter(r =>
//       (filtroJuego === 'todos' || r.gameCode === filtroJuego) &&
//       (!mios || (uid !== null && r.userId === uid))
//     );
//   });

//   columnas: (keyof ScoreWithUser)[] = ['createdAt', 'userDisplayName', 'gameCode', 'points', 'durationSec'];
//   dataSource = new MatTableDataSource<ScoreWithUser>([]);

// modoFondo: 'solid' | 'glass' = 'solid';

// toggleFondo() {
//   this.modoFondo = this.modoFondo === 'solid' ? 'glass' : 'solid';
// }

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   constructor(
//     private scores: ScoreService,
//     private route: ActivatedRoute,
//     private supa: SupabaseService,

//   ) {

//     this.route.queryParamMap.subscribe(p => {
//       const me = p.get('me');
//       this.soloMios.set(me === '1' || me === 'true');
//     });

//     this.supa.client.auth.getUser().then(({ data: { user } }) => {
//       this.currentUserId.set(user?.id ?? null);
//     });

//     effect(() => {
//       this.dataSource.data = this.resultados();

//       this.dataSource.filter = this.textoFiltro().trim().toLowerCase();
//     });

//     this.dataSource.filterPredicate = (data, filter) => {
//       const blob =
//         `${data.userDisplayName} ${data.gameCode} ${data.points} ${data.durationSec ?? ''} ${data.createdAt}`
//         .toString()
//         .toLowerCase();
//       return blob.includes(filter);
//     };

//     this.refrescar();
//   }

//   ngAfterViewInit(): void {
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }

//   onJuegoChangeSelect(val: GameCode | 'todos') {
//     this.juegoSeleccionado.set(val);

//     if (this.paginator) this.paginator.firstPage();

//   }

//   onTextoFiltro(ev: Event) {
//     const value = (ev.target as HTMLInputElement).value ?? '';
//     this.textoFiltro.set(value);
//     if (this.paginator) this.paginator.firstPage();
//   }

//   limpiarFiltro() {
//     this.textoFiltro.set('');
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



