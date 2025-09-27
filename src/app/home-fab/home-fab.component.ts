
import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home-fab',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './home-fab.component.html',
  styleUrls: ['./home-fab.component.css']   // <- plural
})
export class HomeFabComponent {
  private router = inject(Router);
  private hidden = ['/home', '/login', '/register'];

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
