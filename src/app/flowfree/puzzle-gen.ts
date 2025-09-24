// src/app/games/puzzle-gen.ts
import { Pair, Pt } from './flowfree-engine';

export interface GeneratedPuzzle {
  pairs: Pair[];
  solution: (string | null)[][];
}

/** Genera un puzzle resoluble: primero hace un camino Hamiltoniano (serpentina),
 *  luego lo corta en K segmentos y asigna colores. Devuelve endpoints (pairs)
 *  y la solución completa como matriz de colores. */
export function generatePuzzle(
  size: number,
  palette: string[],
  opts?: { k?: number; minSeg?: number }
): GeneratedPuzzle {
  const N = Math.max(2, size);
  const path = serpentineHamiltonian(N); // Pt[] de largo N*N
  const cells = N * N;

  const k = clamp(opts?.k ?? Math.min(palette.length, 5), 2, Math.min(palette.length, cells));
  const minSeg = clamp(opts?.minSeg ?? 3, 2, Math.floor(cells / k));

  const segLens = randomSplitWithMin(cells, k, minSeg);
  // Mezcla ligera de colores para variedad
  const colors = palette.slice(0, k).sort(() => Math.random() - 0.5);

  // Armar solución y pares
  const solution: (string | null)[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => null)
  );
  const pairs: Pair[] = [];

  let idx = 0;
  for (let i = 0; i < k; i++) {
    const len = segLens[i];
    const seg = path.slice(idx, idx + len);
    const color = colors[i];

    // Pintar solución
    for (const pt of seg) solution[pt.r][pt.c] = color;

    // Extremos del segmento → endpoints
    const a = seg[0];
    const b = seg[seg.length - 1];
    pairs.push({ color, a, b });

    idx += len;
  }

  return { pairs, solution };
}

/** Hamiltoniano serpenteante determinista (rápido y siempre válido). */
function serpentineHamiltonian(n: number): Pt[] {
  const v: Pt[] = [];
  for (let r = 0; r < n; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < n; c++) v.push({ r, c });
    } else {
      for (let c = n - 1; c >= 0; c--) v.push({ r, c });
    }
  }
  return v;
}

/** Reparte `total` en `k` segmentos, cada uno >= minSeg, aleatoriamente. */
function randomSplitWithMin(total: number, k: number, minSeg: number): number[] {
  const base = Array(k).fill(minSeg);
  let rem = total - k * minSeg;
  while (rem > 0) {
    const i = Math.floor(Math.random() * k);
    base[i]++; rem--;
  }
  // Evita segmentos de longitud 2 (endpoints muy pegados): ya garantizado por minSeg>=3
  return base;
}

function clamp(x: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, x)); }

