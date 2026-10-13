import { prisma } from "@peb/database";
import { validateProject, ValidationFinding } from "@peb/engineering-core";
import { loadCanonicalProject } from "../projects/project.repository.js";
import { HttpError } from "../../httpError.js";

export class ValidationService {
  static async triggerValidation(projectId: string) {
    const project = await loadCanonicalProject(projectId);
    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    const run = validateProject(project);

    // Persist to database
    await prisma.validationRun.create({
      data: {
        id: run.id,
        projectId: run.projectId,
        modelHash: run.modelHash,
        exportBlocked: run.exportBlocked,
        findings: {
          create: run.findings.map((f: ValidationFinding) => ({
            id: f.id,
            severity: f.severity,
            category: f.category,
            code: f.code,
            message: f.message,
            technicalExplanation: f.technicalExplanation ?? "",
            entityType: f.entityType ?? null,
            entityId: f.entityId ?? null,
            source: f.source ?? "ENGINE",
            ruleRef: f.ruleRef ?? "",
            blocking: f.blocking ?? false,
            remediationGuidance: f.remediationGuidance ?? "",
          }))
        }
      }
    });

    return run;
  }

  static async getLatestValidation(projectId: string) {
    const run = await prisma.validationRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { findings: true }
    });

    return run;
  }
}
