import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  private wordsUrl = 'assets/palabras.json'; // Ruta al archivo JSON

  constructor(private http: HttpClient) { }

  // Método que retorna una palabra aleatoria del array
  getRandomWord(): Observable<string> {
    return this.http.get<{ palabras: string[] }>(this.wordsUrl)
      .pipe(
        map(response => {
          const words = response.palabras;
          const randomIndex = Math.floor(Math.random() * words.length);
          return words[randomIndex];
        })
      );
  }

  getAllPalabras(): Observable<string[]> {
    return this.http.get<{ palabras: string[] }>(this.wordsUrl)
      .pipe(
        map(response => response.palabras)
      );
  }

}
