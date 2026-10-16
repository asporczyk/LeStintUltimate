import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";
import mongoose from "mongoose";
import scheduleRoutes from "./routes/schedule.routes.js";
import raceRoutes from "./routes/race.routes.js";
import qualificationRoutes from "./routes/qualification.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import { getAllowedOrigins } from "./cors.js";

export interface RateLimits {
    // Requests per minute per IP, for all routes.
    max: number;
    // Requests per minute per IP for creating and deleting races (the 100-race limit is shared by everyone).
    raceWriteMax: number;
}

const envNumber = (name: string, fallback: number) => {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const defaultRateLimits = (): RateLimits => ({
    max: envNumber("RATE_LIMIT_MAX", 300),
    raceWriteMax: envNumber("RATE_LIMIT_RACE_WRITE_MAX", 20)
});

// Proxies trusted in X-Forwarded-For: private network addresses. On Render a request
// passes through several internal load balancers (10.x addresses), so the client IP is
// the first public address counting from the right. Entries further left are set by
// the client and would let anyone pick a new IP (and a fresh rate-limit counter).
const PRIVATE_NETWORKS = "loopback, linklocal, uniquelocal";

// TRUST_PROXY overrides it: a number of hops ("2") or comma-separated addresses/CIDRs.
export const defaultTrustProxy = (): string | number => {
    const value = process.env.TRUST_PROXY?.trim();
    if (!value) return PRIVATE_NETWORKS;
    return /^\d+$/.test(value) ? Number(value) : value;
};

export function buildServer({
    rateLimits = defaultRateLimits(),
    trustProxy = defaultTrustProxy()
}: { rateLimits?: RateLimits; trustProxy?: string | number } = {}) {
    const app = Fastify({ logger: true, trustProxy });

    app.decorate("rateLimits", rateLimits);

    app.register(cors, {
        origin: getAllowedOrigins(),
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

    // The app is public (no login), so this is what keeps one client from flooding the API.
    app.register(rateLimit, {
        max: rateLimits.max,
        timeWindow: "1 minute"
    });

    // For uptime checks (e.g. Render's health check): 503 when MongoDB is not connected.
    app.get("/health", { config: { rateLimit: false } }, async (_req, reply) => {
        const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
        return reply.status(database === "connected" ? 200 : 503).send({ status: database === "connected" ? "ok" : "error", database });
    });

    app.register(scheduleRoutes, { prefix: "/api" });
    app.register(raceRoutes, { prefix: "/api" });
    app.register(qualificationRoutes, { prefix: "/api" });
    app.register(trainingRoutes, { prefix: "/api" });

    return app;
}

declare module "fastify" {
    interface FastifyInstance {
        rateLimits: RateLimits;
    }
}
