import {FastifyInstance} from "fastify";
import {Race} from "../models/Race.js";

export default async function raceRoutes(app: FastifyInstance) {
    app.get("/races", async () => {
        return Race.find().sort({createdAt: -1});
    });

    app.post("/races", async (req) => {
        const { name, startDate } = req.body as any;
        return await Race.create({name, startDate});
    });

    app.delete("/races/:id", async (req) => {
        const { id } = req.params as any;
        await Race.findByIdAndDelete(id);
        return { success: true };
    });
}
