import { Race } from "../models/Race.js";
import { Stint } from "../models/Stint.js";
import { emitToRace } from "../socket.js";
import { computeFuelLaps, stintLapTime } from "../calculations.js";

// Recomputes the start lap (fuelLaps) of every stint in a schedule, saves the
// ones that changed and, unless notify is false, tells clients to refetch.
export async function recalculateFuelLaps(schedule: { _id: unknown; raceId: string }, { notify = true } = {}) {
    const race = await Race.findById(schedule.raceId);

    const allStints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
    const fuelLaps = computeFuelLaps(allStints.map(s => ({ duration: s.duration || 0, lapTime: stintLapTime(race, s) })));
    for (const [index, stint] of allStints.entries()) {
        if (stint.fuelLaps !== fuelLaps[index]) {
            stint.fuelLaps = fuelLaps[index];
            await stint.save();
        }
    }

    if (notify) {
        emitToRace(schedule.raceId, "stint:refresh", { raceId: schedule.raceId });
    }
    return allStints;
}
