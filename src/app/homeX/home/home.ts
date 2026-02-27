import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { LogsJuegosService } from '../../services/logs-juegos.service';

// ajustá la ruta según tu proyecto
//type Category 

type Category = 'Todos' | 'Arcade' | 'Puzzles' | 'Trivia' | 'Cartas' | 'Clásicos';

interface Game {
  title: string;
  route: string | any[];
  thumb: string;          // ruta en assets
  category: Category | string;
  description?: string;
  tags?: string[];
  badge?: 'Nuevo' | 'Popular' | 'Actualizado' | string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  search = '';
  activeCategory: Category = 'Todos';
  categories: Category[] = ['Todos', 'Arcade', 'Puzzles', 'Trivia', 'Cartas', 'Clásicos'];

  // ▼ NUEVO
  user$!: Observable<User | null>;
  esAdmin = signal(false);

  constructor(
    private auth: AuthService,
    private supa: SupabaseService,
    private logService: LogsJuegosService
  ) {
    this.user$ = this.auth.user$;
  }

  async ngOnInit() {
    await this.verificarAdmin();

    this.logService.registrarLog(
      'supa-uid-placeholder', // Aquí deberías pasar el UID real del usuario
      true, // Asumimos que cargar la página es un evento exitoso
      'HomeComponent',
      'ngOnInit',
      'Ingresó a la página principal'
    );

  }

  async verificarAdmin() {
    const session = await this.supa.getSession();
    if (!session?.user) {
      this.esAdmin.set(false);
      return;
    }

    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('usuarios')
      .select('es_admin')
      .eq('supabase_uid', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('[Home] Error verificando admin:', error);
      this.esAdmin.set(false);
      return;
    }

    this.esAdmin.set(data?.es_admin ?? false);
  }

  logout() { this.auth.logout(); }

  // games: Game[] = [
  //   { title: 'Ahorcado', route: '/games/ahorcado', thumb: 'assets/games/ahorcado.jpg', category: 'Puzzles', description: 'Adivina la palabra antes de que sea tarde.', tags: ['ahorcado', 'palabras'], badge: 'Popular' },
  //   { title: 'Mayor o Menor', route: '/games/mayor-menor', thumb: 'assets/games/mayor-menor.jpg', category: 'Cartas', description: '¿Mayor o menor? Probá tu intuición.', tags: ['cartas', 'azar'], },
  //   { title: 'Preguntados DBZ', route: '/games/preguntados-dbz', thumb: 'assets/games/preguntados-dbz.jpg', category: 'Trivia', description: 'Demostr\u00e1 cuánto sabés de Dragon Ball Z.', tags: ['trivia', 'dbz', 'anime'], badge: 'Nuevo', },
  //   { title: 'Flow Free', route: '/games/flowfree', thumb: 'assets/games/flowfree.jpg', category: 'Puzzles', description: 'Conectá pares sin cruzar caminos.', tags: ['puzzle', 'rutas'], },
  // ];

