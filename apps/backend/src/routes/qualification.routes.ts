import {FastifyInstance} from "fastify";
import {Qualification} from "../models/Qualification.js";
import {Race} from "../models/Race.js";
import {getIO} from "../socket.js";

export default async function qualificationRoutes(app: FastifyInstance) {
    app.get("/qualification/:raceId", async (req, reply) => {
        const { raceId } = req.params as any;
        const qualification = await Qualification.findOne({ raceId });
        if (!qualification) {
            return reply.status(404).send({ error: "Qualification not found" });
        }
        return qualification;
    });

    app.post("/qualification/:raceId", async (req, reply) => {
        const { raceId } = req.params as any;
        const body = req.body as { startTime?: string; duration?: number; laps?: number; driver?: string; spotter?: string; fuel?: number; tireFL?: string; tireFR?: string; tireRL?: string; tireRR?: string; };
        const existing = await Qualification.findOne({ raceId });
        if (existing) {
            return reply.status(400).send({ error: "Qualification already exists for this race" });
        }
        const qualificationData = {
            raceId,
            startTime: body.startTime || '19:30',
            duration: body.duration || 30,
            laps: body.laps || 0,
            driver: body.driver || '',
            spotter: body.spotter || '',
            fuel: body.fuel || 100,
            tireFL: body.tireFL || 'N',
            tireFR: body.tireFR || 'N',
            tireRL: body.tireRL || 'N',
            tireRR: body.tireRR || 'N'
        };
        const qualification = await Qualification.create(qualificationData);

        if (body.startTime !== undefined || body.duration !== undefined) {
            const race = await Race.findById(raceId);
            if (race) {
                const qualStart = body.startTime ?? qualification.startTime;
                const duration = body.duration ?? qualification.duration;
                const [h, m] = qualStart.split(':').map(Number);
                const qualEnd = h * 60 + m + duration + 2;
                const newStartHours = Math.floor(qualEnd / 60) % 24;
                const newStartMins = qualEnd % 60;
                const newStartTime = `${newStartHours.toString().padStart(2, '0')}:${newStartMins.toString().padStart(2, '0')}`;
                
                await Race.findByIdAndUpdate(raceId, { startTime: newStartTime });
                
                const io = getIO();
                if (io) {
                    io.emit("race:updated", { ...race.toObject(), startTime: newStartTime });
                }
            }
        }
        
        return qualification;
    });

    app.patch("/qualification/:raceId", async (req, reply) => {
        const { raceId } = req.params as any;
        const patch = req.body as { startTime?: string; duration?: number; laps?: number; driver?: string; spotter?: string; fuel?: number; tireFL?: string; tireFR?: string; tireRL?: string; tireRR?: string; };
        
        const qualification = await Qualification.findOneAndUpdate(
            { raceId },
            { $set: patch },
            { new: true }
        );
        
        if (!qualification) {
            return reply.status(404).send({ error: "Qualification not found" });
        }

        const io = getIO();
        if (io) {
            io.emit("qualification:updated", qualification);
        }

        if (patch.startTime !== undefined || patch.duration !== undefined) {
            const race = await Race.findById(raceId);
            if (race) {
                const qualStart = patch.startTime ?? qualification.startTime;
                const duration = patch.duration ?? qualification.duration;
                const [h, m] = qualStart.split(':').map(Number);
                const qualEnd = h * 60 + m + duration + 2;
                const newStartHours = Math.floor(qualEnd / 60) % 24;
                const newStartMins = qualEnd % 60;
                const newStartTime = `${newStartHours.toString().padStart(2, '0')}:${newStartMins.toString().padStart(2, '0')}`;
                
                await Race.findByIdAndUpdate(raceId, { startTime: newStartTime });
                
                if (io) {
                    io.emit("race:updated", { ...race.toObject(), startTime: newStartTime });
                }
            }
        }
        
        return qualification;
    });

    app.delete("/qualification/:raceId", async (req) => {
        const { raceId } = req.params as any;
        await Qualification.findOneAndDelete({ raceId });
        return { success: true };
    });
}