import { prisma } from "@peb/database";
import { randomUUID } from "node:crypto";
import {
  designMember,
  designSecondaryMember,
  designBracingMember,
  calculateSecondaryDemand,
  DesignDemand,
  Member,
  Section,
  Material,
  LoadCase
} from "@peb/engineering-core";

export async function executeDesignRun(projectId: string) {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      designRuns: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      members: true,
      sections: true,
      materials: true,
      loadCases: true,
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Find the latest design run to see if there are load apps (or just use Phase 4 structure)
  // Actually, Phase 4 might not be fully persisted as demands yet, we'll synthesize for preliminary
  const designRunId = randomUUID();

  // Create new DesignRun
  const run = await prisma.designRun.create({
    data: {
      id: designRunId,
      projectId,
      applicationVersion: project.applicationVersion,
      inputHash: "preliminary",
      status: "COMPLETED",
      warnings: {},
      errors: {},
    }
  });

  const availableSections = project.sections.map(s => ({
    ...s,
    // Ensure all numeric fields are proper numbers or undefined
    area_mm2: s.areaMm2 || undefined,
    Zx_mm3: s.zxMm3 || undefined,
    rx_mm: s.rxMm || undefined,
    ry_mm: s.ryMm || undefined,
  })) as unknown as Section[];

  const availableMaterials = project.materials as unknown as Material[];
  const loadCases = project.loadCases as unknown as LoadCase[];
  
  const demands: DesignDemand[] = [
    // Synthesize some preliminary demands for Phase 5 to run
    { axial_kN: -150, shear_kN: 50, moment_kNm: 250, source: "PRELIMINARY", loadCaseId: randomUUID() },
    { axial_kN: 100, shear_kN: 20, moment_kNm: 150, source: "PRELIMINARY", loadCaseId: randomUUID() },
  ];

  const designResults = [];

  for (const m of project.members) {
    const member: Member = m as unknown as Member;
    if (member.type === "COLUMN" || member.type === "RAFTER" || member.type === "TAPERED_COLUMN" || member.type === "TAPERED_RAFTER") {
      const res = designMember(member, designRunId, demands, availableSections, availableMaterials);
      designResults.push(res);
    } else if (member.type === "PURLIN" || member.type === "GIRT" || member.type === "EAVE_STRUT" || member.type === "END_WALL_SECONDARY" || member.type === "SAG_ROD") {
      // Very basic spacing assumption for preliminary design
      const spacing_m = member.type === "PURLIN" ? 1.5 : 2.0;
      const secDemands = calculateSecondaryDemand(member, loadCases, spacing_m);
      const res = designSecondaryMember(member, designRunId, secDemands, availableSections, availableMaterials);
      designResults.push(res);
    } else if (member.type === "ROOF_BRACING" || member.type === "WALL_BRACING") {
      const res = designBracingMember(member, designRunId, availableSections, availableMaterials);
      designResults.push(res);
    }
  }

  // Persist results
  for (const r of designResults) {
    await prisma.memberDesignResult.create({
      data: {
        id: r.id,
        designRunId: r.designRunId,
        memberId: r.memberId,
        sectionId: r.sectionId,
        materialId: r.materialId,
        governingLoadCaseId: r.governingLoadCaseId,
        axialDemand: r.axialDemand,
        axialResistance: r.axialResistance,
        bendingDemand: r.bendingDemand,
        bendingResistance: r.bendingResistance,
        shearDemand: r.shearDemand,
        shearResistance: r.shearResistance,
        utilization: r.utilization,
        slenderness: r.slenderness,
        status: r.status,
        warnings: r.warnings ? JSON.parse(JSON.stringify(r.warnings)) : undefined,
        evaluations: {
          create: r.evaluations.map((e: any) => ({
            id: e.id,
            sectionId: e.sectionId,
            status: e.status,
            governingCheck: e.governingCheck,
            utilization: e.utilization,
            failureReason: e.failureReason,
            rank: e.rank,
          }))
        }
      }
    });
    
    // Also update member with the selected section and weight status
    if (r.sectionId) {
      await prisma.member.update({
        where: { id: r.memberId },
        data: {
          sectionId: r.sectionId,
          materialId: r.materialId,
          weightStatus: "DESIGNED"
        }
      });
    }
  }

  return {
    runId: designRunId,
    resultsCount: designResults.length
  };
}
