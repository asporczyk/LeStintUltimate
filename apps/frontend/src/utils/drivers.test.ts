import { describe, expect, it } from 'vitest'
import { driverTotals, minimumDriverPercentage } from 'utils/drivers'

describe('minimumDriverPercentage', () => {
  it('uses the table for 2-6 drivers', () => {
    expect(minimumDriverPercentage(2)).toBe(25)
    expect(minimumDriverPercentage(6)).toBe(8.3)
  })

  it('splits evenly for other counts', () => {
    expect(minimumDriverPercentage(8)).toBe(12.5)
  })
})

describe('driverTotals', () => {
  it('sums minutes per driver, longest first, skipping empty drivers', () => {
    expect(driverTotals([
      { driver: 'Adam', duration: 50 },
      { driver: 'Ola', duration: 60 },
      { driver: 'Adam', duration: 40 },
      { driver: '', duration: 30 },
    ])).toEqual([['Adam', 90], ['Ola', 60]])
  })
})
