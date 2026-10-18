import { describe, expect, it } from 'vitest'
import { driverPace, stintPace } from 'utils/pace'

const race = {
  avgLapTime: 120,
  avgFuelPerLap: 4,
  driverPace: [{ driver: 'Adam', avgLapTime: 110 }, { driver: 'Ola', avgFuelPerLap: 3.5 }],
}

describe('driverPace', () => {
  it("takes the driver's values and the race's for the rest", () => {
    expect(driverPace(race, 'Adam')).toEqual({ avgLapTime: 110, avgFuelPerLap: 4 })
    expect(driverPace(race, 'Ola')).toEqual({ avgLapTime: 120, avgFuelPerLap: 3.5 })
    expect(driverPace(race, 'Kuba')).toEqual({ avgLapTime: 120, avgFuelPerLap: 4 })
  })
})

describe('stintPace', () => {
  it("prefers the stint's values, then the driver's, then the race's", () => {
    expect(stintPace(race, { driver: 'Adam', avgFuelPerLap: 3 })).toEqual({ avgLapTime: 110, avgFuelPerLap: 3 })
    expect(stintPace(race, { driver: 'Ola', avgLapTime: 105, avgFuelPerLap: null })).toEqual({ avgLapTime: 105, avgFuelPerLap: 3.5 })
  })

  it('treats 0 as not set', () => {
    expect(stintPace({ avgLapTime: 0, avgFuelPerLap: 0 }, { driver: 'Adam', avgLapTime: 0 })).toEqual({ avgLapTime: 0, avgFuelPerLap: 0 })
  })
})
