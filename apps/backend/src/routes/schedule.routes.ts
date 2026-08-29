import { FastifyInstance } from "fastify";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";
import { StintService } from "../services/StintService.js";
import { Stint as IStint } from "@stint-ultimate/shared";

const stintSchema = {
    type: 'object',
    required: ['raceId', 'order', 'startTime', 'duration', 'driver'],
    properties: {
        raceId: { type: 'string' },
        order: { type: 'number' },
        startTime: { type: 'number' },
        duration: { type: 'number' },
        driver: { type: 'string' },
        spotter: { type: 'string' },
        fuelLaps: { type: 'number' },
        fuel: { type: 'number' },
        tireFL: { type: 'string' },
        tireFR: { type: 'string' },
        tireRL: { type: 'string' },
        tireRR: { type: 'string' },
        tires: { type: 'number' }
    }
};

export default async function scheduleRoutes(app: FastifyInstance) {
    app.get("/schedule/:raceId", async (req) => {
        const { raceId } = req.params as { raceId: string };

        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return { schedule: null, stints: [] };

        const stints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
        return { schedule, stints };
    });

    app.post("/stints", { schema: { body: stintSchema } }, async (req) => {
        const body = req.body as Omit<IStint, '_id'>;
        
        let schedule = await Schedule.findOne({ raceId: body.raceId });
        if (!schedule) {
            schedule = await Schedule.create({ raceId: body.raceId });
        }

        await StintService.updateStintOrder(schedule._id.toString(), body.order, 1);

        const { raceId, ...rest } = body;
        const stint = await Stint.create({
            ...rest,
            scheduleId: schedule._id
        });

        await StintService.recalculateFuelLaps(body.raceId);

        return stint;
    });

    app.put("/stints/:id", { schema: { body: { ...stintSchema, required: [] } } }, async (req) => {
        const { id } = req.params as { id: string };
        const body = req.body as Partial<IStint>;

        const stint = await Stint.findByIdAndUpdate(id, { $set: body }, { new: true });

        if (stint) {
            const schedule = await Schedule.findById(stint.scheduleId);
            if (schedule) {
                await StintService.recalculateFuelLaps(schedule.raceId.toString());
            }
        }

        return stint;
    });

    app.delete("/stints/:id", async (req) => {
        const { id } = req.params as { id: string };

        const stint = await Stint.findById(id);
        if (stint) {
            const scheduleId = stint.scheduleId.toString();
            const stintOrder = stint.order;

            await Stint.findByIdAndDelete(id);
            await StintService.updateStintOrder(scheduleId, stintOrder + 1, -1);

            const schedule = await Schedule.findById(scheduleId);
            if (schedule) {
                await StintService.recalculateFuelLaps(schedule.raceId.toString());
            }
        }

        return { success: true };
    });
}
