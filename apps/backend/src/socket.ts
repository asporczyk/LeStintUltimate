import { Server } from "socket.io";
import { getAllowedOrigins, isAllowedOrigin } from "./cors.js";

// Socket.IO only delivers change events: all writes go through the validated
// REST routes. Clients join a room per race and get only that race's events.
let io: Server | undefined;

const raceRoom = (raceId: string) => `race:${raceId}`;
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export function emitToRace(raceId: string, event: string, payload: unknown) {
    io?.to(raceRoom(raceId)).emit(event, payload);
}

export function initSocket(httpServer: any) {
    io = new Server(httpServer, {
        cors: { origin: getAllowedOrigins() },
        // Browsers don't apply CORS to WebSocket upgrades, so check the origin here too.
        allowRequest: (req, callback) => {
            const origin = req.headers.origin;
            callback(null, !origin || isAllowedOrigin(origin));
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on("connection", (socket) => {
        console.log("🟢 Connected:", socket.id);

        socket.on("race:join", (raceId: unknown) => {
            if (typeof raceId === "string" && OBJECT_ID.test(raceId)) {
                socket.join(raceRoom(raceId));
            }
        });

        socket.on("race:leave", (raceId: unknown) => {
            if (typeof raceId === "string") {
                socket.leave(raceRoom(raceId));
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected:", socket.id);
        });
    });
}
