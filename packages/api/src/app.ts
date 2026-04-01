import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./modules/auth/auth.routes";
import { orgRoutes } from "./modules/organizations/org.routes";
import { userRoutes } from "./modules/users/user.routes";
import { departmentRoutes } from "./modules/departments/department.routes";
import { clientRoutes } from "./modules/clients/client.routes";
import { projectRoutes } from "./modules/projects/project.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(apiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/organizations", orgRoutes);
app.use("/users", userRoutes);
app.use("/departments", departmentRoutes);
app.use("/clients", clientRoutes);
app.use("/projects", projectRoutes);

// Error handler (must be last)
app.use(errorHandler);
