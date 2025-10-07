// src/app/juego/personajes-dbz.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, from, Observable } from 'rxjs';
import { OpcionPregunta } from '../models/preguntados-dbz.model';

export interface Pregunta {
  imageUrl: string;
  correct: OpcionPregunta;
  options: OpcionPregunta[];
}

@Injectable({ providedIn: 'root' })
export class PersonajesDbzService {
  private http = inject(HttpClient);

  private readonly TOTAL = 58;   // aprox
  private readonly LIMITE = 20;

  private url(page: number, limit: number) {
    return `/dbz-api/api/characters?page=${page}&limit=${limit}`;
  }

  private toArray(resp: any): any[] {
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp?.items)) return resp.items;
    if (Array.isArray(resp?.data)) return resp.data;
    return [];
  }

  async obtenerPreguntaAleatoria(cantidadOpciones = 4): Promise<Pregunta> {
    const paginas = Math.max(1, Math.ceil(this.TOTAL / this.LIMITE));
    const pagina = 1 + Math.floor(Math.random() * paginas);

    const resp = await firstValueFrom(this.http.get<any>(this.url(pagina, this.LIMITE)));
    const personajes = this.toArray(resp).filter((p: any) => !!p?.name);

    if (personajes.length < cantidadOpciones) {
      throw new Error('No hay suficientes personajes para armar la pregunta.');
    }

    const idxs = new Set<number>();
    while (idxs.size < cantidadOpciones) idxs.add(Math.floor(Math.random() * personajes.length));
    const ids = Array.from(idxs);

    const correcto = personajes[ids[0]];
    const opciones: OpcionPregunta[] = ids
      .map(i => ({ id: personajes[i].id, name: personajes[i].name }))
      .sort(() => Math.random() - 0.5);

    return {
      imageUrl: correcto.image ?? 'assets/dbz/correcto.jpg',
      correct: { id: correcto.id, name: correcto.name },
      options: opciones,
    };
  }

  obtenerPreguntaAleatoria$(cantidadOpciones = 4): Observable<Pregunta> {
    return from(this.obtenerPreguntaAleatoria(cantidadOpciones));
  }

}


