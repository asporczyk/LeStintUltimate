// API integration tests against a real MongoDB. They run when TEST_MONGO_URI
// points at a MongoDB server (e.g. mongodb://localhost:27017); each run uses
// its own database and drops it at the end. CI provides MongoDB as a service.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import type { AddressInfo } from "node:net";
import { io as connectSocket, type Socket } from "socket.io-client";
import { buildServer } from "../src/server.js";
import { initSocket } from "../src/socket.js";
import { Stint } from "../src/models/Stint.js";
import { Schedule } from "../src/models/Schedule.js";

const MONGO = process.env.TEST_MONGO_URI;
const APP_ORIGIN = "http://localhost:5173";

describe.skipIf(!MONGO)("API (integration)", () => {
    // High limits: rate limiting has its own tests below.
    const app = buildServer({ rateLimits: { max: 10_000, raceWriteMax: 10_000 } });
    let baseUrl = "";
    const sockets: Socket[] = [];

    beforeAll(async () => {
        app.log.level = "silent";
        await mongoose.connect(`${MONGO!.replace(/\/$/, "")}/stint-test-${process.pid}-${Date.now()}`);
        await app.listen({ port: 0, host: "127.0.0.1" });
        initSocket(app.server);
        baseUrl = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        sockets.forEach(socket => socket.close());
        await app.close();
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    const api = async (method: string, path: string, body?: unknown) => {
        const res = await app.inject({ method: method as "GET", url: `/api${path}`, payload: body as object });
        return { status: res.statusCode, body: res.body ? res.json() : null };
    };

    const createRace = async (patch: object = {}) => {
        const { body: race } = await api("POST", "/races", { name: "Test", startDate: "2026-10-16" });
        if (Object.keys(patch).length) await api("PATCH", `/races/${race._id}`, patch);
        return race._id as string;
    };

    const addStint = (raceId: string, order: number, duration: number, extra: object = {}) =>
        api("POST", "/stints", {
            raceId, order, duration, durationAuto: false, driver: "Adam", spotter: "Ola", fuel: 100,
            tireFL: "-", tireFR: "-", tireRL: "-", tireRR: "-", ...extra
        });

    const schedule = async (raceId: string) => (await api("GET", `/schedule/${raceId}`)).body.stints as
        { _id: string; order: number; duration: number; fuelLaps: number; driver: string; durationAuto?: boolean }[];

    const joinRace = async (raceId: string) => {
        const socket = connectSocket(baseUrl, { transports: ["websocket"], extraHeaders: { Origin: APP_ORIGIN } });
        sockets.push(socket);
        await new Promise<void>(resolve => socket.on("connect", () => resolve()));
        const events: { event: string; payload: any }[] = [];
        socket.onAny((event, payload) => events.push({ event, payload }));
        socket.emit("race:join", raceId);
        await new Promise(resolve => setTimeout(resolve, 100));
        return events;
    };

    const settle = () => new Promise(resolve => setTimeout(resolve, 200));

    describe("validation", () => {
        it("rejects malformed ids with 400 and unknown ones with 404", async () => {
            expect((await api("GET", "/races/abc")).status).toBe(400);
            expect((await api("GET", "/races/0123456789abcdef01234567")).status).toBe(404);
        });

        it("checks ranges and strips unknown fields", async () => {
            const raceId = await createRace();
            expect((await api("PATCH", `/races/${raceId}`, { notes: "x".repeat(201) })).status).toBe(400);
            expect((await api("PATCH", `/races/${raceId}`, { raceLength: 99 })).status).toBe(400);
            const { body } = await api("PATCH", `/races/${raceId}`, { _id: "0123456789abcdef01234567", evil: 1, name: "X" });
            expect(body._id).toBe(raceId);
            expect(body.evil).toBeUndefined();
        });

        it("requires raceId (not the old scheduleId) when adding a stint", async () => {
            const raceId = await createRace();
            expect((await api("POST", "/stints", { scheduleId: raceId, order: 1, duration: 50 })).status).toBe(400);
        });
    });

    describe("stint start laps", () => {
        it("are full laps of all earlier stints, kept up to date on insert and delete", async () => {
            const raceId = await createRace({ avgLapTime: 120 });
            await addStint(raceId, 1, 50);
            await addStint(raceId, 2, 50);
            await addStint(raceId, 3, 30);
            expect((await schedule(raceId)).map(s => s.fuelLaps)).toEqual([0, 25, 50]);

            await addStint(raceId, 2, 60);
            const afterInsert = await schedule(raceId);
            expect(afterInsert.map(s => [s.order, s.fuelLaps])).toEqual([[1, 0], [2, 25], [3, 55], [4, 80]]);

            await api("DELETE", `/stints/${afterInsert[1]._id}`);
            expect((await schedule(raceId)).map(s => [s.order, s.fuelLaps])).toEqual([[1, 0], [2, 25], [3, 50]]);
        });

        it("are recalculated when the average lap time changes", async () => {
            const raceId = await createRace({ avgLapTime: 120 });
            await addStint(raceId, 1, 50);
            await addStint(raceId, 2, 50);
            await api("PATCH", `/races/${raceId}`, { avgLapTime: 100 });
            expect((await schedule(raceId)).map(s => s.fuelLaps)).toEqual([0, 30]);
        });

        it("migrate values saved with the old formula on read", async () => {
            const raceId = await createRace({ avgLapTime: 120 });
            await addStint(raceId, 1, 50);
            await addStint(raceId, 2, 50);
            const { _id } = (await Schedule.findOne({ raceId }))!;
            await Stint.updateMany({ scheduleId: _id }, { $set: { fuelLaps: 999 } });
            expect((await schedule(raceId)).map(s => s.fuelLaps)).toEqual([0, 25]);
        });

        it("keep other fields on a partial update", async () => {
            const raceId = await createRace();
            await addStint(raceId, 1, 50, { durationAuto: true });
            const [stint] = await schedule(raceId);
            await api("PUT", `/stints/${stint._id}`, { fuel: 90 });
            const [updated] = await schedule(raceId);
            expect(updated).toMatchObject({ driver: "Adam", duration: 50, durationAuto: true });
        });
    });

    describe("average stint time", () => {
        it("updates only stints filled in automatically", async () => {
            const raceId = await createRace({ avgLapTime: 120, avgStintTime: 50 });
            await addStint(raceId, 1, 50, { durationAuto: true });
            await addStint(raceId, 2, 30, { durationAuto: false });
            await addStint(raceId, 3, 50, { durationAuto: true });
            await api("PATCH", `/races/${raceId}`, { avgStintTime: 60 });
            expect((await schedule(raceId)).map(s => [s.duration, s.fuelLaps])).toEqual([[60, 0], [30, 30], [60, 45]]);
        });

        it("updates legacy stints without the flag when they matched the old average", async () => {
            const raceId = await createRace({ avgLapTime: 120, avgStintTime: 50 });
            await addStint(raceId, 1, 50);
            await addStint(raceId, 2, 40);
            const { _id } = (await Schedule.findOne({ raceId }))!;
            await Stint.updateMany({ scheduleId: _id }, { $unset: { durationAuto: "" } });
            await api("PATCH", `/races/${raceId}`, { avgStintTime: 45 });
            expect((await schedule(raceId)).map(s => s.duration)).toEqual([45, 40]);
        });
    });

    describe("training and qualification", () => {
        it("answer 204 when the race has none yet", async () => {
            const raceId = await createRace();
            expect((await api("GET", `/training/${raceId}`)).status).toBe(204);
            expect((await api("GET", `/qualification/${raceId}`)).status).toBe(204);
        });

        it("move qualification to the end of training and send the full document", async () => {
            const raceId = await createRace();
            await api("POST", `/training/${raceId}`, { startTime: "18:00", duration: 30 });
            await api("POST", `/qualification/${raceId}`, { driver: "Adam", duration: 20 });
            const events = await joinRace(raceId);

            await api("PATCH", `/training/${raceId}`, { duration: 45 });
            await settle();

            const update = events.find(e => e.event === "qualification:updated");
            expect(update?.payload).toMatchObject({ startTime: "18:45:00", driver: "Adam", duration: 20 });
        });
    });

    describe("deleting a race", () => {
        it("removes its schedule, stints, training and qualification", async () => {
            const raceId = await createRace();
            await addStint(raceId, 1, 50);
            await api("POST", `/training/${raceId}`, {});
            await api("POST", `/qualification/${raceId}`, {});
            await api("DELETE", `/races/${raceId}`);

            expect(await Schedule.countDocuments({ raceId })).toBe(0);
            expect((await api("GET", `/training/${raceId}`)).status).toBe(204);
            expect((await api("GET", `/qualification/${raceId}`)).status).toBe(204);
        });
    });

    describe("socket rooms", () => {
        it("deliver a race's events only to clients that joined it", async () => {
            const raceA = await createRace();
            const raceB = await createRace();
            const eventsA = await joinRace(raceA);
            const eventsB = await joinRace(raceB);

            await api("PATCH", `/races/${raceA}`, { notes: "A" });
            await settle();

            expect(eventsA.map(e => e.event)).toContain("race:updated");
            expect(eventsB).toEqual([]);
        });

        it("refuse connections from other websites", async () => {
            const socket = connectSocket(baseUrl, {
                transports: ["websocket"], extraHeaders: { Origin: "https://evil.example.com" }, reconnection: false
            });
            sockets.push(socket);
            const result = await new Promise(resolve => {
                socket.on("connect", () => resolve("connected"));
                socket.on("connect_error", () => resolve("rejected"));
            });
            expect(result).toBe("rejected");
        });
    });

    describe("health", () => {
        it("reports a connected database", async () => {
            const res = await app.inject({ method: "GET", url: "/health" });
            expect(res.statusCode).toBe(200);
            expect(res.json()).toEqual({ status: "ok", database: "connected" });
        });
    });

    describe("rate limiting", () => {
        it("limits race creation per client and answers 429", async () => {
            const limited = buildServer({ rateLimits: { max: 100, raceWriteMax: 2 } });
            limited.log.level = "silent";
            const create = () => limited.inject({
                method: "POST", url: "/api/races", payload: { name: "Spam", startDate: "2026-10-16" }
            });
            const statuses = [(await create()).statusCode, (await create()).statusCode, (await create()).statusCode];
            const reads = await limited.inject({ method: "GET", url: "/api/races" });
            await limited.close();

            expect(statuses).toEqual([200, 200, 429]);
            // Reading still works: the stricter limit only applies to creating and deleting races.
            expect(reads.statusCode).toBe(200);
        });

        it("counts the client IP behind Render's internal load balancers, not one the client sends", async () => {
            const limited = buildServer({ rateLimits: { max: 2, raceWriteMax: 2 } });
            limited.log.level = "silent";
            // As on Render: a client-set (fake) entry, the real client IP appended by Render's
            // edge, then a different internal 10.x load balancer on every request.
            const get = (forwardedFor: string) => limited.inject({
                method: "GET", url: "/api/races", headers: { "x-forwarded-for": forwardedFor }
            });
            const sameClient = [
                (await get("198.51.100.1, 203.0.113.9, 10.228.25.1")).statusCode,
                (await get("10.0.0.7, 203.0.113.9, 10.197.30.213")).statusCode,
                (await get("198.51.100.3, 203.0.113.9, 10.192.117.149, 10.1.1.1")).statusCode
            ];
            const otherClient = (await get("198.51.100.1, 203.0.113.10, 10.228.25.1")).statusCode;
            await limited.close();

            expect(sameClient).toEqual([200, 200, 429]);
            expect(otherClient).toBe(200);
        });

        it("counts the real client behind Cloudflare, whichever edge server it comes through", async () => {
            const limited = buildServer({ rateLimits: { max: 2, raceWriteMax: 2 } });
            limited.log.level = "silent";
            // As in production: client -> Cloudflare edge (changes per request) -> Render's
            // internal balancers -> app. Cloudflare sets CF-Connecting-IP to the client.
            const get = (edge: string, client: string, extraHeaders: Record<string, string> = {}) => limited.inject({
                method: "GET", url: "/api/races",
                headers: { "x-forwarded-for": `198.51.100.99, ${edge}, 10.228.25.1`, "cf-connecting-ip": client, ...extraHeaders }
            });
            const sameClient = [
                (await get("172.69.155.217", "203.0.113.9")).statusCode,
                (await get("162.158.103.155", "203.0.113.9")).statusCode,
                (await get("104.23.1.2", "203.0.113.9")).statusCode
            ];
            const otherClient = (await get("172.69.155.217", "203.0.113.10")).statusCode;
            // Not from Cloudflare: a self-set CF-Connecting-IP must not give a fresh counter.
            const direct = (client: string) => limited.inject({
                method: "GET", url: "/api/races",
                headers: { "x-forwarded-for": "203.0.113.50, 10.1.1.1", "cf-connecting-ip": client }
            });
            const fakedHeader = [
                (await direct("192.0.2.1")).statusCode,
                (await direct("192.0.2.2")).statusCode,
                (await direct("192.0.2.3")).statusCode
            ];
            await limited.close();

            expect(sameClient).toEqual([200, 200, 429]);
            expect(otherClient).toBe(200);
            expect(fakedHeader).toEqual([200, 200, 429]);
        });

        it("applies the client key to the stricter race-creation limit too", async () => {
            const limited = buildServer({ rateLimits: { max: 100, raceWriteMax: 1 } });
            limited.log.level = "silent";
            const create = (edge: string) => limited.inject({
                method: "POST", url: "/api/races", payload: { name: "Spam", startDate: "2026-10-16" },
                headers: { "x-forwarded-for": `${edge}, 10.228.25.1`, "cf-connecting-ip": "203.0.113.9" }
            });
            const statuses = [(await create("172.69.155.217")).statusCode, (await create("162.158.103.155")).statusCode];
            await limited.close();

            expect(statuses).toEqual([200, 429]);
        });

        it("limits all other requests with the general limit", async () => {
            const limited = buildServer({ rateLimits: { max: 3, raceWriteMax: 3 } });
            limited.log.level = "silent";
            const statuses: number[] = [];
            for (let i = 0; i < 4; i++) {
                statuses.push((await limited.inject({ method: "GET", url: "/api/races" })).statusCode);
            }
            const health = await limited.inject({ method: "GET", url: "/health" });
            await limited.close();

            expect(statuses).toEqual([200, 200, 200, 429]);
            expect(health.statusCode).toBe(200);
        });
    });

    describe("CORS", () => {
        const preflight = (origin: string) => app.inject({
            method: "OPTIONS", url: "/api/races",
            headers: { origin, "access-control-request-method": "PATCH" }
        });

        it("allows the app's origins and nothing else", async () => {
            expect((await preflight("https://le-stint-ultimate.netlify.app")).headers["access-control-allow-origin"])
                .toBe("https://le-stint-ultimate.netlify.app");
            expect((await preflight("https://evil.example.com")).headers["access-control-allow-origin"]).toBeUndefined();
        });
    });
});
