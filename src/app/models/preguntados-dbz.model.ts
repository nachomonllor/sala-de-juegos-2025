export interface Personaje {
  id: number;
  name: string;
  ki?: string;
  maxKi?: string;
  race?: string;
  gender?: string;
  description?: string | null;
  image: string | null;
  affiliation?: string;
}

// preguntados-dbz.model.ts
export interface OpcionPregunta {
  id: number;
  name: string;
}

export interface Pregunta {
  imageUrl: string;
  correct: OpcionPregunta;
  options: OpcionPregunta[];  // <- plural
}

