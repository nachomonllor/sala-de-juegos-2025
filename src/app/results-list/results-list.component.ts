
import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreService } from '../services/score.service';
import { GameCode, ScoreWithUser } from '../models/resultados';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.css']
})
export class ResultsListComponent {

  juegos: GameCode[] = ['ahorcado', 'mayor_menor', 'flow_free', 'preguntados_dbz'];
  juegoSeleccionado = signal<GameCode | 'todos'>('todos');

  cargando = signal(false);
  error = signal<string | null>(null);
  
  soloMios = signal(false);
  currentUserId = signal<string | null>(null);

  // todos los resultados desde Supabase
  private todos = signal<ScoreWithUser[]>([]);

  resultados = computed(() => {
    const filtro = this.juegoSeleccionado();
    const mios = this.soloMios();
    const uid = this.currentUserId();
    return this.todos().filter(r =>
      (filtro === 'todos' || r.gameCode === filtro) &&
      (!mios || (uid !== null && r.userId === uid))
    );
  });

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

    // Obtiene el userId actual
    this.supa.client.auth.getUser().then(({ data: { user } }) => {
      this.currentUserId.set(user?.id ?? null);
    });

    this.refrescar();
  }

  onJuegoChange(ev: Event) {
    const val = (ev.target as HTMLSelectElement).value as 'todos' | GameCode;
    this.juegoSeleccionado.set(val);
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




// -------------


//---------------------

//   juegos: GameCode[] = ['ahorcado','mayor_menor','flow_free','preguntados_dbz'];
// juegoSeleccionado = signal<GameCode | 'todos'>('todos');

// cargando = signal(false);
// error = signal<string | null>(null);

// private todos = signal<ScoreWithUser[]>([]);

// soloMios = signal(false);
// currentUserId = signal<string | null>(null);

// resultados = computed(() => {
//   const filtro = this.juegoSeleccionado();
//   const mine = this.soloMios();
//   const uid = this.currentUserId();
//   return this.todos().filter(r =>
//     (filtro === 'todos' || r.gameCode === filtro) &&
//     (!mine || (uid !== null && r.userId === uid))
//   );
// });

// constructor(
//   private scores: ScoreService,
//   private route: ActivatedRoute,
//   private supa: SupabaseService
// ) {
//   // Lee ?me=1|true
//   this.route.queryParamMap.subscribe(p => {
//     const me = p.get('me');
//     this.soloMios.set(me === '1' || me === 'true');
//   });

//   // Obtiene el userId actual
//   this.supa.client.auth.getUser().then(({ data: { user } }) => {
//     this.currentUserId.set(user?.id ?? null);
//   });

//   this.refrescar();
// }

// onJuegoChange(ev: Event) {
//   const val = ($any(ev.target).value) as 'todos' | GameCode;
//   this.juegoSeleccionado.set(val);
// }

// async refrescar(){
//   this.cargando.set(true);
//   this.error.set(null);
//   try {
//     const all = await this.scores.listRecent(200);
//     this.todos.set(all);
//   } catch (e: any) {
//     console.error(e);
//     this.error.set(e?.message ?? 'Error al cargar resultados');
//   } finally {
//     this.cargando.set(false);
//   }
// }





// -----------------------

// import { Component, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';
// import { ScoreService } from '../services/score.service';
// import { SupabaseService } from '../services/supabase.service';
// import { GameCode, ScoreWithUser } from '../models/resultados';

// @Component({
//   selector: 'app-results-list',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './results-list.component.html',
//   styleUrls: ['./results-list.component.css']
// })
// export class ResultsListComponent {
//   juegos: GameCode[] = ['ahorcado','mayor_menor','flow_free','preguntados_dbz'];
//   juegoSeleccionado = signal<GameCode | 'todos'>('todos');

//   cargando = signal(false);
//   error = signal<string | null>(null);

//   private todos = signal<ScoreWithUser[]>([]);
//   soloMios = signal(false);
//   currentUserId = signal<string | null>(null);

//   resultados = computed(() => {
//     const filtro = this.juegoSeleccionado();
//     const mine = this.soloMios();
//     const uid = this.currentUserId();
//     return this.todos().filter(r =>
//       (filtro === 'todos' || r.gameCode === filtro) &&
//       (!mine || (uid !== null && r.userId === uid))
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
//     const val = ($any(ev.target).value) as 'todos' | GameCode;
//     this.juegoSeleccionado.set(val);
//   }

//   async refrescar(){
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











