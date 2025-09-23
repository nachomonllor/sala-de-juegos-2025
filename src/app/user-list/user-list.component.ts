import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppUser, GameSessions } from '../models/user.models';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatRippleModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<AppUser>([]);
  displayedColumns: (keyof AppUser | 'gamePlays')[] = ['firstName', 'lastName', 'email', 'gamePlays'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users: AppUser[]) => {
      this.dataSource.data = users ?? [];
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  // Convierte el objeto gamePlays en pares { key, value } para iterar en la celda
  getGamePlays(user: AppUser): Array<{ key: string; value: GameSessions }> {
    return Object.entries(user.gamePlays ?? {}).map(([key, value]) => ({ key, value }));
  }
}


// export class UserListComponent implements OnInit {
//   dataSource = new MatTableDataSource<User>(USUARIOS); // ([]);
//   displayedColumns = ['firstName', 'lastName', 'email', 'gamePlays'];

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   constructor(private usersService: UsersService) { }

//   ngOnInit(): void {
//     this.usersService.getUsers().subscribe((users: User[]) => {
//       this.dataSource.data = users;
//       this.dataSource.paginator = this.paginator;
//       this.dataSource.sort      = this.sort;
//     });
//   }

//   /**
//    * Convierte el objeto gamePlays en un array de pares { key, value }
//    * con el tipo correctamente inferido.
//    */
//   getGamePlays(user: User): Array<{ key: string; value: GameSessions }> {
//     return Object.entries(user.gamePlays).map(([key, value]) => ({
//       key,
//       value
//     }));
//   }
// }



// --------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------

// import { Component, OnInit, ViewChild } from '@angular/core';
// import { CommonModule }    from '@angular/common';
// import { MatTableModule }  from '@angular/material/table';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatSort, MatSortModule }           from '@angular/material/sort';
// import { MatCardModule }    from '@angular/material/card';
// import { MatRippleModule }  from '@angular/material/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { GameSessions, User } from '../models/user.models';

// const DUMMY_USERS: User[] = [
//   {
//     firstName: 'Juan',
//     lastName: 'Pérez',
//     email: 'juan.perez@example.com',
//     gamePlays: {
//       Ahorcado: { '1': 100, '2': 150 },
//       Memoria:  { '1': 200 }
//     }
//   },
//   {
//     firstName: 'María',
//     lastName: 'Gómez',
//     email: 'maria.gomez@example.com',
//     gamePlays: {
//       Ahorcado: { '1': 120, '2': 180 },
//       Puzzle:   { '1':  80 }
//     }
//   }
// ];

// @Component({
//   selector: 'app-user-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatTableModule,
//     MatPaginatorModule,
//     MatSortModule,
//     MatCardModule,
//     MatRippleModule
//   ],
//   templateUrl: './user-list.component.html',
//   styleUrls: ['./user-list.component.css']
// })
// export class UserListComponent implements OnInit {
//   // Inicializamos directamente con los datos ficticios
//   dataSource = new MatTableDataSource<User>(DUMMY_USERS);
//   displayedColumns = ['firstName','lastName','email','gamePlays'];

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort)      sort!: MatSort;

//   ngOnInit(): void {
//     // Asignamos paginador y ordenamiento
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort      = this.sort;
//   }

//   /** Convierte el objeto gamePlays en un array de pares { key, value } */
//   getGamePlays(user: User): Array<{ key: string; value: GameSessions }> {
//     return Object.entries(user.gamePlays).map(([key, value]) => ({ key, value }));
//   }
// }


