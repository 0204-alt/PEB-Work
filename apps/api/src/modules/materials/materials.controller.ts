import { Router } from "express";
import { z } from "zod";
import { prisma } from "@peb/database";
import { requireAuth, getAuth } from "../auth/auth.controller.js";

export const materialsRouter = Router();
materialsRouter.use(requireAuth);

materialsRouter.get("/grades", async (req, res, next) => {
  try {
    const grades = await prisma.materialGrade.findMany({
      orderBy: { name: "asc" },
    });
    res.json(grades);
  } catch (err) {
    next(err);
  }
});

materialsRouter.get("/projects/:projectId", async (req, res, next) => {
  try {
    const projectId = z.string().uuid().parse(req.params.projectId);
    const materials = await prisma.material.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
    });
    res.json(materials);
  } catch (err) {
    next(err);
  }
});
