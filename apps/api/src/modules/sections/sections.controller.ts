import { Router } from "express";
import { z } from "zod";
import { prisma } from "@peb/database";
import { requireAuth } from "../auth/auth.controller.js";
import { SectionGeometryConfigSchema, calculateBuiltUpProperties, calculateTaperedProperties } from "@peb/engineering-core";
import { HttpError } from "../../httpError.js";

export const sectionsRouter = Router();
sectionsRouter.use(requireAuth);

sectionsRouter.get("/families", async (req, res, next) => {
  try {
    const families = await prisma.sectionFamily.findMany({
      orderBy: { name: "asc" },
    });
    res.json(families);
  } catch (err) {
    next(err);
  }
});

sectionsRouter.get("/projects/:projectId", async (req, res, next) => {
  try {
    const projectId = z.string().uuid().parse(req.params.projectId);
    const sections = await prisma.section.findMany({
      where: { projectId },
      orderBy: { designation: "asc" },
    });
    res.json(sections);
  } catch (err) {
    next(err);
  }
});

const calculateSchema = z.object({
  density_kgpm3: z.number().positive(),
  geometryConfig: SectionGeometryConfigSchema,
});

sectionsRouter.post("/calculate", (req, res, next) => {
  try {
    const { density_kgpm3, geometryConfig: config } = calculateSchema.parse(req.body);
    const geometryConfig = config as any;

    if (geometryConfig.type === "BUILT_UP") {
      const props = calculateBuiltUpProperties(geometryConfig, density_kgpm3);
      res.json(props);
    } else if (geometryConfig.type === "TAPERED") {
      // Calculate start and end for reference
      const startProps = calculateTaperedProperties(geometryConfig, 0, density_kgpm3);
      const endProps = calculateTaperedProperties(geometryConfig, 1, density_kgpm3);
      res.json({ start: startProps, end: endProps });
    } else {
      throw new HttpError(400, "Calculation for this section type is not supported via this endpoint.");
    }
  } catch (err) {
    next(err);
  }
});
