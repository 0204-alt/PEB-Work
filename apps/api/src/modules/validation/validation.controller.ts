import { Router } from "express";
import { ValidationService } from "./validation.service.js";

export const validationRouter = Router({ mergeParams: true });

validationRouter.post("/", async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string };
    const run = await ValidationService.triggerValidation(projectId);
    res.json(run);
  } catch (err) {
    next(err);
  }
});

validationRouter.get("/", async (req, res, next) => {
  try {
    const { projectId } = req.params as { projectId: string };
    const run = await ValidationService.getLatestValidation(projectId);
    res.json(run);
  } catch (err) {
    next(err);
  }
});
