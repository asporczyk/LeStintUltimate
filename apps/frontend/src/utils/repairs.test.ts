import { describe, expect, it } from 'vitest'
import { calculateRepairTime } from 'utils/repairs'

describe('calculateRepairTime', () => {
  it('is zero without repairs', () => {
    expect(calculateRepairTime()).toBe(0)
    expect(calculateRepairTime([])).toBe(0)
  })

  it('adds the parts one after another', () => {
    expect(calculateRepairTime(['bodywork', 'frontWing', 'rearWing'])).toBeCloseTo(80)
  })

  it('repairs each broken suspension corner on its own', () => {
    expect(calculateRepairTime(['suspFL', 'suspFR', 'suspRL', 'suspRR'])).toBe(160)
  })

  it('skips duplicates and unknown parts', () => {
    expect(calculateRepairTime(['rearWing', 'rearWing', 'engine'])).toBe(40)
  })
})
