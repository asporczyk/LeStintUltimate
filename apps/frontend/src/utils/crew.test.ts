import { describe, expect, it } from 'vitest'
import { NO_SPOTTER, stintCrew } from 'utils/crew'

// Race from 14:00. Adam until 18:00, Ola 17:00–22:00, Kuba always.
const base = {
  drivers: ['Adam', 'Ola', 'Kuba'],
  availability: [
    { driver: 'Adam', from: '', to: '18:00' },
    { driver: 'Ola', from: '17:00', to: '22:00' },
  ],
  eventStartClock: '14:00',
  raceStartClock: '14:00',
  driver: '',
  spotter: '',
}

describe('stintCrew', () => {
  it('offers drivers available for the whole stint only', () => {
    // 15:00–17:00
    expect(stintCrew({ ...base, start: 60, end: 180 }).driverOptions).toEqual(['Adam', 'Kuba'])
    // 17:30–19:00
    expect(stintCrew({ ...base, start: 210, end: 300 }).driverOptions).toEqual(['Ola', 'Kuba'])
  })

  it('offers everyone without availability set', () => {
    expect(stintCrew({ ...base, availability: undefined, start: 0, end: 120 }).driverOptions).toEqual(['Adam', 'Ola', 'Kuba'])
  })

  it('offers other drivers available for at least a minute as spotters, flagging partial ones', () => {
    // 16:00–18:00, Kuba drives: Adam whole, Ola from 17:00.
    const crew = stintCrew({ ...base, start: 120, end: 240, driver: 'Kuba' })
    expect(crew.spotterOptions).toEqual([{ name: 'Adam', partial: false }, { name: 'Ola', partial: true }])
  })

  it('leaves out spotters with no minute of the stint', () => {
    // 14:00–17:00: Ola only from 17:00.
    const crew = stintCrew({ ...base, start: 0, end: 180, driver: 'Kuba' })
    expect(crew.spotterOptions.map(option => option.name)).toEqual(['Adam'])
  })

  it('fills in the only spotter', () => {
    // 19:00–21:00: only Ola and Kuba; with Kuba driving, Ola spots.
    expect(stintCrew({ ...base, start: 300, end: 420, driver: 'Kuba' }).spotter).toBe('Ola')
  })

  it('fills in the only available driver', () => {
    // 22:00–23:00: Adam and Ola are gone.
    const crew = stintCrew({ ...base, start: 480, end: 540 })
    expect(crew.driverOptions).toEqual(['Kuba'])
    expect(crew.driver).toBe('Kuba')
  })

  it('sets no spotter when nobody else is available', () => {
    const crew = stintCrew({ ...base, start: 480, end: 540 })
    expect(crew.spotterOptions).toEqual([])
    expect(crew.spotter).toBe(NO_SPOTTER)
  })

  it('drops a choice that is no longer available', () => {
    const crew = stintCrew({ ...base, start: 210, end: 300, driver: 'Adam', spotter: 'Adam' })
    expect(crew.driver).toBe('')
    // Adam still spots from 17:30 to 18:00.
    expect(crew.spotter).toBe('Adam')
    expect(crew.partialSpotter).toBe(true)
  })

  it('keeps a choice that is available', () => {
    const crew = stintCrew({ ...base, start: 60, end: 180, driver: 'Adam', spotter: 'Kuba' })
    expect(crew).toMatchObject({ driver: 'Adam', spotter: 'Kuba', partialSpotter: false })
  })

  it('never offers the driver as spotter', () => {
    const crew = stintCrew({ ...base, start: 60, end: 180, driver: 'Adam', spotter: 'Adam' })
    expect(crew.spotterOptions.map(option => option.name)).toEqual(['Kuba'])
    expect(crew.spotter).toBe('Kuba')
  })
})
