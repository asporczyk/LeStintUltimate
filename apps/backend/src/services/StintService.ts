import { Race } from "../models/Race.js";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";
import { getIO } from "../socket.js";

export class StintService {
    static async recalculateFuelLaps(raceId: string) {
        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return;

        const race = await Race.findById(raceId);
        const avgLapTime = race?.avgLapTime || 120;

        const allStints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
        let cumulativeLaps = 0;
        const bulkOps = [];

        for (const s of allStints) {
            if (s.fuelLaps !== cumulativeLaps) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: s._id },
                        update: { $set: { fuelLaps: cumulativeLaps } }
                    }
                });
            }
            cumulativeLaps += Math.floor((s.duration || 0) * 60 / avgLapTime);
        }

        if (bulkOps.length > 0) {
            await Stint.bulkWrite(bulkOps);
            const io = getIO();
            if (io) {
                io.emit("stint:refresh", { raceId });
            }
        }
    }

    static async updateStintOrder(scheduleId: string, fromOrder: number, increment: number) {
        await Stint.updateMany(
            { scheduleId, order: { $gte: fromOrder } },
            { $inc: { order: increment } }
        );
    }
}
