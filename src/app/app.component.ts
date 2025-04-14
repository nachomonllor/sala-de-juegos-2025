import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PantallaJuegosComponent } from "./pantalla-juegos/pantalla-juegos.component";
import { HomeComponent } from "./home/home.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, PantallaJuegosComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
 
export class AppComponent {
  title = 'input-pipe-prueba';

  userCase: string = '';

}
