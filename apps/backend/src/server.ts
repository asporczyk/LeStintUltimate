import Fastify from "fastify";
import cors from "@fastify/cors";
import scheduleRoutes from "./routes/schedule.routes.js";
import raceRoutes from "./routes/race.routes.js";

export function buildServer() {
    const app = Fastify({ logger: true });

    app.register(cors, {
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    });

    app.register(scheduleRoutes, { prefix: "/api" });
    app.register(raceRoutes, { prefix: "/api" });

    return app;
}
