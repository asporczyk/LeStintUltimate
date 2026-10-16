export interface TireChange {
  tireFL: string
  tireFR: string
  tireRL: string
  tireRR: string
}

// A tire is changed when its field holds anything other than '-'.
export function countChangedTires(stint: TireChange): number {
  return [stint.tireFL, stint.tireFR, stint.tireRL, stint.tireRR].filter(tire => tire !== '-').length
}

// Tires left after the stint at `index` (inclusive), starting from `tireSets`.
export function remainingTiresAt(stints: TireChange[], index: number, tireSets: number): number {
  return stints.slice(0, index + 1).reduce((tires, stint) => tires - countChangedTires(stint), tireSets)
}
