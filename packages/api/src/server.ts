import { config } from "./config";
import { app } from "./app";
import { prisma } from "./config/prisma";

async function main() {
  await prisma.$connect();
  console.log("Database connected");

  app.listen(config.port, () => {
    console.log(`API server running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
