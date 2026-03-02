import Fastify from "fastify";
import scheduleRoutes from "./routes/schedule.routes.js";

export function buildServer() {
    const app = Fastify({ logger: true });

    app.register(scheduleRoutes, { prefix: "/api" });

    return app;
}