  games: Game[] = [
    {
      title: 'Ahorcado',
      route: '/games/ahorcado',
      thumb: 'assets/games/ahorcado.jpg',
      category: 'Puzzles',
      description: 'Adivina la palabra antes de que sea tarde.',
      tags: ['ahorcado', 'palabras'],
      badge: 'Popular'
    },
    {
      title: 'Mayor o Menor',
      route: '/games/mayor-menor',
      thumb: 'assets/games/mayor-menor.jpg',
      category: 'Cartas',
      description: '¿Mayor o menor? Probá tu intuición.',
      tags: ['cartas', 'azar']
    },
    {
      title: 'Preguntados DBZ',
      route: '/games/preguntados-dbz',
      thumb: 'assets/games/preguntados-dbz.jpg',
      category: 'Trivia',
      description: 'Demostrá cuánto sabés de Dragon Ball Z.',
      tags: ['trivia', 'dbz', 'anime'],
      badge: 'Nuevo'
    },
    {
      title: 'Flow Free',
      route: '/games/flowfree',
      thumb: 'assets/games/flowfree.jpg',
      category: 'Puzzles',
      description: 'Conectá pares sin cruzar caminos.',
      tags: ['puzzle', 'rutas']
    },
    // --- ACÁ AGREGAMOS EL JUEGO NUEVO ---
    {
      title: 'BioMatch',
      route: '/games/gen-game', // Asegurate de que esta ruta coincida con la que pongas en tu app.routes.ts
      thumb: 'assets/games/biomatch.jpg', // ¡No te olvides de guardar una imagen con este nombre en tu carpeta assets!
      category: 'Ciencia',
      description: 'Uní conceptos de biología y genética evolutiva.',
      tags: ['biología', 'genética', 'unq', 'ciencia', 'drag-drop'],
      badge: 'Propio'
    },

    {
      title: 'Calculo Mental',
      route: '/games/math-game', // Asegurate de que esta ruta coincida con la que pongas en tu app.routes.ts
      thumb: 'assets/games/calc.jpg', // ¡No te olvides de guardar una imagen con este nombre en tu carpeta assets!
      category: 'Matemáticas',
      description: 'Ejercita tu mente con operaciones matemáticas rápidas.',
      tags: ['matemáticas', 'mental', 'cálculo'],

      badge: 'Propio'
    },
    // --- ACÁ AGREGAMOS WATER COLOR SORT ---
    {
      title: 'Water Sort',
      route: '/games/water-sort',
      thumb: 'assets/games/water-sort.jpg',
      category: 'Puzzles',
      description: 'Ordená los líquidos fluorescentes por color en los tubos de ensayo.',
      tags: ['puzzle', 'lógica', 'colores', 'laboratorio'],
      badge: 'Propio'
    },
    // --- ACÁ AGREGAMOS PAC-MAN NEON ---
    {
      title: 'Pac-Man Neon',
      route: '/games/pacman', // Asegurate de que coincida con tu app.routes.ts
      thumb: 'assets/games/pacman.jpg', 
      category: 'Arcade',
      description: 'El clásico comecocos rediseñado desde cero con estética cyber-neon.',
      tags: ['arcade', 'clásico', 'laberinto', 'fantasmas'],
      badge: 'Propio'
    },
    // --- ACÁ AGREGAMOS SNAKE NEON ---
    {
      title: 'Snake Neon',
      route: '/games/snake', // Asegurate de que coincida con tu app.routes.ts
      thumb: 'assets/games/snake.jpg', 
      category: 'Arcade',
      description: 'El clásico juego de la viborita rediseñado con un estilo retro-futurista.',
      tags: ['arcade', 'clásico', 'serpiente', 'retro'],
      badge: 'Propio'
    },
    {
      title: 'Hanói Neon',
      route: '/games/hanoi', 
      thumb: 'assets/games/hanoi.jpg', 
      category: 'Puzzles',
      description: 'El clásico rompecabezas matemático de la Torre de Hanói con anillos holográficos.',
      tags: ['puzzle', 'lógica', 'matemática', 'clásico'],
      badge: 'Propio'
    },
    {
      title: 'Nature Park',
      route: '/games/nature-park', 
      thumb: 'assets/games/nature-park.jpg', 
      category: 'Puzzles',
      description: '.',
      tags: ['puzzle', 'lógica', 'matemática', 'clásico'],
      badge: 'Propio'
    },
    // --- ACÁ AGREGAMOS NATURE PARK ---
    {
      title: 'Nature Park',
      route: '/games/nature-park', // Asegurate de que coincida con tu app.routes.ts
      thumb: 'assets/games/nature-park.jpg', 
      category: 'Puzzles',
      description: 'Clásico juego Match-3 de caída libre. ¡Agrupa los bloques por colores para sumar puntos!',
      tags: ['match-3', 'puzzle', 'clásico', 'retro'],
      badge: 'Prototipo'
    }
    

  ];

  get filteredGames(): Game[] {
    const byCat = this.activeCategory === 'Todos'
      ? this.games
      : this.games.filter(g => g.category === this.activeCategory);

    const term = this.search.trim().toLowerCase();
    if (!term) return byCat;

    return byCat.filter(g =>
      g.title.toLowerCase().includes(term) ||
      g.tags?.some(t => t.toLowerCase().includes(term))
    );
  }

  setCategory(cat: Category) {
    this.activeCategory = cat;
  }

  trackByTitle(_i: number, g: Game) {
    return g.title;
  }
}


// games: Game[] = [
//   {
//     title: 'Ahorcado',
//     route: 'games/ahorcado',
//     thumb: 'assets/games/ahorcado.jpg',
//     category: 'Puzzles',
//     description: 'Adivina la palabra antes de que sea tarde.',
//     tags: ['ahorcado', 'palabras'],
//     badge: 'Popular',
//   },
//   {
//     title: 'Mayor o Menor',
//     route: 'games/mayor-menor',
//     thumb: 'assets/games/mayor-menor.jpg',
//     category: 'Cartas',
//     description: '¿Mayor o menor? Probá tu intuición.',
//     tags: ['cartas', 'azar'],
//   },
//   {
//     title: 'Preguntados DBZ',
//     route: 'games/preguntados-dbz',
//     thumb: 'assets/games/preguntados-dbz.jpg',
//     category: 'Trivia',
//     description: 'Demostr\u00e1 cuánto sabés de Dragon Ball Z.',
//     tags: ['trivia', 'dbz', 'anime'],
//     badge: 'Nuevo',
//   },
//   {
//     title: 'Flow Free',
//     route: 'games/flowfree',
//     thumb: 'assets/games/flowfree.jpg',
//     category: 'Puzzles',
//     description: 'Conectá pares sin cruzar caminos.',
//     tags: ['puzzle', 'rutas'],
//   },

// ];