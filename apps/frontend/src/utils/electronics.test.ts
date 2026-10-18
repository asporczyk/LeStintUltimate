import { describe, expect, it } from 'vitest'
import { electronicsInput, formatBrakeBias, parseElectronicsInput, stepBrakeBias, validateElectronicsInput } from 'utils/electronics'

const empty = { abs: '', tc: '', tcSlip: '', tcCut: '', brakeBias: '' }

describe('brake bias', () => {
  it('shows front:rear with one decimal', () => {
    expect(formatBrakeBias(54)).toBe('54.0:46.0')
    expect(formatBrakeBias(52.6)).toBe('52.6:47.4')
  })

  it('moves forward and rearward by steps within the limits', () => {
    expect(stepBrakeBias(54, 1)).toBe(54.5)
    expect(stepBrakeBias(54.2, -1)).toBe(53.7)
    expect(stepBrakeBias(69.8, 1)).toBe(70)
    expect(stepBrakeBias(40.2, -1)).toBe(40)
  })
})

describe('electronics input', () => {
  it('round-trips the stored values', () => {
    const settings = { driver: 'Adam', abs: 3, tcCut: 5, brakeBias: 54.6 }
    const input = electronicsInput(settings)
    expect(input).toEqual({ abs: '3', tc: '', tcSlip: '', tcCut: '5', brakeBias: '54.6' })
    expect(parseElectronicsInput('Adam', input)).toEqual(settings)
  })

  it('accepts the brake bias as front or front:rear and rejects it out of range', () => {
    expect(parseElectronicsInput('Adam', { ...empty, brakeBias: '55,5:44,5' })).toEqual({ driver: 'Adam', brakeBias: 55.5 })
    expect(validateElectronicsInput({ ...empty, brakeBias: '56:44' })).toEqual({})
    expect(validateElectronicsInput({ ...empty, brakeBias: '75' })).toEqual({ brakeBias: 'validation.brakeBiasRange' })
    expect(validateElectronicsInput({ ...empty, brakeBias: 'abc' })).toEqual({ brakeBias: 'validation.brakeBiasRange' })
  })

  it('is null when nothing is set', () => {
    expect(parseElectronicsInput('Adam', empty)).toBeNull()
  })
})
