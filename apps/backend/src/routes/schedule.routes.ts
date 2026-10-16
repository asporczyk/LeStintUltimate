import { FastifyInstance } from "fastify";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";
import { recalculateFuelLaps } from "../services/stints.js";
import { createStintBody, idParams, raceIdParams, updateStintBody } from "../schemas.js";

interface StintBody {
    raceId: string
    order: number
    duration: number
    durationAuto: boolean
    driver: string
    spotter: string
    fuelLaps: number
    fuel: number
    tireFL: string
    tireFR: string
    tireRL: string
    tireRR: string
}

export default async function scheduleRoutes(app: FastifyInstance) {
    app.get("/schedule/:raceId", { schema: { params: raceIdParams } }, async (req) => {
        const { raceId } = req.params as any;

        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return { schedule: null, stints: [] };

        // Recalculating on read also migrates stints saved with the old lap formula.
        const stints = await recalculateFuelLaps(schedule, { notify: false });
        return { schedule, stints };
    });

    app.post("/stints", { schema: { body: createStintBody } }, async (req) => {
        const body = req.body as StintBody;
        
        let schedule = await Schedule.findOne({ raceId: body.raceId });
        if (!schedule) {
            schedule = await Schedule.create({ raceId: body.raceId });
        }

        await Stint.updateMany(
            { scheduleId: schedule._id, order: { $gte: body.order } },
            { $inc: { order: 1 } }
        );

        const stint = await Stint.create({
            scheduleId: schedule._id,
            order: body.order,
            duration: body.duration,
            durationAuto: body.durationAuto,
            driver: body.driver,
            spotter: body.spotter,
            fuelLaps: body.fuelLaps,
            fuel: body.fuel,
            tireFL: body.tireFL,
            tireFR: body.tireFR,
            tireRL: body.tireRL,
            tireRR: body.tireRR
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
                duration: body.duration,
                durationAuto: body.durationAuto,
                driver: body.driver,
                spotter: body.spotter,
                fuelLaps: body.fuelLaps,
                fuel: body.fuel,
                tireFL: body.tireFL,
                tireFR: body.tireFR,
                tireRL: body.tireRL,
                tireRR: body.tireRR
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
