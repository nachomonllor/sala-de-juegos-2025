import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Character, PaginatedResponse, Question } from '../preguntados-dbz/preguntados-dbz.model';

@Injectable({ providedIn: 'root' })
export class DragonBallService {
  private readonly http = inject(HttpClient);
  /**
   * Usamos el path relativo '/dbz' para enrutar por el proxy del dev-server.
   * El proxy reescribe a https://dragonball-api.com/api (ver proxy.conf.json).
   */
  private readonly baseUrl = '/dbz';

  getCharacters(params: { page?: number; limit?: number; name?: string } = {}):
    Observable<PaginatedResponse<Character>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));

    if (params.name && params.name.trim()) {
      httpParams = httpParams.set('name', params.name.trim());
    }

    return this.http.get<PaginatedResponse<Character>>(
      `${this.baseUrl}/characters`,
      { params: httpParams }
    );
  }

  /**
   * Construye una pregunta "¿Quién es este personaje?" con 4 opciones (1 correcta + 3 distractores),
   * asegurando que todas tengan imagen disponible.
   */
  getRandomQuestion(nOptions = 4, poolLimit = 100): Observable<Question> {
    return this.getCharacters({ limit: poolLimit }).pipe(
      // Filtramos personajes con imagen válida
      map(res => res.items.filter(c => !!c.image && !!c.name)),
      map(items => {
        // barajar y tomar nOptions
        const pool = shuffle(items);
        const pick = uniqueFirstNById(pool, nOptions);
        if (pick.length < nOptions) {
          throw new Error('No se encontraron suficientes personajes con imagen para crear opciones.');
        }
        const correct = pick[Math.floor(Math.random() * pick.length)];
        return {
          imageUrl: correct.image as string,
          correct: { id: correct.id, name: correct.name },
          options: shuffle(pick.map(p => ({ id: p.id, name: p.name })))
        } as Question;
      })
    );
  }
}

/* Utilidades locales */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueFirstNById<T extends { id: number }>(arr: T[], n: number): T[] {
  const seen = new Set<number>();
  const out: T[] = [];
  for (const item of arr) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
      if (out.length === n) break;
    }
  }
  return out;
}


// import { Injectable } from '@angular/core';
// @Injectable({
//   providedIn: 'root'
// })
// export class DragonBall {
// }
