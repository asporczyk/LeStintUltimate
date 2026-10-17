export interface TireChange {
  tireFL: string
  tireFR: string
  tireRL: string
  tireRR: string
}

// What goes on in the pit stop: nothing, a new set, a used set or wets.
// Each wheel's field holds the code of the tire fitted, or '-' when it stays on.
export type TireCompound = '-' | 'N' | 'U' | 'W'

export const TIRE_COMPOUNDS: TireCompound[] = ['-', 'N', 'U', 'W']

export const TIRE_KEYS = ['tireFL', 'tireFR', 'tireRL', 'tireRR'] as const

const tiresOf = (stint: TireChange) => TIRE_KEYS.map(key => stint[key])

// A tire is changed when its field holds anything other than '-'.
export function countChangedTires(stint: TireChange): number {
  return tiresOf(stint).filter(tire => tire !== '-').length
}

// Only new tires come out of the race's tire allowance; used and wet ones don't.
export function countNewTires(stint: TireChange): number {
  return tiresOf(stint).filter(tire => compoundOf(tire) === 'N').length
}

// One wheel's field as a compound: anything but '-', 'U' or 'W' counts as new.
export function compoundOf(tire: string): TireCompound {
  return tire === '-' || tire === 'U' || tire === 'W' ? tire : 'N'
}

// Tires left after the stint at `index` (inclusive), starting from `tireSets`.
export function remainingTiresAt(stints: TireChange[], index: number, tireSets: number): number {
  return stints.slice(0, index + 1).reduce((tires, stint) => tires - countNewTires(stint), tireSets)
}
