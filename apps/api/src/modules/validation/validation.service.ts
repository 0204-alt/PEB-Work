import { db } from "@peb/database";
import { validateProject } from "@peb/engineering-core";
import { ProjectService } from "../projects/projects.service.js";
import { HttpError } from "../../httpError.js";

export class ValidationService {
  static async triggerValidation(projectId: string) {
    const project = await ProjectService.getProject(projectId);
    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    const run = validateProject(project);

    // Persist to database
    await db.validationRun.create({
      data: {
        id: run.id,
        projectId: run.projectId,
        modelHash: run.modelHash,
        exportBlocked: run.exportBlocked,
        gates: run.gates as object,
        findings: {
          create: run.findings.map(f => ({
            id: f.id,
            severity: f.severity,
            category: f.category,
            code: f.code,
            message: f.message,
            technicalExplanation: f.technicalExplanation,
            entityType: f.entityType,
            entityId: f.entityId,
            source: f.source,
            ruleRef: f.ruleRef,
            blocking: f.blocking,
            remediationGuidance: f.remediationGuidance,
          }))
        }
      }
    });

    return run;
  }

  static async getLatestValidation(projectId: string) {
    const run = await db.validationRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { findings: true }
    });

    return run;
  }
}
