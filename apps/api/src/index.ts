import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { ZodError } from "zod";
import { ENGINEERING_DISCLAIMER } from "@peb/shared";
import { loadEnv } from "./config.js";
import { errorHandler } from "./httpError.js";
import { authRouter } from "./modules/auth/auth.controller.js";
import { projectsRouter } from "./modules/projects/projects.controller.js";
import { materialsRouter } from "./modules/materials/materials.controller.js";
import { sectionsRouter } from "./modules/sections/sections.controller.js";
import { loadsRouter } from "./modules/loads/loads.controller.js";
import { designRouter } from "./modules/design/design.controller.js";
import { validationRouter } from "./modules/validation/validation.controller.js";

const env = loadEnv();
const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    version: env.APP_VERSION,
    disclaimer: ENGINEERING_DISCLAIMER,
    phase: 1,
    engineeringCalculations: "NOT_IMPLEMENTED",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/projects/:projectId/loads", loadsRouter);
app.use("/api/v1/projects/:projectId/design", designRouter);
app.use("/api/v1/projects/:projectId/validation", validationRouter);
app.use("/api/v1/materials", materialsRouter);
app.use("/api/v1/sections", sectionsRouter);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.flatten() });
    return;
  }
  errorHandler(err, req, res, next);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(env.API_PORT, () => {
  console.log(`PEB API listening on ${env.API_PORT} (${env.APP_VERSION})`);
});
