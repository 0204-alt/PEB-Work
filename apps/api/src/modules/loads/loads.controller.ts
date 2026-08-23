import { Router } from "express";
import { generateAndSaveLoads } from "./loads.service";
import { z } from "zod";
import { getAuth, requireAuth } from "../auth/auth.controller.js";

export const loadsRouter = Router({ mergeParams: true });

loadsRouter.use(requireAuth);

loadsRouter.post("/generate", async (req, res, next) => {
  try {
    const { projectId } = req.params as any;
    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const auth = getAuth(req);
    const userId = auth.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await generateAndSaveLoads(projectId, userId);

    return res.json({
      success: true,
      message: "Loads generated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
