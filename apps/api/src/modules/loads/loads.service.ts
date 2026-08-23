import { prisma } from "@peb/database";
import { generateLoads } from "@peb/engineering-core";
import { loadCanonicalProject } from "../projects/project.repository.js";

export async function generateAndSaveLoads(projectId: string, userId: string) {
  // 1. Load canonical project
  const project = await loadCanonicalProject(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found or incomplete.`);
  }

  // 2. Generate loads using core logic
  const result = generateLoads(project);

  // 3. Persist to DB in transaction
  await prisma.$transaction(async (tx) => {
    // Delete old cases and combinations
    await tx.loadCase.deleteMany({ where: { projectId } });
    await tx.loadCombination.deleteMany({ where: { projectId } });

    // Insert new cases
    for (const lc of result.loadCases) {
      await tx.loadCase.create({
        data: {
          id: lc.id,
          projectId: lc.projectId,
          designBasisId: lc.designBasisId,
          type: lc.type,
          description: lc.description,
          source: lc.source,
          status: lc.status,
          applications: {
            create: lc.applications.map((a: any) => ({
              id: a.id,
              targetType: a.targetType,
              targetId: a.targetId,
              memberId: a.targetType === "MEMBER" ? a.targetId : null,
              magnitude: a.magnitude,
              direction: a.direction,
              units: a.units,
              source: a.source,
              designBasisRef: a.designBasisRef,
              description: a.description,
            })),
          },
        },
      });
    }

    // Insert new combinations
    for (const comb of result.loadCombinations) {
      await tx.loadCombination.create({
        data: {
          id: comb.id,
          projectId: comb.projectId,
          label: comb.label,
          category: comb.category,
          source: comb.source,
          status: comb.status,
          factors: {
            create: comb.factors.map((f: any) => ({
              loadCaseId: f.loadCaseId,
              factor: f.factor,
            })),
          },
        },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        projectId,
        userId,
        action: "LOADS_GENERATED",
        entityType: "Project",
        entityId: projectId,
        details: {
          casesCount: result.loadCases.length,
          combinationsCount: result.loadCombinations.length,
          warnings: result.warnings,
          errors: result.errors,
        },
      },
    });
  });

  return result;
}
