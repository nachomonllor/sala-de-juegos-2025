
// question.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Question {
  question: string;
  answer: string;
}

// export interface QuestionsData {
//   historia: Question[];
//   geografia: Question[];
//   arte: Question[];
//   // Podrás agregar más categorías luego.
// }

export interface QuestionsData {
  [key: string]: Question[];
  historia: Question[];
  geografia: Question[];
  arte: Question[];
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionsUrl = 'assets/questions.json';

  constructor(private http: HttpClient) { }

  getQuestionsData(): Observable<QuestionsData> {
    return this.http.get<QuestionsData>(this.questionsUrl);
  }

}


// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class QuestionService {

//   constructor() { }
// }

