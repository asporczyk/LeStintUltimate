import {FastifyInstance} from "fastify";
import {Training} from "../models/Training.js";
import {Qualification} from "../models/Qualification.js";
import {Race} from "../models/Race.js";
import {getIO} from "../socket.js";
import {addMinutesToClock} from "../calculations.js";
import {raceIdParams, trainingBody} from "../schemas.js";

export default async function trainingRoutes(app: FastifyInstance) {
    app.get("/training/:raceId", { schema: { params: raceIdParams } }, async (req, reply) => {
        const { raceId } = req.params as any;
        const training = await Training.findOne({ raceId });
        if (!training) {
            return reply.status(404).send({ error: "Training not found" });
        }
        return training;
    });

    app.post("/training/:raceId", { schema: { params: raceIdParams, body: trainingBody } }, async (req, reply) => {
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
        getIO()?.emit("training:updated", training);

        return training;
    });

    app.patch("/training/:raceId", { schema: { params: raceIdParams, body: trainingBody } }, async (req, reply) => {
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
            const newQualStartTime = addMinutesToClock(training.startTime, training.duration);
            
            const qualification = await Qualification.findOneAndUpdate(
                { raceId },
                { $set: { startTime: newQualStartTime } },
                { new: true }
            );

            if (io && qualification) {
                io.emit("qualification:updated", qualification);
            }
        }
        
        return training;
    });

    app.delete("/training/:raceId", { schema: { params: raceIdParams } }, async (req) => {
        const { raceId } = req.params as any;
        await Training.findOneAndDelete({ raceId });
        return { success: true };
    });
}