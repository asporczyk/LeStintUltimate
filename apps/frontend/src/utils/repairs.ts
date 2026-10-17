// Damage repaired at a pit stop. Times (seconds, base delay plus the random part) follow the
// PitstopDelays section of rFactor's RFM files, which the fuel times in utils/pitstop also
// come from. LMU publishes no figures of its own: the wings are rFactor's
// defaults, bodywork and suspension are estimates from repair times seen in LMU's pit menu.
export const REPAIR_PARTS = ['bodywork', 'frontWing', 'rearWing', 'suspFL', 'suspFR', 'suspRL', 'suspRR'] as const

export type RepairPart = typeof REPAIR_PARTS[number]

export const SUSPENSION_PARTS = ['suspFL', 'suspFR', 'suspRL', 'suspRR'] as const satisfies readonly RepairPart[]

export const REPAIR_TIMES: Record<RepairPart, number> = {
  bodywork: 30,
  frontWing: 8.5 + 1.5,
  rearWing: 33 + 7,
  // Each broken corner is repaired on its own.
  suspFL: 40,
  suspFR: 40,
  suspRL: 40,
  suspRR: 40,
}

const isRepairPart = (part: string): part is RepairPart => part in REPAIR_TIMES

// The crew repairs one part after another, so the times add up. Unknown parts are skipped.
export function calculateRepairTime(repairs: readonly string[] = []): number {
  return [...new Set(repairs)].filter(isRepairPart).reduce((total, part) => total + REPAIR_TIMES[part], 0)
}
