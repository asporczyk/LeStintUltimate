import { type Stint } from 'types/Schedule'

const FUEL_FILL_RATE = 3.0
const FUEL_RANDOM_DELAY = 2.0
const TIME_INSERT_NOZZLE = 1.2
const TIME_REMOVE_NOZZLE = 0.7
const CONCURRENT_FUEL_TIRES = 1.0
const TIME_TWO_TIRES = 15.0
const TIME_FOUR_TIRES = 32.0
const TIRE_RANDOM_DELAY = 7.0
const CONCURRENT_TIRES = 1.0
const TIME_DRIVER_CHANGE = 40.0
const DRIVER_RANDOM_DELAY = 6.0
const CONCURRENT_DRIVER = 1.0

export function calculatePitstopTime(previousStint: Stint | null, currentStint: Stint, fuelTankCapacity: number = 100): number {
  if (!previousStint) return 0

  let pitstopTime = 0

  const fuelAmount = ((currentStint.fuel - 1) / 100) * fuelTankCapacity
  const fuelTime = (fuelAmount / FUEL_FILL_RATE) + FUEL_RANDOM_DELAY + TIME_INSERT_NOZZLE + TIME_REMOVE_NOZZLE

  const changedTires = [
    currentStint.tireFL !== '-' ? 1 : 0,
    currentStint.tireFR !== '-' ? 1 : 0,
    currentStint.tireRL !== '-' ? 1 : 0,
    currentStint.tireRR !== '-' ? 1 : 0
  ].reduce((sum, v) => sum + v, 0)
  
  let tireTime = 0
  if (changedTires > 0) {
    let baseTireTime: number
    if (CONCURRENT_TIRES === 1.0) {
      baseTireTime = changedTires <= 2 ? TIME_TWO_TIRES : TIME_FOUR_TIRES
    } else {
      baseTireTime = changedTires * TIME_TWO_TIRES
    }
    tireTime = baseTireTime + TIRE_RANDOM_DELAY
  }

  const driverChanged = currentStint.driver !== previousStint.driver
  const driverTime = driverChanged ? TIME_DRIVER_CHANGE + DRIVER_RANDOM_DELAY : 0

  const fuelAndTiresConcurrent = CONCURRENT_FUEL_TIRES === 1.0
  let mainPitstopTime: number
  
  if (fuelAndTiresConcurrent && changedTires > 0) {
    mainPitstopTime = Math.max(fuelTime, tireTime)
  } else {
    mainPitstopTime = fuelTime + tireTime
  }

  if (driverChanged && CONCURRENT_DRIVER === 1.0) {
    pitstopTime = Math.max(mainPitstopTime, driverTime)
  } else {
    pitstopTime = mainPitstopTime + driverTime
  }

  return pitstopTime
}
