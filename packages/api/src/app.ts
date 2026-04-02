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
import { activityRoutes } from "./modules/activity/activity.routes";
import { screenshotRoutes } from "./modules/screenshots/screenshot.routes";
import { timesheetRoutes } from "./modules/timesheets/timesheet.routes";
import { invoiceRoutes } from "./modules/invoices/invoice.routes";
import { reportRoutes } from "./modules/reports/report.routes";
import { roleRoutes } from "./modules/roles/role.routes";

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
app.use("/activity", activityRoutes);
app.use("/screenshots", screenshotRoutes);
app.use("/timesheets", timesheetRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/reports", reportRoutes);
app.use("/roles", roleRoutes);

// Error handler (must be last)
app.use(errorHandler);
