import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-quien-soy-fab',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './quien-soy-fab.component.html',
  styleUrls: ['./quien-soy-fab.component.css']
})
export class QuienSoyFabComponent {
  private router = inject(Router);

  // Páginas donde NO debe mostrarse
  private hidden = ['/quien-soy', '/login', '/register'];

  visible = true;

  constructor() {
    // estado inicial
    this.visible = !this.hidden.some(p => this.router.url.startsWith(p));

    // actualizar al navegar
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects ?? e.url ?? '';
        this.visible = !this.hidden.some(p => url.startsWith(p));
      });
  }
}


// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-quien-soy-fab',
//   imports: [],
//   templateUrl: './quien-soy-fab.component.html',
//   styleUrl: './quien-soy-fab.component.css'
// })
// export class QuienSoyFabComponent {
// }