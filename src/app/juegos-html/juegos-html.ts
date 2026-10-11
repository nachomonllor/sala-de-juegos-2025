
// Catálogo de juegos hechos como HTML autocontenido (viven en src/assets/juegos/).
// Para sumar uno: copiar el .html a esa carpeta, agregar una entrada acá,
// sumarlo al array games del home y, si guarda puntajes, crear su fila en esquema_juegos.juegos.
export interface JuegoHtml {
  id: string;          // aparece en la URL: /jugar/<id>; el juego lo manda en su postMessage
  codigo: string;      // codigo en esquema_juegos.juegos (lo usa saveResult)
  nombre: string;
  archivo: string;     // nombre del archivo dentro de src/assets/juegos/
}

export const JUEGOS_HTML: JuegoHtml[] = [
  { id: 'escultor',      codigo: 'escultor',      nombre: 'Escultor ∪ Plano libre', archivo: 'escultor.html' },
  { id: 'bloxorz',       codigo: 'bloxorz',       nombre: 'Bloxorz 3D',             archivo: 'bloxorz.html' },
  { id: 'river-run',     codigo: 'river_run',     nombre: 'River Run',              archivo: 'river-run.html' },
  { id: 'mastermind-ia', codigo: 'mastermind_ia', nombre: 'Mastermind IA',          archivo: 'mastermind-ia.html' },
  { id: 'ribosoma',      codigo: 'ribosoma',      nombre: 'Ribosome Runner',        archivo: 'ribosoma.html' },
  { id: 'lightbot',      codigo: 'lightbot',      nombre: 'Lightbot 3D',            archivo: 'lightbot.html' },
  { id: 'sokoban',       codigo: 'sokoban',       nombre: 'Sokoban',                archivo: 'sokoban.html' },
  { id: 'cube-crash',    codigo: 'cube_crash',    nombre: 'Cube Crash Ultra',       archivo: 'cube-crash.html' },
  { id: 'cube-move',     codigo: 'cube_move',     nombre: 'Cube Move 3D',           archivo: 'cube-move.html' },
  { id: 'neon-slide',    codigo: 'neon_slide',    nombre: 'Neon Slide',             archivo: 'neon-slide.html' },
  { id: 'neon-shapes',   codigo: 'neon_shapes',   nombre: 'Neon Slide Shapes',      archivo: 'neon-shapes.html' },
];



// // Catálogo de juegos hechos como HTML autocontenido (viven en src/assets/juegos/).
// // Para sumar uno: copiar el .html a esa carpeta, agregar una entrada acá,
// // sumarlo al array games del home y, si guarda puntajes, crear su fila en esquema_juegos.juegos.
// export interface JuegoHtml {
//   id: string;          // aparece en la URL: /jugar/<id>; el juego lo manda en su postMessage
//   codigo: string;      // codigo en esquema_juegos.juegos (lo usa saveResult)
//   nombre: string;
//   archivo: string;     // nombre del archivo dentro de src/assets/juegos/
// }

// export const JUEGOS_HTML: JuegoHtml[] = [
//   { id: 'escultor',      codigo: 'escultor',      nombre: 'Escultor ∪ Plano libre', archivo: 'escultor.html' },
//   { id: 'bloxorz',       codigo: 'bloxorz',       nombre: 'Bloxorz 3D',             archivo: 'bloxorz.html' },
//   { id: 'river-raid',    codigo: 'river_raid',    nombre: 'River Raid',             archivo: 'river-raid.html' },
//   { id: 'mastermind-ia', codigo: 'mastermind_ia', nombre: 'Mastermind IA',          archivo: 'mastermind-ia.html' },
//   { id: 'ribosoma',      codigo: 'ribosoma',      nombre: 'Ribosome Runner',        archivo: 'ribosoma.html' },
// ];
