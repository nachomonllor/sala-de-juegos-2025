import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
export class HomeComponent {
  search = '';
  activeCategory: Category = 'Todos';

  categories: Category[] = ['Todos', 'Arcade', 'Puzzles', 'Trivia', 'Cartas', 'Clásicos'];

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

  games: Game[] = [
    { title: 'Ahorcado',        route: '/games/ahorcado',           thumb: 'assets/games/ahorcado.jpg',         category: 'Puzzles', description: 'Adivina la palabra antes de que sea tarde.',   tags: ['ahorcado', 'palabras'], badge: 'Popular' },
    { title: 'Mayor o Menor',   route: '/games/mayor-menor',        thumb: 'assets/games/mayor-menor.jpg',      category: 'Cartas',  description: '¿Mayor o menor? Probá tu intuición.',          tags: ['cartas', 'azar'], },
    { title: 'Preguntados DBZ', route: '/games/preguntados-dbz',    thumb: 'assets/games/preguntados-dbz.jpg',  category: 'Trivia',  description: 'Demostr\u00e1 cuánto sabés de Dragon Ball Z.', tags: ['trivia', 'dbz', 'anime'], badge: 'Nuevo',},
    { title: 'Flow Free',       route: '/games/flowfree',           thumb: 'assets/games/flowfree.jpg',         category: 'Puzzles', description: 'Conectá pares sin cruzar caminos.',            tags: ['puzzle', 'rutas'],},
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
