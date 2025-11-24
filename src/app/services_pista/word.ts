import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WordEntry {
  text: string;
  hint: string;
  category: string;
  display?: string;
}

@Injectable({ providedIn: 'root' })
export class WordService {
  private readonly url = '/assets/data/palabras.json';

  constructor(private http: HttpClient) {}

  getRandomWord(): Observable<WordEntry> {
    return this.http.get<{palabras: WordEntry[]}>(this.url).pipe(
      map(db => {
        const idx = Math.floor(Math.random() * db.palabras.length);
        return db.palabras[idx];
      })
    );
  }
}


// import { Injectable } from '@angular/core';
// @Injectable({
//   providedIn: 'root'
// })
// export class Word {
// }