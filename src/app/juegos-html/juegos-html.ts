export interface JuegoHtml {
  id: string;
  codigo: string;
  nombre: string;
  archivo: string;
}

export const JUEGOS_HTML: JuegoHtml[] = [
  { id: 'escultor', codigo: 'escultor', nombre: 'Escultor ∪ Plano libre', archivo: 'escultor.html' },
  { id: 'bloxorz', codigo: 'bloxorz', nombre: 'Bloxorz 3D', archivo: 'bloxorz.html' },
  { id: 'river-run', codigo: 'river_run', nombre: 'River Run', archivo: 'river-run.html' },
  { id: 'mastermind-ia', codigo: 'mastermind_ia', nombre: 'Mastermind IA', archivo: 'mastermind-ia.html' },
  { id: 'ribosoma', codigo: 'ribosoma', nombre: 'Ribosome Runner', archivo: 'ribosoma.html' },
  { id: 'lightbot', codigo: 'lightbot', nombre: 'Lightbot 3D', archivo: 'lightbot.html' },
  { id: 'sokoban', codigo: 'sokoban', nombre: 'Sokoban', archivo: 'sokoban.html' },
  { id: 'cube-crash', codigo: 'cube_crash', nombre: 'Cube Crash Ultra', archivo: 'cube-crash.html' },
  { id: 'cube-move', codigo: 'cube_move', nombre: 'Cube Move 3D', archivo: 'cube-move.html' },
  { id: 'neon-slide', codigo: 'neon_slide', nombre: 'Neon Slide', archivo: 'neon-slide.html' },
  { id: 'neon-shapes', codigo: 'neon_shapes', nombre: 'Neon Slide Shapes', archivo: 'neon-shapes.html' },
  { id: 'rayland', codigo: 'rayland', nombre: 'Rayland', archivo: 'rayland.html' },
  { id: 'circuito', codigo: 'circuito', nombre: 'Circuito Electrónico', archivo: 'circuito.html' },
  { id: 'gemelos', codigo: 'gemelos', nombre: 'Gemelos', archivo: 'gemelos.html' },
  { id: 'cerrar-circuito', codigo: 'cerrar_circuito', nombre: 'Cerrar el Circuito', archivo: 'cerrar-circuito.html' },
  { id: 'tangram', codigo: 'tangram', nombre: 'Tangram', archivo: 'tangram.html' },
  { id: 'anillos', codigo: 'anillos', nombre: 'Anillos', archivo: 'anillos.html' },
];
