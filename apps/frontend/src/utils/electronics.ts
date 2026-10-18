import { type DriverElectronics } from 'types/Race'

export const ELECTRONICS_LEVELS = ['abs', 'tc', 'tcSlip', 'tcCut'] as const
export type ElectronicsLevel = typeof ELECTRONICS_LEVELS[number]
export const LEVEL_MIN = 1
export const LEVEL_MAX = 9

// Brake bias as % to the front. The setup's default and its limits differ per GT3 car;
// these bound every car, the default is a typical GT3 starting point.
export const BRAKE_BIAS_MIN = 40
export const BRAKE_BIAS_MAX = 70
export const BRAKE_BIAS_DEFAULT = 54
// One press of the brake bias forward / rearward buttons.
export const BRAKE_BIAS_STEP = 0.5

// "54.0:46.0" (front:rear).
export function formatBrakeBias(front: number): string {
  return `${front.toFixed(1)}:${(100 - front).toFixed(1)}`
}

// Brake bias moved by steps (forward > 0, rearward < 0), kept within the limits.
export function stepBrakeBias(front: number, steps: number): number {
  const moved = Math.round((front + steps * BRAKE_BIAS_STEP) * 10) / 10
  return Math.min(BRAKE_BIAS_MAX, Math.max(BRAKE_BIAS_MIN, moved))
}

// Electronics as typed in a form: levels and the front brake bias; empty = not set.
export type ElectronicsInput = Record<ElectronicsLevel | 'brakeBias', string>

export type ElectronicsInputErrors = Partial<Record<keyof ElectronicsInput, string>>

export function electronicsInput(settings: DriverElectronics | undefined): ElectronicsInput {
  const text = (value: number | undefined) => value ? String(value) : ''
  return {
    abs: text(settings?.abs),
    tc: text(settings?.tc),
    tcSlip: text(settings?.tcSlip),
    tcCut: text(settings?.tcCut),
    brakeBias: settings?.brakeBias ? settings.brakeBias.toFixed(1) : '',
  }
}

// Front brake bias typed as "54.5" or "54.5:45.5" (the rear part is ignored); null if not a number.
export function parseBrakeBias(text: string): number | null {
  const front = Number(text.trim().replace(',', '.').split(':')[0])
  return text.trim() && Number.isFinite(front) ? Math.round(front * 10) / 10 : null
}

// Validation messages (raceDetails keys); levels come from a list, so only the brake bias is checked.
export function validateElectronicsInput(input: ElectronicsInput): ElectronicsInputErrors {
  if (!input.brakeBias.trim()) return {}
  const front = parseBrakeBias(input.brakeBias)
  return front === null || front < BRAKE_BIAS_MIN || front > BRAKE_BIAS_MAX
    ? { brakeBias: 'validation.brakeBiasRange' }
    : {}
}

// A valid input as the stored entry, or null when nothing is set.
export function parseElectronicsInput(driver: string, input: ElectronicsInput): DriverElectronics | null {
  const entry: DriverElectronics = { driver }
  for (const level of ELECTRONICS_LEVELS) {
    if (input[level]) entry[level] = Number(input[level])
  }
  const brakeBias = parseBrakeBias(input.brakeBias)
  if (brakeBias !== null) entry.brakeBias = brakeBias
  return Object.keys(entry).length > 1 ? entry : null
}
