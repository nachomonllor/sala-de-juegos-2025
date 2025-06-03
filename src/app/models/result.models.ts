export interface GameResult {
  id?: string;             // (Opcional) ID generado por Firestore
  userId: string;          // UID del usuario (obtenido de AuthService)
  userEmail: string;       // Email del usuario (obtenido de AuthService)
  game: string;            // Nombre identificador del juego (p.ej. 'ahorcado', 'mayor-menor')
  score: number;           // Puntaje obtenido
  date: Date;              // Fecha y hora en que finalizó el juego
}

