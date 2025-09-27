import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ResultsService } from '../services/results.service';
import { ResultRow } from '../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.css']
})
export class ResultsListComponent implements OnInit {
  results$!: Observable<ResultRow[]>;   // 👈 ahora existe y está tipado

  constructor(private readonly resultsService: ResultsService) {}

  ngOnInit(): void {
    // Si querés solo los tuyos: this.results$ = from(this.resultsService.listMy());
    this.results$ = this.resultsService.getAllResults(); // usa el método que agregamos
  }
}





// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Observable } from 'rxjs';
// import { ResultsService } from '../services/results.service';
// import { GameResult } from '../models/result.models';

// @Component({
//   selector: 'app-results-list',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './results-list.component.html',
//   styleUrls: ['./results-list.component.css']
// })
// export class ResultsListComponent implements OnInit {
//   // results$: Observable<GameResult[]> | undefined;

//   // constructor(private resultsService: ResultsService) {
//   //     this.results$ = this.resultsService.getAllResults();
//   // }

//   ngOnInit(): void {
//     // Nada adicional aquí; el observable ya está listo
//   }
// }


// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-results-list',
// //   imports: [],
// //   templateUrl: './results-list.component.html',
// //   styleUrl: './results-list.component.css'
// // })
// // export class ResultsListComponent {

// // }

