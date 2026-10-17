import { countChangedTires, type TireChange } from 'utils/tires'
import { calculateRepairTime } from 'utils/repairs'

// Pit stop model based on Le Mans Ultimate parameters (seconds).
// Refuelling and the driver change run in parallel with the crew's work on the car:
// first the tires, then the repairs (LMU repairs damage last).
const FUEL_FILL_RATE = 3.0 // litres per second
const FUEL_RANDOM_DELAY = 2.0
const TIME_INSERT_NOZZLE = 1.2
const TIME_REMOVE_NOZZLE = 0.7
const TIME_TWO_TIRES = 15.0
const TIME_FOUR_TIRES = 32.0
const TIRE_RANDOM_DELAY = 7.0
const TIME_DRIVER_CHANGE = 40.0
const DRIVER_RANDOM_DELAY = 6.0

interface PitstopStint extends TireChange {
  driver: string
  fuel: number
  repairs?: string[]
}

export function calculatePitstopTime(previousStint: PitstopStint | null, currentStint: PitstopStint, fuelTankCapacity: number = 100): number {
  if (!previousStint) return 0

  const fuelAmount = ((currentStint.fuel - 1) / 100) * fuelTankCapacity
  const fuelTime = fuelAmount / FUEL_FILL_RATE + FUEL_RANDOM_DELAY + TIME_INSERT_NOZZLE + TIME_REMOVE_NOZZLE

  const changedTires = countChangedTires(currentStint)
  const tireTime = changedTires === 0
    ? 0
    : (changedTires <= 2 ? TIME_TWO_TIRES : TIME_FOUR_TIRES) + TIRE_RANDOM_DELAY

  const carTime = tireTime + calculateRepairTime(currentStint.repairs)

  const driverTime = currentStint.driver !== previousStint.driver
    ? TIME_DRIVER_CHANGE + DRIVER_RANDOM_DELAY
    : 0

  return Math.max(fuelTime, carTime, driverTime)
}
