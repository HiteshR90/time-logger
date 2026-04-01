import http from "http";
import { config } from "./config";
import { app } from "./app";
import { prisma } from "./config/prisma";
import { initSocketIO } from "./realtime/socket";

async function main() {
  await prisma.$connect();
  console.log("Database connected");

  const server = http.createServer(app);
  initSocketIO(server);

  server.listen(config.port, () => {
    console.log(`API server running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
