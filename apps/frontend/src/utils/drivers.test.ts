import { describe, expect, it } from 'vitest'
import { driverTotals, isValidDriverName, minimumDriverPercentage, sanitizeDriverNameInput } from 'utils/drivers'

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

describe('driver names', () => {
  it('accept one or two words of up to 20 characters', () => {
    expect(isValidDriverName('Adam')).toBe(true)
    expect(isValidDriverName('Łukasz Żółć-Nowak')).toBe(true)
    expect(isValidDriverName('Jan Maria Kowalski')).toBe(false)
    expect(isValidDriverName('Litwo! Ojczyzno')).toBe(false)
    expect(isValidDriverName('x'.repeat(21))).toBe(false)
    expect(isValidDriverName('-')).toBe(false)
  })

  it('are cut to a valid name while typing', () => {
    expect(sanitizeDriverNameInput('Litwo! Ojczyzno moja! ty jesteś jak zdrowie:')).toBe('Litwo Ojczyzno')
    expect(sanitizeDriverNameInput('  Jan   ')).toBe('Jan ')
    expect(sanitizeDriverNameInput('Jan Kowalski ')).toBe('Jan Kowalski')
    expect(sanitizeDriverNameInput('Konstantynopolitańczykowianeczka')).toHaveLength(20)
  })
})
