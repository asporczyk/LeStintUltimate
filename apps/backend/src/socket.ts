import { Server } from "socket.io";
import { getAllowedOrigins, isAllowedOrigin } from "./cors.js";

// Socket.IO is broadcast-only: all writes go through the validated REST routes,
// which emit change events via getIO().
let io: Server;

export function getIO() {
    return io;
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

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected:", socket.id);
        });
    });
}
