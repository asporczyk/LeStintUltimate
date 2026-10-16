import {FastifyInstance} from "fastify";
import {Race} from "../models/Race.js";
import {Schedule} from "../models/Schedule.js";
import {Stint} from "../models/Stint.js";
import {Training} from "../models/Training.js";
import {Qualification} from "../models/Qualification.js";
import {getIO} from "../socket.js";
import {recalculateFuelLaps} from "../services/stints.js";
import {createRaceBody, idParams, patchRaceBody} from "../schemas.js";

export default async function raceRoutes(app: FastifyInstance) {
    app.get("/races", async () => {
        const races = await Race.find().sort({createdAt: -1});
        const count = await Race.countDocuments();
        return { races, count, limit: 100 };
    });

    app.post("/races", { schema: { body: createRaceBody } }, async (req, reply) => {
        const count = await Race.countDocuments();
        if (count >= 100) {
            return reply.status(400).send({ error: "Limit 100 wyścigów został osiągnięty. Usuń jeden, aby dodać nowy." });
        }

        const { name, startDate } = req.body as any;
        return await Race.create({name, startDate});
    });

    app.delete("/races/:id", { schema: { params: idParams } }, async (req) => {
        const { id } = req.params as any;
        await Race.findByIdAndDelete(id);

        const schedules = await Schedule.find({ raceId: id });
        await Stint.deleteMany({ scheduleId: { $in: schedules.map(s => s._id) } });
        await Schedule.deleteMany({ raceId: id });
        await Training.deleteMany({ raceId: id });
        await Qualification.deleteMany({ raceId: id });

        return { success: true };
    });

    app.get("/races/:id", { schema: { params: idParams } }, async (req, reply) => {
        const { id } = req.params as any;
        const race = await Race.findById(id);
        if (!race) {
            return reply.status(404).send({ error: "Wyścig nie znaleziony" });
        }
        return race;
    });

    app.patch("/races/:id", { schema: { params: idParams, body: patchRaceBody } }, async (req, reply) => {
        const { id } = req.params as any;
        const patch = req.body as { name?: string; startDate?: Date; startTime?: string; raceLength?: number; drivers?: string[]; tireSets?: number; fuelTankCapacity?: number; avgLapTime?: number; avgFuelPerLap?: number; avgStintTime?: number; notes?: string; qualification?: any; };
        
        if (patch.notes && patch.notes.length > 200) {
            return reply.status(400).send({ error: "Notatka może mieć maksymalnie 200 znaków" });
        }

        const oldRace = await Race.findById(id);
        if (!oldRace) {
            return reply.status(404).send({ error: "Wyścig nie znaleziony" });
        }

        const race = await Race.findByIdAndUpdate(
            id,
            { $set: patch },
            { new: true }
        );
        
        if (!race) {
            return reply.status(404).send({ error: "Wyścig nie znaleziony" });
        }

        const avgStintChanged = patch.avgStintTime !== undefined && patch.avgStintTime !== oldRace.avgStintTime;
        const avgLapChanged = patch.avgLapTime !== undefined && patch.avgLapTime !== oldRace.avgLapTime;

        if (avgStintChanged || avgLapChanged) {
            const schedule = await Schedule.findOne({ raceId: id });
            if (schedule) {
                if (avgStintChanged) {
                    // Only stints whose duration was filled in from the average follow it.
                    await Stint.updateMany(
                        {
                            scheduleId: schedule._id,
                            $or: [
                                { durationAuto: true },
                                // Stints saved before durationAuto existed: keep the old rule.
                                { durationAuto: { $exists: false }, duration: oldRace.avgStintTime }
                            ]
                        },
                        { $set: { duration: patch.avgStintTime, durationAuto: true } }
                    );
                }
                await recalculateFuelLaps(schedule);
            }
        }

        const io = getIO();
        if (io) {
            io.emit("race:updated", race);
        }
        
        return race;
    });
}
