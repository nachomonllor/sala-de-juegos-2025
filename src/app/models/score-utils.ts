
export const clamp0 = (x: number) => Math.max(0, Math.floor(x));

/** Penalidad por tiempo: 1 punto por segundo */
export const penalTiempo = (seg: number) => Math.floor(seg || 0);

/** Ahorcado */
export function pointsAhorcado({ errores, duracionSec }: { errores: number; duracionSec: number; }) {
  return clamp0(1000 - errores * 100 - penalTiempo(duracionSec));
}

/** Mayor–Menor */
export function pointsMayorMenor({ rachaMax, duracionSec }: { rachaMax: number; duracionSec: number; }) {
  return clamp0(rachaMax * 100 - penalTiempo(duracionSec));
}

/** Flow Free */
export function pointsFlowFree({ niveles, pistasUsadas, duracionSec }: { niveles: number; pistasUsadas: number; duracionSec: number; }) {
  return clamp0(niveles * 200 - pistasUsadas * 50 - penalTiempo(duracionSec));
}

/** Preguntados DBZ */
export function pointsPreguntados({ correctas, incorrectas, bonusRacha, duracionSec }:
  { correctas: number; incorrectas: number; bonusRacha: number; duracionSec: number; }) {
  return clamp0(correctas * 100 - incorrectas * 25 + bonusRacha - penalTiempo(duracionSec));
}

