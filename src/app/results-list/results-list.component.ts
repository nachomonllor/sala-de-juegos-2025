
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ResultsService } from '../services/results.service';
import { GameResult } from '../models/result.models';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.css']
})
export class ResultsListComponent implements OnInit {
  results$: Observable<GameResult[]>;

  constructor(private resultsService: ResultsService) {
    this.results$ = this.resultsService.getAllResults();
  }

  ngOnInit(): void {
    // Nada adicional aquí; el observable ya está listo
  }
}


// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-results-list',
//   imports: [],
//   templateUrl: './results-list.component.html',
//   styleUrl: './results-list.component.css'
// })
// export class ResultsListComponent {

// }

