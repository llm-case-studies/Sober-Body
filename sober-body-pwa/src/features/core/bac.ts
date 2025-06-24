// src/features/core/bac.ts
//---------------------------------------------------------------
// Minimal Widmark-based BAC engine (MVP stub)
// • All math stays in *this* module so we can swap to Rust/WASM
//   later without touching React code.
//---------------------------------------------------------------

/** Default Widmark r‐values (total body-water constant) */
const R_CONST = {
  m: 0.68, // sex assigned male at birth
  f: 0.55  // sex assigned female at birth
};

/** Default ethanol elimination rate (%BAC per hour) */
export const DEFAULT_BETA = 0.015;

/** Density of pure ethanol (g/mL) */
const ETHANOL_DENSITY = 0.789;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface Physiology {
  weightKg: number;
  sex: "m" | "f";
  /** optional personalised R value (else fallback by sex) */
  r?: number;
  /** optional personalised elimination rate β */
  beta?: number;
}

export interface DrinkEvent {
  /** volume consumed in millilitres (e.g. 330-ml beer) */
  volumeMl: number;
  /** alcohol by volume as a fraction (e.g. 0.05 for 5 %) */
  abv: number;
  /** timestamp when the drink was finished */
  date: Date;
}

/* ------------------------------------------------------------------ */
/* Core helpers                                                       */
/* ------------------------------------------------------------------ */

/** grams of pure ethanol in a drink */
export function gramsFromDrink(d: DrinkEvent): number {
  return d.volumeMl * d.abv * ETHANOL_DENSITY;
}

/** Widmark single-point BAC estimate for one drink after a
 *  specified time interval */
export function widmark(
  grams: number,
  physiology: Physiology,
  hoursSinceDrink: number
): number {
  const r = physiology.r ?? R_CONST[physiology.sex];
  const beta = physiology.beta ?? DEFAULT_BETA;

  const raw = (grams / (physiology.weightKg * r)) * 100; // %BAC
  const adjusted = raw - beta * hoursSinceDrink;
  return Math.max(adjusted, 0);
}

/** Aggregate BAC for an array of drinks at a given time (default = now) */
export function estimateBAC(
  drinks: DrinkEvent[],
  physiology: Physiology,
  at: Date = new Date()
): number {
  if (drinks.length === 0) return 0;

  const beta = physiology.beta ?? DEFAULT_BETA;
  const r = physiology.r ?? R_CONST[physiology.sex];

  const sorted = [...drinks].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  let bac = 0;
  let last = sorted[0].date;

  for (const d of sorted) {
    const gap = (d.date.getTime() - last.getTime()) / (1000 * 60 * 60);
    bac = Math.max(bac - beta * gap, 0);

    const raw = (gramsFromDrink(d) / (physiology.weightKg * r)) * 100;
    bac += raw;

    last = d.date;
  }

  const finalGap = (at.getTime() - last.getTime()) / (1000 * 60 * 60);
  bac = Math.max(bac - beta * finalGap, 0);

  return bac;
}

/** Hours until BAC reaches targetBAC (default 0.000 %) */
export function hoursToSober(
  currentBAC: number,
  physiology: Physiology,
  targetBAC = 0
): number {
  const beta = physiology.beta ?? DEFAULT_BETA;
  if (currentBAC <= targetBAC) return 0;
  return (currentBAC - targetBAC) / beta;
}

