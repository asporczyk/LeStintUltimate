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

// Rear wing angle in degrees. Its real range differs per car and isn't published;
// this bounds them all (it can go below zero), 0 is the starting point.
// Any angle can be typed; the buttons move it by a step.
export const REAR_WING_MIN = -10
export const REAR_WING_MAX = 10
export const REAR_WING_DEFAULT = 0
export const REAR_WING_STEP = 0.5

// "54.0:46.0" (front:rear).
export function formatBrakeBias(front: number): string {
  return `${front.toFixed(1)}:${(100 - front).toFixed(1)}`
}

// Brake bias moved by steps (forward > 0, rearward < 0), kept within the limits.
export function stepBrakeBias(front: number, steps: number): number {
  const moved = Math.round((front + steps * BRAKE_BIAS_STEP) * 10) / 10
  return Math.min(BRAKE_BIAS_MAX, Math.max(BRAKE_BIAS_MIN, moved))
}

// "+2.5°", "0.0°", "-1.0°".
export function formatRearWing(degrees: number): string {
  return `${degrees > 0 ? '+' : ''}${degrees.toFixed(1)}°`
}

// Rear wing moved by steps (more > 0, less < 0), kept within the limits.
export function stepRearWing(degrees: number, steps: number): number {
  const moved = Math.round((degrees + steps * REAR_WING_STEP) * 10) / 10
  return Math.min(REAR_WING_MAX, Math.max(REAR_WING_MIN, moved))
}

// Electronics as typed in a form: levels, the front brake bias and the rear wing; empty = not set.
export type ElectronicsInput = Record<ElectronicsLevel | 'brakeBias' | 'rearWing', string>

export type ElectronicsInputErrors = Partial<Record<keyof ElectronicsInput, string>>

export function electronicsInput(settings: DriverElectronics | undefined): ElectronicsInput {
  const text = (value: number | undefined) => value ? String(value) : ''
  return {
    abs: text(settings?.abs),
    tc: text(settings?.tc),
    tcSlip: text(settings?.tcSlip),
    tcCut: text(settings?.tcCut),
    brakeBias: settings?.brakeBias ? settings.brakeBias.toFixed(1) : '',
    // 0° is a setting, so only a missing value is empty.
    rearWing: settings?.rearWing !== undefined ? settings.rearWing.toFixed(1) : '',
  }
}

// Front brake bias typed as "54.5" or "54.5:45.5" (the rear part is ignored); null if not a number.
export function parseBrakeBias(text: string): number | null {
  const front = Number(text.trim().replace(',', '.').split(':')[0])
  return text.trim() && Number.isFinite(front) ? Math.round(front * 10) / 10 : null
}

// Rear wing typed as "2.5", "-1,5" or "+2°"; null if not a number.
export function parseRearWing(text: string): number | null {
  const degrees = Number(text.trim().replace(',', '.').replace('°', ''))
  return text.trim() && Number.isFinite(degrees) ? Math.round(degrees * 10) / 10 : null
}

export function isValidRearWing(degrees: number | null): degrees is number {
  return degrees !== null && degrees >= REAR_WING_MIN && degrees <= REAR_WING_MAX
}

// Validation messages (raceDetails keys); levels come from a list, so only the brake bias and the wing are checked.
export function validateElectronicsInput(input: ElectronicsInput): ElectronicsInputErrors {
  const errors: ElectronicsInputErrors = {}
  if (input.brakeBias.trim()) {
    const front = parseBrakeBias(input.brakeBias)
    if (front === null || front < BRAKE_BIAS_MIN || front > BRAKE_BIAS_MAX) errors.brakeBias = 'validation.brakeBiasRange'
  }
  if (input.rearWing.trim() && !isValidRearWing(parseRearWing(input.rearWing))) errors.rearWing = 'validation.rearWingRange'
  return errors
}

// A valid input as the stored entry, or null when nothing is set.
export function parseElectronicsInput(driver: string, input: ElectronicsInput): DriverElectronics | null {
  const entry: DriverElectronics = { driver }
  for (const level of ELECTRONICS_LEVELS) {
    if (input[level]) entry[level] = Number(input[level])
  }
  const brakeBias = parseBrakeBias(input.brakeBias)
  if (brakeBias !== null) entry.brakeBias = brakeBias
  const rearWing = parseRearWing(input.rearWing)
  if (rearWing !== null) entry.rearWing = rearWing
  return Object.keys(entry).length > 1 ? entry : null
}
