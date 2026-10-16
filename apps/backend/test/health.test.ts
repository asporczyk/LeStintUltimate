import { describe, expect, it } from "vitest";
import { buildServer } from "../src/server.js";

describe("GET /health without a database", () => {
    it("answers 503 so the platform knows the backend is not working", async () => {
        const app = buildServer();
        app.log.level = "silent";
        const res = await app.inject({ method: "GET", url: "/health" });
        await app.close();

        expect(res.statusCode).toBe(503);
        expect(res.json()).toEqual({ status: "error", database: "disconnected" });
    });
});
