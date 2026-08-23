import { Router } from "express";
import { executeDesignRun } from "./design.service.js";
import { prisma } from "@peb/database";
import { requireAuth } from "../auth/auth.controller.js";

export const designRouter = Router({ mergeParams: true });

designRouter.use(requireAuth);

designRouter.post("/execute", async (req, res, next) => {
  try {
    const { projectId } = req.params as any;
    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const result = await executeDesignRun(projectId);

    return res.json({
      success: true,
      message: "Preliminary design executed successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

designRouter.get("/results", async (req, res, next) => {
  try {
    const { projectId } = req.params as any;
    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const run = await prisma.designRun.findFirst({
      where: { projectId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      include: {
        memberResults: {
          include: {
            member: true,
            section: true,
            material: true,
            evaluations: {
              orderBy: { rank: "asc" }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      data: run || null,
    });
  } catch (err) {
    next(err);
  }
});
