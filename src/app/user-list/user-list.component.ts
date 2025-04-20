import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { MatTableModule }  from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule }           from '@angular/material/sort';
import { MatCardModule }    from '@angular/material/card';
import { MatRippleModule }  from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { GameSessions, User } from '../models/user.models';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatRippleModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns = ['firstName','lastName','email','gamePlays'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users: User[]) => {
      this.dataSource.data = users;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort      = this.sort;
    });
  }

    /**
   * Convierte el objeto gamePlays en un array de pares { key, value }
   * con el tipo correctamente inferido.
   */
    getGamePlays(user: User): Array<{ key: string; value: GameSessions }> {
      return Object.entries(user.gamePlays).map(([key, value]) => ({
        key,
        value
      }));
    }


}


// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-user-list',
//   imports: [],
//   templateUrl: './user-list.component.html',
//   styleUrl: './user-list.component.css'
// })
// export class UserListComponent {

// }
