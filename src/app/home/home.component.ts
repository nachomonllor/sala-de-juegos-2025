import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

    // Simulación: en un proyecto real estos datos vendrían, por ejemplo, de un AuthService.
    isLoggedIn: boolean = false;
    username: string = 'Juan Pérez';
  
    // Diccionario: clave = nombre del juego, valor = ruta o link
    games: { [key: string]: string } = {
      'Ahorcado': 'ahorcado',
      'Mayor o Menor': 'mayor-menor',
      'Preguntados': 'preguntados',
      'FlowFree': 'flowfree'
    };
  
    logout(): void {
      // Aquí iría la lógica real para cerrar la sesión.
      this.isLoggedIn = false;
      console.log('Usuario deslogueado');
    }
}
