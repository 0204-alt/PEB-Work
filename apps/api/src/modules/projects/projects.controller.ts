import { Router } from "express";
import { z } from "zod";
import { createEmptyProject } from "@peb/engineering-core";
import { getAuth, requireAuth, requireProjectRole } from "../auth/auth.controller.js";
import { HttpError } from "../../httpError.js";
import { loadCanonicalProject, persistCanonicalProject } from "./project.repository.js";

const createSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  buildingType: z.string().min(1),
  length_m: z.number().positive(),
  width_m: z.number().positive(),
  eaveHeight_m: z.number().positive(),
  client: z.string().optional(),
  code: z.string().optional(),
});

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

projectsRouter.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const auth = getAuth(req);
    const project = createEmptyProject(body);
    await persistCanonicalProject(project, auth.sub);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const auth = getAuth(req);
    await requireProjectRole(auth.sub, id, [
      "ADMIN",
      "DESIGN_ENGINEER",
      "ESTIMATOR",
      "REVIEWER",
      "VIEWER",
    ]);
    const project = await loadCanonicalProject(id);
    if (!project) throw new HttpError(404, "Project not found");
    res.json(project);
  } catch (err) {
    next(err);
  }
});
