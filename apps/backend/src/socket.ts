import { Server } from "socket.io";
import { Stint } from "./models/Stint.js";
import { Race } from "./models/Race.js";

let io: Server;

export function getIO() {
    return io;
}

export function initSocket(httpServer: any) {
    io = new Server(httpServer, {
        cors: { origin: "*" },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on("connection", (socket) => {
        console.log("🟢 Connected:", socket.id);

        socket.on("stint:lock", async (stintId) => {
            const stint = await Stint.findById(stintId);
            if (!stint) return;

            if (stint.lockedBy && stint.lockedBy !== socket.id) {
                socket.emit("stint:lock:denied");
                return;
            }

            stint.lockedBy = socket.id;
            await stint.save();

            io.emit("stint:locked", stint);
        });

        socket.on("stint:update", async ({ stintId, patch }) => {
            const stint = await Stint.findById(stintId);
            if (!stint || stint.lockedBy !== socket.id) return;

            Object.assign(stint, patch);
            await stint.save();

            io.emit("stint:updated", stint);
        });

        socket.on("stint:unlock", async (stintId) => {
            const stint = await Stint.findById(stintId);
            if (!stint || stint.lockedBy !== socket.id) return;

            stint.lockedBy = null;
            await stint.save();

            io.emit("stint:unlocked", stintId);
        });

        socket.on("race:update", async ({ raceId, patch }) => {
            const race = await Race.findByIdAndUpdate(
                raceId,
                { $set: patch },
                { new: true }
            );
            if (!race) return;

            io.emit("race:updated", race);
        });

        socket.on("disconnect", async () => {
            await Stint.updateMany(
                { lockedBy: socket.id },
                { $set: { lockedBy: null } }
            );
            io.emit("presence:update");
            console.log("🔴 Disconnected:", socket.id);
        });
    });
}
