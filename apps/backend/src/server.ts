import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import scheduleRoutes from "./routes/schedule.routes.js";
import raceRoutes from "./routes/race.routes.js";
import qualificationRoutes from "./routes/qualification.routes.js";

export function buildServer() {
    const app = Fastify({ logger: true });

    app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    });

    app.register(swagger, {
        openapi: {
            info: {
                title: "Le Stint Ultimate API",
                description: "API for Le Stint Ultimate racing stint planner",
                version: "1.0.0"
            }
        }
    });

    app.register(swaggerUi, {
        routePrefix: "/docs"
    });

    app.register(scheduleRoutes, { prefix: "/api" });
    app.register(raceRoutes, { prefix: "/api" });
    app.register(qualificationRoutes, { prefix: "/api" });

    return app;
}
