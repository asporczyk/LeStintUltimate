import {FastifyInstance} from "fastify";
import {Race} from "../models/Race.js";

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
}
