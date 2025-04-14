import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pantalla-juegos',
  standalone: true,
  imports: [RouterModule, HttpClientModule],
  templateUrl: './pantalla-juegos.component.html',
  styleUrls: ['./pantalla-juegos.component.css']
})
export class PantallaJuegosComponent {
  constructor() { }
}
