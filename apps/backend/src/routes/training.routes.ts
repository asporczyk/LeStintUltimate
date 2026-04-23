import {FastifyInstance} from "fastify";
import {Training} from "../models/Training.js";
import {Qualification} from "../models/Qualification.js";
import {Race} from "../models/Race.js";
import {getIO} from "../socket.js";

export default async function trainingRoutes(app: FastifyInstance) {
    app.get("/training/:raceId", async (req, reply) => {
        const { raceId } = req.params as any;
        const training = await Training.findOne({ raceId });
        if (!training) {
            return reply.status(404).send({ error: "Training not found" });
        }
        return training;
    });

    app.post("/training/:raceId", async (req, reply) => {
        const { raceId } = req.params as any;
        const body = req.body as { startTime?: string; duration?: number; };
        const existing = await Training.findOne({ raceId });
        if (existing) {
            return reply.status(400).send({ error: "Training already exists for this race" });
        }
        const race = await Race.findById(raceId);
        const trainingData = {
            raceId,
            startTime: body.startTime || race?.startTime || '19:30',
            duration: body.duration || 30
        };
        const training = await Training.create(trainingData);
        
        return training;
    });

    app.patch("/training/:raceId", async (req, reply) => {
        const { raceId } = req.params as any;
        const patch = req.body as { startTime?: string; duration?: number; };
        
        const training = await Training.findOneAndUpdate(
            { raceId },
            { $set: patch },
            { new: true }
        );
        
        if (!training) {
            return reply.status(404).send({ error: "Training not found" });
        }

        const io = getIO();
        if (io) {
            io.emit("training:updated", training);
        }

        if (patch.startTime !== undefined || patch.duration !== undefined) {
            const race = await Race.findById(raceId);
            const trainStart = patch.startTime ?? training.startTime;
            const duration = patch.duration ?? training.duration;
            const [h, m] = trainStart.split(':').map(Number);
            const trainEndSeconds = h * 3600 + m * 60 + duration * 60;
            const newHours = Math.floor(trainEndSeconds / 3600) % 24;
            const newMins = Math.floor((trainEndSeconds % 3600) / 60);
            const newSecs = trainEndSeconds % 60;
            const newQualStartTime = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
            
            await Qualification.findOneAndUpdate(
                { raceId },
                { $set: { startTime: newQualStartTime } }
            );
            
            if (io) {
                io.emit("qualification:updated", { raceId, startTime: newQualStartTime });
            }
        }
        
        return training;
    });

    app.delete("/training/:raceId", async (req) => {
        const { raceId } = req.params as any;
        await Training.findOneAndDelete({ raceId });
        return { success: true };
    });
}