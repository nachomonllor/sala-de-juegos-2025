import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HomeFabComponent } from "./home-fab/home-fab.component";
import { QuienSoyFabComponent } from "./quien-soy-fab/quien-soy-fab.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule, RouterOutlet, HomeFabComponent, QuienSoyFabComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
 
export class AppComponent {
  title = 'input-pipe-prueba';

  userCase: string = '';

}
