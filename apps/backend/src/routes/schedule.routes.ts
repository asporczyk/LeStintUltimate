import { FastifyInstance } from "fastify";
import { Schedule } from "../models/Schedule.js";
import { Stint } from "../models/Stint.js";

export default async function scheduleRoutes(app: FastifyInstance) {
    app.get("/schedule/:raceId", async (req) => {
        const { raceId } = req.params as any;

        const schedule = await Schedule.findOne({ raceId });
        if (!schedule) return { schedule: null, stints: [] };

        const stints = await Stint.find({ scheduleId: schedule._id });
        return { schedule, stints };
    });
}
