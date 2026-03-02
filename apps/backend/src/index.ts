import 'dotenv/config'
import { buildServer } from "./server.js";
import { connectDB } from "./db.js";
import { initSocket } from "./socket.js";

const app = buildServer();

await connectDB(process.env.MONGO_URI!);

const server = await app.listen({
    port: Number(process.env.PORT),
    host: "0.0.0.0"
});

initSocket(app.server);

console.log("🚀 Server running");
