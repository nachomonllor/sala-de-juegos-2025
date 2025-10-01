// preguntados-dbz.model.ts

export interface RespuestaPaginada<T> {
  items: T[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links?: {
    first: string;
    previous?: string;
    next?: string;
    last: string;
  };
}

export interface Personaje {
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  race: string;
  gender: string;
  description: string | null;
  image: string | null;   // URL a la imagen del personaje
  affiliation: string;
  deletedAt?: string | null;
}

// Pregunta del juego (mantengo los nombres de propiedades porque vienen del servicio)
export interface Pregunta {
  imageUrl: string;
  correct: { id: number; name: string };
  options: { id: number; name: string }[]; // incluye la correcta + 3 distractores
}

// Alias para compatibilidad con código existente (si en algún lado importan los nombres en inglés)
export type PaginatedResponse<T> = RespuestaPaginada<T>;
export type Character = Personaje;
export type Question = Pregunta;


// export interface PaginatedResponse<T> {
//   items: T[];
//   meta?: {
//     totalItems: number;
//     itemCount: number;
//     itemsPerPage: number;
//     totalPages: number;
//     currentPage: number;
//   };
//   links?: {
//     first: string;
//     previous?: string;
//     next?: string;
//     last: string;
//   };
// }

// export interface Character {
//   id: number;
//   name: string;
//   ki: string;
//   maxKi: string;
//   race: string;
//   gender: string;
//   description: string | null;
//   image: string | null;   // URL a la imagen del personaje
//   affiliation: string;
//   deletedAt?: string | null;
// }

// export interface Question {
//   imageUrl: string;
//   correct: { id: number; name: string };
//   options: { id: number; name: string }[]; // siempre incluye la correcta + 3 distractores
// }


