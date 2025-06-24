import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  // Apunta al JSON estático en assets
  private fileUrl = 'assets/questions.json';

  constructor(private http: HttpClient) {}

  getQuestion(theme: string): Observable<Question> {
    return this.http.get<Question[]>(this.fileUrl).pipe(
      // Filtra por tema
      map(list => list.filter(q => q.theme === theme)),
      // Elige una al azar
      map(list => {
        if (!list.length) {
          throw new Error(`No hay preguntas para el tema "${theme}"`);
        }
        const idx = Math.floor(Math.random() * list.length);
        return list[idx];
      })
    );
  }
}
