import { describe, expect, it } from 'vitest'
import { availabilityLabel, availabilityWindows, isAvailable } from 'utils/availability'

const windows = (from: string, to: string, raceStart: string) => availabilityWindows([{ from, to }], raceStart)

describe('availabilityWindows', () => {
  it('covers the whole race without hours', () => {
    expect(availabilityWindows([], '14:00')).toEqual([{ start: 0, end: Infinity }])
    expect(windows('', '', '14:00')).toEqual([{ start: 0, end: Infinity }])
  })

  it('runs from the start until the given hour', () => {
    expect(windows('', '18:00', '14:00')).toEqual([{ start: 0, end: 240 }])
  })

  it('runs from the given hour to the end', () => {
    expect(windows('16:30', '', '14:00')).toEqual([{ start: 150, end: Infinity }])
  })

  it('runs from A to B', () => {
    expect(windows('15:00', '17:00', '14:00')).toEqual([{ start: 60, end: 180 }])
  })

  it('crosses midnight', () => {
    expect(windows('22:00', '06:00', '20:00')).toEqual([{ start: 120, end: 600 }])
    // Only "to" after midnight.
    expect(windows('', '02:00', '20:00')).toEqual([{ start: 0, end: 360 }])
    // Race starting after midnight, driver from before it.
    expect(windows('', '03:00', '00:30')).toEqual([{ start: 0, end: 150 }])
  })

  it('places hours on the next day of a 24 h race', () => {
    // Race 14:00 → 14:00 the next day; the driver comes the next morning.
    expect(windows('08:00', '12:00', '14:00')).toEqual([{ start: 1080, end: 1320 }])
    expect(windows('', '13:00', '14:00')).toEqual([{ start: 0, end: 1380 }])
    expect(windows('10:00', '', '14:00')).toEqual([{ start: 1200, end: Infinity }])
  })

  it('treats the race start hour as the start for "from" and the end of the day for "to"', () => {
    expect(windows('14:00', '', '14:00')).toEqual([{ start: 0, end: Infinity }])
    expect(windows('', '14:00', '14:00')).toEqual([{ start: 0, end: 1440 }])
  })

  it('splits a window the race reaches end first', () => {
    // 12:00–18:00 in a race from 14:00: until 18:00, and from 12:00 the next day.
    expect(windows('12:00', '18:00', '14:00')).toEqual([{ start: 0, end: 240 }, { start: 1320, end: Infinity }])
  })
})

describe('availabilityWindows with several blocks', () => {
  it('keeps separate blocks of a 24 h race in race order', () => {
    // Race 14:00 → 14:00: 18:00–22:00, then 08:00–12:00 and 15:00–18:00 entered in any order.
    expect(availabilityWindows([
      { from: '08:00', to: '12:00' },
      { from: '18:00', to: '22:00' },
      { from: '15:00', to: '17:00' },
    ], '14:00')).toEqual([{ start: 60, end: 180 }, { start: 240, end: 480 }, { start: 1080, end: 1320 }])
  })

  it('joins back-to-back and overlapping blocks', () => {
    expect(availabilityWindows([
      { from: '15:00', to: '18:00' },
      { from: '18:00', to: '22:00' },
      { from: '21:00', to: '23:00' },
    ], '14:00')).toEqual([{ start: 60, end: 540 }])
  })

  it('mixes open-ended blocks with ranges', () => {
    expect(availabilityWindows([{ from: '', to: '16:00' }, { from: '10:00', to: '' }], '14:00'))
      .toEqual([{ start: 0, end: 120 }, { start: 1200, end: Infinity }])
  })
})

describe('isAvailable', () => {
  it('lets a stint run across back-to-back blocks', () => {
    const joined = availabilityWindows([{ from: '15:00', to: '18:00' }, { from: '18:00', to: '22:00' }], '14:00')
    expect(isAvailable(joined, 150, 300)).toBe(true)
  })

  it('rejects a stint running across a break between blocks', () => {
    const split = availabilityWindows([{ from: '15:00', to: '17:00' }, { from: '18:00', to: '22:00' }], '14:00')
    expect(isAvailable(split, 150, 300)).toBe(false)
    expect(isAvailable(split, 240, 400)).toBe(true)
  })

  const night = windows('22:00', '06:00', '20:00')

  it('needs the whole stint inside one window', () => {
    expect(isAvailable(night, 120, 600)).toBe(true)
    expect(isAvailable(night, 100, 200)).toBe(false)
    expect(isAvailable(night, 550, 650)).toBe(false)
  })

  it('accepts a stint running to the flag when available to the end', () => {
    expect(isAvailable(windows('10:00', '', '14:00'), 1300, 1441.5)).toBe(true)
  })
})

describe('availabilityLabel', () => {
  const t = (key: string, { from, to }: Record<string, string>) =>
    key === 'availabilityRange' ? `${from}–${to}` : key === 'availabilityFrom' ? `from ${from}` : `until ${to}`

  it('lists blocks in race order', () => {
    expect(availabilityLabel([
      { from: '08:00', to: '12:00' },
      { from: '18:00', to: '22:00' },
      { from: '15:00', to: '18:00' },
    ], '14:00', t)).toBe('15:00–18:00, 18:00–22:00, 08:00–12:00')
  })

  it('is null without hours', () => {
    expect(availabilityLabel([], '14:00', t)).toBeNull()
    expect(availabilityLabel([{ from: '', to: '' }], '14:00', t)).toBeNull()
  })
})
