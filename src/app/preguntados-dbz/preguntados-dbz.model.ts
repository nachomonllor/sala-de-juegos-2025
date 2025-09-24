export interface PaginatedResponse<T> {
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

export interface Character {
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

export interface Question {
  imageUrl: string;
  correct: { id: number; name: string };
  options: { id: number; name: string }[]; // siempre incluye la correcta + 3 distractores
}


