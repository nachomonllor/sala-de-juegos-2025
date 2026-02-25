import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogsJuegosService } from '../services/logs-juegos.service';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './quien-soy.component.html',
  styleUrl: './quien-soy.component.css'
})
export class QuienSoyComponent {

  constructor(private logService: LogsJuegosService) { }

  ngOnInit(): void {
    this.logService.registrarLog(
      'supa-uid-placeholder', // Aquí deberías pasar el UID real del usuario
      true, // Asumimos que cargar la página es un evento exitoso
      'QuienSoyComponent',
      'ngOnInit',
      'Ingresó a la página "Quién Soy"'
    );
  }

}
