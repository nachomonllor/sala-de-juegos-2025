
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserListComponent } from '../user-list/user-list.component';
import { AuthService, User } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, UserListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  user$!: Observable<User | null>;          // ← sin inicializar aquí
  originalOrder = () => 0;

  games: { [key: string]: string } = {
    'Ahorcado': 'ahorcado',
    'Mayor o Menor': 'mayor-menor',
    'Preguntados': 'preguntados',
    'FlowFree': 'flowfree'
  };

  constructor(private readonly authService: AuthService) {
    this.user$ = this.authService.user$;   // ← asignar aquí
  }

  logout(): void {
    this.authService.logout();
  }
}




// // src/app/home/home.component.ts
// import { Component, OnInit }      from '@angular/core';
// import { CommonModule }            from '@angular/common';
// import { RouterModule }            from '@angular/router';
// import { UserListComponent }       from '../user-list/user-list.component';
// import { AuthService, User }       from '../services/auth.service';

// @Component({
//   selector: 'app-home',
//   standalone: true,                     // ← imprescindible para imports
//   imports: [CommonModule, RouterModule, UserListComponent],
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']  // ← corregido: debe ser styleUrls
// })
// export class HomeComponent implements OnInit {
//   isLoggedIn   = false;
//   userEmail: string | null = null;

//   // Diccionario: nombre del juego → ruta
//   games: { [key: string]: string } = {
//     'Ahorcado':      'ahorcado',
//     'Mayor o Menor': 'mayor-menor',
//     'Preguntados':   'preguntados',
//     'FlowFree':      'flowfree'
//   };

//   constructor(private authService: AuthService) {}

//   ngOnInit(): void {
//     this.authService.user$.subscribe((user: User | null) => {
//       this.isLoggedIn = !!user;
//       this.userEmail  = user?.email || null;
//     });
//   }

//   logout(): void {
//     this.authService.logout();
//   }
// }




// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { UserListComponent } from "../user-list/user-list.component";
// import { AuthService } from '../services/auth.service'; // ajusta la ruta según tu estructura
// import {  User } from '../services/auth.service';


// @Component({
//   selector: 'app-home',
//   imports: [CommonModule, RouterModule, UserListComponent],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css'
// })

// export class HomeComponent  implements OnInit { 
//   isLoggedIn = false;
//   userEmail: string | null = null;

//   constructor(private authService: AuthService) {}

//   // Diccionario: clave = nombre del juego, valor = ruta o link
//   games: { [key: string]: string } = {
//     'Ahorcado': 'ahorcado',
//     'Mayor o Menor': 'mayor-menor',
//     'Preguntados': 'preguntados',
//     'FlowFree': 'flowfree'
//   };

//   ngOnInit(): void {
//     this.authService.user$.subscribe((user: User | null) => {
//       this.isLoggedIn = !!user;
//       this.userEmail = user?.email || null;
//     });
//   }

//   logout(): void {
//     this.authService.logout();
//   }  

// }


