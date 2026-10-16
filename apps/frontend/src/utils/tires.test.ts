import { describe, expect, it } from 'vitest'
import { countChangedTires, remainingTiresAt } from 'utils/tires'

const none = { tireFL: '-', tireFR: '-', tireRL: '-', tireRR: '-' }
const fronts = { tireFL: 'N', tireFR: 'N', tireRL: '-', tireRR: '-' }
const all = { tireFL: 'N', tireFR: 'N', tireRL: 'N', tireRR: 'N' }

describe('countChangedTires', () => {
  it('counts every field other than "-"', () => {
    expect(countChangedTires(none)).toBe(0)
    expect(countChangedTires(fronts)).toBe(2)
    expect(countChangedTires(all)).toBe(4)
  })
})

describe('remainingTiresAt', () => {
  it('subtracts changed tires up to and including the index', () => {
    const stints = [all, fronts, none]
    expect(remainingTiresAt(stints, 0, 10)).toBe(6)
    expect(remainingTiresAt(stints, 1, 10)).toBe(4)
    expect(remainingTiresAt(stints, 2, 10)).toBe(4)
  })

  it('returns the starting amount for an empty schedule', () => {
    expect(remainingTiresAt([], 0, 8)).toBe(8)
  })
})
