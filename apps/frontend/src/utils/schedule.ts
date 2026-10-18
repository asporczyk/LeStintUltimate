import { calculatePitstopTime } from 'utils/pitstop'
import { type Stint } from 'types/Schedule'

type ScheduleStint = Pick<Stint, 'duration' | 'driver' | 'fuel' | 'tireFL' | 'tireFR' | 'tireRL' | 'tireRR' | 'repairs'>

// Minutes from the race start at which each stint starts: earlier stints plus
// the pit stop (pit lane included) before every stint after the first.
export function stintStartTimes(stints: ScheduleStint[], fuelTankCapacity: number, pitLaneTime: number = 0): number[] {
  const starts: number[] = []
  let elapsed = 0
  stints.forEach((stint, index) => {
    if (index > 0) {
      elapsed += stints[index - 1].duration + calculatePitstopTime(stints[index - 1], stint, fuelTankCapacity, pitLaneTime) / 60
    }
    starts.push(elapsed)
  })
  return starts
}

// Total race length in minutes covered by the schedule, pit stops included.
export function scheduleLength(stints: ScheduleStint[], fuelTankCapacity: number, pitLaneTime: number = 0): number {
  if (stints.length === 0) return 0
  const starts = stintStartTimes(stints, fuelTankCapacity, pitLaneTime)
  return starts[starts.length - 1] + stints[stints.length - 1].duration
}
