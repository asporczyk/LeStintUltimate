import {FastifyInstance} from "fastify";
import {Race} from "../models/Race.js";
import {getIO} from "../socket.js";

export default async function raceRoutes(app: FastifyInstance) {
    app.get("/races", async () => {
        const races = await Race.find().sort({createdAt: -1});
        const count = await Race.countDocuments();
        return { races, count, limit: 100 };
    });

    app.post("/races", async (req, reply) => {
        const count = await Race.countDocuments();
        if (count >= 100) {
            return reply.status(400).send({ error: "Limit 100 wyścigów został osiągnięty. Usuń jeden, aby dodać nowy." });
        }

        const { name, startDate } = req.body as any;
        return await Race.create({name, startDate});
    });

    app.delete("/races/:id", async (req) => {
        const { id } = req.params as any;
        await Race.findByIdAndDelete(id);
        return { success: true };
    });

    app.get("/races/:id", async (req, reply) => {
        const { id } = req.params as any;
        const race = await Race.findById(id);
        if (!race) {
            return reply.status(404).send({ error: "Wyścig nie znaleziony" });
        }
        return race;
    });

    app.patch("/races/:id", async (req, reply) => {
        const { id } = req.params as any;
        const patch = req.body as { name?: string; startDate?: Date; startTime?: string; raceLength?: number; drivers?: string[]; tireSets?: number; avgLapTime?: number; avgFuelPerLap?: number; avgStintTime?: number; notes?: string; };
        
        if (patch.notes && patch.notes.length > 200) {
            return reply.status(400).send({ error: "Notatka może mieć maksymalnie 200 znaków" });
        }
        
        const race = await Race.findByIdAndUpdate(
            id,
            { $set: patch },
            { new: true }
        );
        
        if (!race) {
            return reply.status(404).send({ error: "Wyścig nie znaleziony" });
        }

        const io = getIO();
        if (io) {
            io.emit("race:updated", race);
        }
        
        return race;
    });
}
