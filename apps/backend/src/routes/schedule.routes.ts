import { FastifyInstance } from "fastify";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";
import { Race } from "../models/Race.js";
import { getIO } from "../socket.js";
import { computeFuelLaps } from "../calculations.js";
import { createStintBody, idParams, raceIdParams, updateStintBody } from "../schemas.js";

const DEFAULT_LAP_TIME = 120;

interface StintBody {
    scheduleId: string
    order: number
    startTime: number
    duration: number
    driver: string
    spotter: string
    fuelLaps: number
    fuel: number
    tireFL: string
    tireFR: string
    tireRL: string
    tireRR: string
    tires: number
}

async function recalculateFuelLaps(schedule: { _id: unknown; raceId: string }) {
    const race = await Race.findById(schedule.raceId);
    const avgLapTime = race?.avgLapTime || DEFAULT_LAP_TIME;

    const allStints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
    const fuelLaps = computeFuelLaps(allStints.map(s => s.duration || 0), avgLapTime);
    for (const [index, stint] of allStints.entries()) {
        if (stint.fuelLaps !== fuelLaps[index]) {
            stint.fuelLaps = fuelLaps[index];
            await stint.save();
        }
    }

    getIO()?.emit("stint:refresh", { raceId: schedule.raceId });
}

export default async function scheduleRoutes(app: FastifyInstance) {
    app.get("/schedule/:raceId", { schema: { params: raceIdParams } }, async (req) => {
        const { raceId } = req.params as any;

        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return { schedule: null, stints: [] };

        const stints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
        return { schedule, stints };
    });

    app.post("/stints", { schema: { body: createStintBody } }, async (req) => {
        const body = req.body as StintBody;
        
        let schedule = await Schedule.findOne({ raceId: body.scheduleId });
        if (!schedule) {
            schedule = await Schedule.create({ raceId: body.scheduleId });
        }

        await Stint.updateMany(
            { scheduleId: schedule._id, order: { $gte: body.order } },
            { $inc: { order: 1 } }
        );

        const stint = await Stint.create({
            scheduleId: schedule._id,
            order: body.order,
            startTime: body.startTime,
            duration: body.duration,
            driver: body.driver,
            spotter: body.spotter,
            fuelLaps: body.fuelLaps,
            fuel: body.fuel,
            tireFL: body.tireFL,
            tireFR: body.tireFR,
            tireRL: body.tireRL,
            tireRR: body.tireRR,
            tires: body.tires
        });

        await recalculateFuelLaps(schedule);

        return stint;
    });

    app.put("/stints/:id", { schema: { params: idParams, body: updateStintBody } }, async (req) => {
        const { id } = req.params as any;
        const body = req.body as Partial<StintBody>;

        const stint = await Stint.findByIdAndUpdate(
            id,
            {
                startTime: body.startTime,
                duration: body.duration,
                driver: body.driver,
                spotter: body.spotter,
                fuelLaps: body.fuelLaps,
                fuel: body.fuel,
                tireFL: body.tireFL,
                tireFR: body.tireFR,
                tireRL: body.tireRL,
                tireRR: body.tireRR,
                tires: body.tires
            },
            { new: true }
        );

        if (stint) {
            const schedule = await Schedule.findById(stint.scheduleId);
            if (schedule) {
                await recalculateFuelLaps(schedule);
            }
        }

        return stint;
    });

    app.delete("/stints/:id", { schema: { params: idParams } }, async (req) => {
        const { id } = req.params as any;

        const stint = await Stint.findById(id);
        if (stint) {
            const schedule = await Schedule.findById(stint.scheduleId);
            await Stint.findByIdAndDelete(id);
            
            await Stint.updateMany(
                { scheduleId: stint.scheduleId, order: { $gt: stint.order } },
                { $inc: { order: -1 } }
            );

            if (schedule) {
                await recalculateFuelLaps(schedule);
            }
        }

        return { success: true };
    });
}
