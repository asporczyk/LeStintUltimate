import { type IncidentType } from 'types/Schedule'
import { theme } from 'styles/theme'

// Tile and option colors: weather blue, damage yellow, written-off red.
export const INCIDENT_COLORS: Record<IncidentType, string> = {
  weatherChange: theme.colors.tireWet,
  damage: theme.colors.tireUsed,
  totalDamage: theme.colors.danger,
}

// Tinted background of an incident tile.
export const incidentSoft = (type: IncidentType) => `color-mix(in srgb, ${INCIDENT_COLORS[type]} 16%, transparent)`
