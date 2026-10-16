import { describe, expect, it } from 'vitest'
import { stintStartLap } from 'utils/laps'

describe('stintStartLap', () => {
  it('starts the first stint on lap 0', () => {
    expect(stintStartLap([], 120)).toBe(0)
  })

  it('counts full laps completed in earlier stints', () => {
    expect(stintStartLap([50], 120)).toBe(25)
    expect(stintStartLap([50, 50], 225.5)).toBe(26)
  })

  it('counts laps from the total time, so rounding does not accumulate', () => {
    // 2 x 40 min at 225.5 s: rounding per stint would give 10 + 10 = 20
    expect(stintStartLap([40, 40], 225.5)).toBe(21)
  })

  it('falls back to 120 s when the lap time is not set', () => {
    expect(stintStartLap([50], 0)).toBe(25)
  })
})
