import { describe, expect, it } from 'vitest'
import { addMinutesToClock, formatClock, formatHoursMinutes, formatLapTime, parseLapTime } from 'utils/time'

describe('addMinutesToClock', () => {
  it('adds minutes to HH:MM and returns HH:MM:SS', () => {
    expect(addMinutesToClock('19:30', 0)).toBe('19:30:00')
    expect(addMinutesToClock('19:30', 50)).toBe('20:20:00')
  })

  it('keeps seconds from HH:MM:SS and handles fractional minutes', () => {
    expect(addMinutesToClock('20:30:15', 1.5)).toBe('20:31:45')
  })

  it('wraps past midnight in both directions', () => {
    expect(addMinutesToClock('23:30', 45)).toBe('00:15:00')
    expect(addMinutesToClock('00:10', -20)).toBe('23:50:00')
  })

  it('carries rounded seconds instead of printing :60', () => {
    expect(addMinutesToClock('19:30', 59.9999)).toBe('20:30:00')
  })
})

describe('formatClock', () => {
  it('shows HH:MM and HH:MM:SS the same way', () => {
    expect(formatClock('20:00')).toBe('20:00:00')
    expect(formatClock('20:00:30')).toBe('20:00:30')
  })
})

describe('formatHoursMinutes', () => {
  it('formats minutes as H:MM', () => {
    expect(formatHoursMinutes(125)).toBe('2:05')
    expect(formatHoursMinutes(0)).toBe('0:00')
  })

  it('carries rounded minutes instead of printing :60', () => {
    expect(formatHoursMinutes(59.6)).toBe('1:00')
  })
})

describe('lap time', () => {
  it('formats seconds as M:SS:mmm', () => {
    expect(formatLapTime(95.5)).toBe('1:35:500')
    expect(formatLapTime(225.123)).toBe('3:45:123')
  })

  it('carries rounded milliseconds instead of printing 1000', () => {
    expect(formatLapTime(59.9996)).toBe('1:00:000')
  })

  it('parses M:SS:mmm, padding short milliseconds', () => {
    expect(parseLapTime('1:35:500')).toBe(95.5)
    expect(parseLapTime('1:35:5')).toBe(95.5)
  })

  it('rejects invalid lap times', () => {
    expect(parseLapTime('1:60:000')).toBeNull()
    expect(parseLapTime('1:35')).toBeNull()
    expect(parseLapTime('abc')).toBeNull()
  })

  it('round-trips', () => {
    expect(parseLapTime(formatLapTime(225.123))).toBe(225.123)
  })
})
