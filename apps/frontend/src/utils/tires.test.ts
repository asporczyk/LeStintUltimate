import { describe, expect, it } from 'vitest'
import { countChangedTires, countNewTires, remainingTiresAt } from 'utils/tires'

const none = { tireFL: '-', tireFR: '-', tireRL: '-', tireRR: '-' }
const fronts = { tireFL: 'N', tireFR: 'N', tireRL: '-', tireRR: '-' }
const all = { tireFL: 'N', tireFR: 'N', tireRL: 'N', tireRR: 'N' }
const used = { tireFL: 'U', tireFR: 'U', tireRL: 'U', tireRR: 'U' }
const wets = { tireFL: 'W', tireFR: 'W', tireRL: '-', tireRR: '-' }

describe('countChangedTires', () => {
  it('counts every field other than "-"', () => {
    expect(countChangedTires(none)).toBe(0)
    expect(countChangedTires(fronts)).toBe(2)
    expect(countChangedTires(all)).toBe(4)
    expect(countChangedTires(used)).toBe(4)
    expect(countChangedTires(wets)).toBe(2)
  })
})

describe('countNewTires', () => {
  it('leaves used and wet tires out', () => {
    expect(countNewTires(all)).toBe(4)
    expect(countNewTires(used)).toBe(0)
    expect(countNewTires(wets)).toBe(0)
  })
})

describe('remainingTiresAt', () => {
  it('subtracts changed tires up to and including the index', () => {
    const stints = [all, fronts, none]
    expect(remainingTiresAt(stints, 0, 10)).toBe(6)
    expect(remainingTiresAt(stints, 1, 10)).toBe(4)
    expect(remainingTiresAt(stints, 2, 10)).toBe(4)
  })

  it('mixes compounds per wheel', () => {
    const mixed = { tireFL: 'N', tireFR: 'U', tireRL: 'W', tireRR: 'W' }
    expect(countChangedTires(mixed)).toBe(4)
    expect(countNewTires(mixed)).toBe(1)
  })

  it('does not take used or wet tires from the allowance', () => {
    expect(remainingTiresAt([all, used, wets], 2, 10)).toBe(6)
  })

  it('returns the starting amount for an empty schedule', () => {
    expect(remainingTiresAt([], 0, 8)).toBe(8)
  })
})
