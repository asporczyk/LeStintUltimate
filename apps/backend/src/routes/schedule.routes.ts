import { FastifyInstance } from "fastify";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";

interface StintBody {
    scheduleId: string
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

export default async function scheduleRoutes(app: FastifyInstance) {
    app.get("/schedule/:raceId", async (req) => {
        const { raceId } = req.params as any;

        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return { schedule: null, stints: [] };

        const stints = await Stint.find({ scheduleId: schedule._id });
        return { schedule, stints };
    });

    app.post("/stints", async (req) => {
        const body = req.body as StintBody;
        
        let schedule = await Schedule.findOne({ raceId: body.scheduleId });
        if (!schedule) {
            schedule = await Schedule.create({ raceId: body.scheduleId });
        }

        const stint = await Stint.create({
            scheduleId: schedule._id,
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

        return stint;
    });

    app.put("/stints/:id", async (req) => {
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

        return stint;
    });

    app.delete("/stints/:id", async (req) => {
        const { id } = req.params as any;

        await Stint.findByIdAndDelete(id);

        return { success: true };
    });
}
