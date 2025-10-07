import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreService } from '../services/score.service';
import { GameCode, ScoreWithUser } from '../models/resultados';

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

  // todos los resultados desde Supabase
  private todos = signal<ScoreWithUser[]>([]);

  // derivados por filtro (NO pega a Supabase)
  resultados = computed(() => {
    const filtro = this.juegoSeleccionado();
    const all = this.todos();
    return filtro === 'todos' ? all : all.filter(r => r.gameCode === filtro);
  });

  constructor(private scores: ScoreService) {
    this.refrescar();
  }

  async refrescar() {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const all = await this.scores.listRecent(100);
      this.todos.set(all);
    } catch (e: any) {
      console.error(e);
      this.error.set(e?.message ?? 'Error al cargar resultados');
    } finally {
      this.cargando.set(false);
    }
  }

  onJuegoChange(ev: Event) {
    const val = (ev.target as HTMLSelectElement).value as 'todos' | GameCode;
    this.juegoSeleccionado.set(val);
  }

}






