import 'dotenv/config'
import { buildServer } from "./server.js";
import { connectDB } from "./db.js";
import { initSocket } from "./socket.js";

const { MONGO_URI } = process.env;
const PORT = Number(process.env.PORT ?? 3000);

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not set. Copy apps/backend/.env.example to apps/backend/.env.");
    process.exit(1);
}
if (!Number.isInteger(PORT) || PORT <= 0) {
    console.error(`❌ PORT must be a positive integer, got "${process.env.PORT}".`);
    process.exit(1);
}

const app = buildServer();

await connectDB(MONGO_URI);

await app.listen({
    port: PORT,
    host: "0.0.0.0"
});

initSocket(app.server);

console.log("🚀 Server running");
