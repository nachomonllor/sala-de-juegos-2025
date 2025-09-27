import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-fab',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-fab.component.html',
  styleUrl: './home-fab.component.css'
})
export class HomeFabComponent {
  
  private router = inject(Router);
  // ocultar donde no tiene sentido
  hidden = ['/home','/login','/register'];
  get visible(){ return !this.hidden.some(p => this.router.url.startsWith(p)); }
}
