import { calculatePitstopTime } from 'utils/pitstop'
import { penaltiesMinutes } from 'utils/penalties'
import { type Stint } from 'types/Schedule'

type ScheduleStint = Pick<Stint, 'duration' | 'driver' | 'fuel' | 'tireFL' | 'tireFR' | 'tireRL' | 'tireRR' | 'repairs' | 'penalties'>

// Minutes from the race start at which each stint starts: earlier stints with the
// penalties served in them, plus the pit stop (pit lane included) before every stint
// after the first.
export function stintStartTimes(stints: ScheduleStint[], fuelTankCapacity: number, pitLaneTime: number = 0): number[] {
  const starts: number[] = []
  let elapsed = 0
  stints.forEach((stint, index) => {
    if (index > 0) {
      const previous = stints[index - 1]
      elapsed += previous.duration + penaltiesMinutes(previous.penalties, pitLaneTime) + calculatePitstopTime(previous, stint, fuelTankCapacity, pitLaneTime) / 60
    }
    starts.push(elapsed)
  })
  return starts
}

// Total race length in minutes covered by the schedule, pit stops included.
export function scheduleLength(stints: ScheduleStint[], fuelTankCapacity: number, pitLaneTime: number = 0): number {
  if (stints.length === 0) return 0
  const starts = stintStartTimes(stints, fuelTankCapacity, pitLaneTime)
  const last = stints[stints.length - 1]
  return starts[starts.length - 1] + last.duration + penaltiesMinutes(last.penalties, pitLaneTime)
}
