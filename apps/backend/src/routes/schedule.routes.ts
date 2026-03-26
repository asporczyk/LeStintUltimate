import { FastifyInstance } from "fastify";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";
import { Race } from "../models/Race.js";
import { getIO } from "../socket.js";

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

export default async function scheduleRoutes(app: FastifyInstance) {
    app.get("/schedule/:raceId", async (req) => {
        const { raceId } = req.params as any;

        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return { schedule: null, stints: [] };

        const stints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
        return { schedule, stints };
    });

    app.post("/stints", async (req) => {
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

        const race = await Race.findById(body.scheduleId);
        const avgLapTime = race?.avgLapTime || 120;

        const allStints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
        let cumulativeLaps = 0;
        for (const s of allStints) {
            if (s.order === 1) {
                cumulativeLaps = 0;
            } else {
                cumulativeLaps += Math.floor((s.duration || 0) * 60 / avgLapTime);
            }
            if (s.fuelLaps !== cumulativeLaps) {
                s.fuelLaps = cumulativeLaps;
                await s.save();
            }
        }

        const io = getIO();
        if (io) {
            io.emit("stint:refresh", { raceId: body.scheduleId });
        }

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

        if (stint) {
            const schedule = await Schedule.findById(stint.scheduleId);
            if (schedule) {
                const race = await Race.findById(schedule.raceId);
                const avgLapTime = race?.avgLapTime || 120;

                const allStints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
                let cumulativeLaps = 0;
                for (const s of allStints) {
                    if (s.order === 1) {
                        cumulativeLaps = 0;
                    } else {
                        cumulativeLaps += Math.floor((s.duration || 0) * 60 / avgLapTime);
                    }
                    if (s.fuelLaps !== cumulativeLaps) {
                        s.fuelLaps = cumulativeLaps;
                        await s.save();
                    }
                }

                const io = getIO();
                if (io) {
                    io.emit("stint:refresh", { raceId: schedule.raceId });
                }
            }
        }

        return stint;
    });

    app.delete("/stints/:id", async (req) => {
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
                const race = await Race.findById(schedule.raceId);
                const avgLapTime = race?.avgLapTime || 120;

                const allStints = await Stint.find({ scheduleId: schedule._id }).sort({ order: 1 });
                let cumulativeLaps = 0;
                for (const s of allStints) {
                    if (s.order === 1) {
                        cumulativeLaps = 0;
                    } else {
                        cumulativeLaps += Math.floor((s.duration || 0) * 60 / avgLapTime);
                    }
                    if (s.fuelLaps !== cumulativeLaps) {
                        s.fuelLaps = cumulativeLaps;
                        await s.save();
                    }
                }

                const io = getIO();
                if (io) {
                    io.emit("stint:refresh", { raceId: schedule.raceId });
                }
            }
        }

        return { success: true };
    });
}
