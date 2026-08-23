import { prisma } from "@peb/database";
import {
  CanonicalProjectSchema,
  assertStructuralInvariants,
  type CanonicalProject,
} from "@peb/engineering-core";

export async function persistCanonicalProject(
  project: CanonicalProject,
  ownerUserId: string,
): Promise<void> {
  const parsed = CanonicalProjectSchema.parse(project);
  assertStructuralInvariants(parsed);

  await prisma.$transaction(async (tx) => {
    await tx.project.create({
      data: {
        id: parsed.id,
        code: parsed.metadata.code,
        name: parsed.metadata.name,
        clientName: parsed.metadata.client,
        location: parsed.metadata.location,
        buildingType: parsed.metadata.buildingType,
        schemaVersion: parsed.schemaVersion,
        applicationVersion: parsed.applicationVersion,
        disclaimer: parsed.disclaimer,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        benchmark: parsed.benchmark,
        membersUsers: {
          create: { userId: ownerUserId, role: "DESIGN_ENGINEER" },
        },
        designBasis: {
          create: {
            id: parsed.designBasis.id,
            name: parsed.designBasis.name,
            payload: parsed.designBasis,
            createdAt: new Date(parsed.designBasis.createdAt),
            updatedAt: new Date(parsed.designBasis.updatedAt),
          },
        },
        geometry: {
          create: {
            id: parsed.geometry.id,
            lengthM: parsed.geometry.length_m,
            widthM: parsed.geometry.width_m,
            eaveHeightM: parsed.geometry.eaveHeight_m,
            roofSlopeRiseRun: parsed.geometry.roofSlopeRiseRun,
            baySpacingM: parsed.geometry.baySpacing_m,
            numberOfBays: parsed.geometry.numberOfBays,
            unequalFinalBay: parsed.geometry.unequalFinalBay,
            craneConfig: parsed.geometry.craneConfig ? (parsed.geometry.craneConfig as any) : (null as any),
            mezzanineConfig: parsed.geometry.mezzanineConfig ? (parsed.geometry.mezzanineConfig as any) : (null as any),
            canopyConfig: parsed.geometry.canopyConfig ? (parsed.geometry.canopyConfig as any) : (null as any),
            endWallConfig: parsed.geometry.endWallConfig ? (parsed.geometry.endWallConfig as any) : (null as any),
            purlinConfig: parsed.geometry.purlinConfig ? (parsed.geometry.purlinConfig as any) : (null as any),
            girtConfig: parsed.geometry.girtConfig ? (parsed.geometry.girtConfig as any) : (null as any),
            eaveStrutConfig: parsed.geometry.eaveStrutConfig ? (parsed.geometry.eaveStrutConfig as any) : (null as any),
            sagRodConfig: parsed.geometry.sagRodConfig ? (parsed.geometry.sagRodConfig as any) : (null as any),
            roofBracingConfig: parsed.geometry.roofBracingConfig ? (parsed.geometry.roofBracingConfig as any) : (null as any),
            wallBracingConfig: parsed.geometry.wallBracingConfig ? (parsed.geometry.wallBracingConfig as any) : (null as any),
            notes: parsed.geometry.notes as any,
            gridLines: {
              create: parsed.geometry.gridLines.map((g) => ({
                id: g.id,
                axis: g.axis,
                index: g.index,
                coordinateM: g.coordinate_m,
                label: g.label,
              })),
            },
            bays: {
              create: parsed.geometry.bays.map((b) => ({
                id: b.id,
                index: b.index,
                startXM: b.startX_m,
                endXM: b.endX_m,
                lengthM: b.length_m,
              })),
            },
            spans: {
              create: parsed.geometry.spans.map((s) => ({
                id: s.id,
                index: s.index,
                startZM: s.startZ_m,
                endZM: s.endZ_m,
                widthM: s.width_m,
              })),
            },
          },
        },
      },
    });

    for (const mat of parsed.materials) {
      await tx.material.create({
        data: {
          id: mat.id,
          projectId: parsed.id,
          name: mat.name,
          grade: mat.grade,
          fyMPa: mat.fy_MPa,
          fuMPa: mat.fu_MPa,
          eMPa: mat.E_MPa,
          poisson: mat.poisson,
          densityKgpm3: mat.density_kgpm3,
          source: mat.source,
          catalogVersion: mat.catalogVersion,
        },
      });
    }

    for (const sec of parsed.sections) {
      await tx.section.create({
        data: {
          id: sec.id,
          projectId: parsed.id,
          materialId: sec.materialId,
          family: sec.family,
          designation: sec.designation,
          areaMm2: sec.area_mm2,
          ixMm4: sec.Ix_mm4,
          iyMm4: sec.Iy_mm4,
          zxMm3: sec.Zx_mm3,
          zyMm3: sec.Zy_mm3,
          rxMm: sec.rx_mm,
          ryMm: sec.ry_mm,
          unitMassKgpm: sec.unitMass_kgpm,
          geometryNotes: sec.geometryNotes,
          geometryConfig: sec.geometryConfig ? (sec.geometryConfig as any) : (null as any),
          catalogVersion: sec.catalogVersion,
          source: sec.source,
        },
      });
    }

    for (const node of parsed.structuralModel.nodes) {
      await tx.node.create({
        data: {
          id: node.id,
          projectId: parsed.id,
          gridLineId: node.gridLineId,
          bayId: node.bayId,
          label: node.label,
          xM: node.x_m,
          yM: node.y_m,
          zM: node.z_m,
          role: node.role,
          metadata: node.metadata as any,
        },
      });
    }

    for (const member of parsed.structuralModel.members) {
      await tx.member.create({
        data: {
          id: member.id,
          projectId: parsed.id,
          startNodeId: member.startNodeId,
          endNodeId: member.endNodeId,
          sectionId: member.sectionId,
          materialId: member.materialId,
          label: member.label,
          type: member.type,
          designGroup: member.designGroup,
          lengthM: member.length_m,
          quantity: member.quantity,
          unitMassKgpm: member.unitMass_kgpm,
          totalWeightKg: member.totalWeight_kg,
          weightStatus: member.weightStatus,
        },
      });
    }

    for (const support of parsed.structuralModel.supports) {
      await tx.support.create({
        data: {
          id: support.id,
          projectId: parsed.id,
          nodeId: support.nodeId,
          type: support.type,
          notes: support.notes,
        },
      });
    }

    for (const release of parsed.structuralModel.releases) {
      await tx.release.create({
        data: {
          id: release.id,
          projectId: parsed.id,
          memberId: release.memberId,
          startFx: release.startFx,
          startFy: release.startFy,
          startFz: release.startFz,
          startMx: release.startMx,
          startMy: release.startMy,
          startMz: release.startMz,
          endFx: release.endFx,
          endFy: release.endFy,
          endFz: release.endFz,
          endMx: release.endMx,
          endMy: release.endMy,
          endMz: release.endMz,
        },
      });
    }

    for (const lc of parsed.loadCases) {
      await tx.loadCase.create({
        data: {
          id: lc.id,
          projectId: parsed.id,
          designBasisId: lc.designBasisId,
          type: lc.type,
          description: lc.description,
          source: lc.source,
          status: lc.status,
          applications: {
            create: lc.applications.map((a) => ({
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

    for (const comb of parsed.loadCombinations) {
      await tx.loadCombination.create({
        data: {
          id: comb.id,
          projectId: parsed.id,
          label: comb.label,
          category: comb.category,
          source: comb.source,
          status: comb.status,
          factors: {
            create: comb.factors.map((f) => ({
              loadCaseId: f.loadCaseId,
              factor: f.factor,
            })),
          },
        },
      });
    }

    if (parsed.connections && parsed.connections.length > 0) {
      for (const conn of parsed.connections) {
        await tx.connection.create({
          data: {
            id: conn.id,
            projectId: parsed.id,
            type: conn.type,
            nodeId: conn.nodeId,
            sourceMemberIds: conn.sourceMemberIds,
            status: conn.status,
            metadata: conn.metadata as any,
            components: {
              create: conn.components.map(comp => ({
                id: comp.id,
                type: comp.type,
                materialId: comp.materialId,
                dimensions: comp.dimensions as any,
                quantity: comp.quantity,
                massKg: comp.mass_kg,
                status: comp.status,
                source: comp.source,
              }))
            }
          }
        });
      }
    }

    await tx.validationResult.create({
      data: {
        id: parsed.validation.id,
        projectId: parsed.id,
        exportBlocked: parsed.validation.exportBlocked,
        createdAt: new Date(parsed.validation.createdAt),
        issues: {
          create: parsed.validation.issues.map((i) => ({
            id: i.id,
            severity: i.severity,
            code: i.code,
            message: i.message,
            entityType: i.entityType,
            entityId: i.entityId,
          })),
        },
      },
    });

    await tx.auditLog.create({
      data: {
        projectId: parsed.id,
        userId: ownerUserId,
        action: "PROJECT_CREATED",
        entityType: "Project",
        entityId: parsed.id,
        details: { schemaVersion: parsed.schemaVersion },
      },
    });
  });
}

export async function loadCanonicalProject(id: string): Promise<CanonicalProject | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    include: {
      designBasis: true,
      geometry: { include: { gridLines: true, bays: true, spans: true } },
      materials: true,
      sections: true,
      nodes: true,
      members: true,
      supports: true,
      releases: true,
      loadCases: { include: { applications: true } },
      loadCombinations: { include: { factors: true } },
      connections: { include: { components: true } },
      analysisRuns: { include: { memberResults: true, nodeResults: true }, orderBy: { createdAt: "desc" } },
      validationResults: { include: { issues: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!row || !row.designBasis || !row.geometry) return null;

  const validation = row.validationResults[0];
  const document: CanonicalProject = {
    schemaVersion: row.schemaVersion as CanonicalProject["schemaVersion"],
    applicationVersion: row.applicationVersion,
    id: row.id,
    metadata: {
      name: row.name,
      client: row.clientName,
      location: row.location,
      buildingType: row.buildingType,
      code: row.code,
    },
    designBasis: CanonicalProjectSchema.shape.designBasis.parse(row.designBasis.payload),
    geometry: {
      id: row.geometry.id,
      projectId: row.id,
      length_m: row.geometry.lengthM,
      width_m: row.geometry.widthM,
      eaveHeight_m: row.geometry.eaveHeightM,
      roofSlopeRiseRun: row.geometry.roofSlopeRiseRun,
      baySpacing_m: row.geometry.baySpacingM ?? undefined,
      numberOfBays: row.geometry.numberOfBays ?? undefined,
      unequalFinalBay: row.geometry.unequalFinalBay,
      craneConfig: row.geometry.craneConfig ? (row.geometry.craneConfig as any) : undefined,
      mezzanineConfig: row.geometry.mezzanineConfig ? (row.geometry.mezzanineConfig as any) : undefined,
      canopyConfig: row.geometry.canopyConfig ? (row.geometry.canopyConfig as any) : undefined,
      endWallConfig: row.geometry.endWallConfig ? (row.geometry.endWallConfig as any) : undefined,
      purlinConfig: row.geometry.purlinConfig ? (row.geometry.purlinConfig as any) : undefined,
      girtConfig: row.geometry.girtConfig ? (row.geometry.girtConfig as any) : undefined,
      eaveStrutConfig: row.geometry.eaveStrutConfig ? (row.geometry.eaveStrutConfig as any) : undefined,
      sagRodConfig: row.geometry.sagRodConfig ? (row.geometry.sagRodConfig as any) : undefined,
      roofBracingConfig: row.geometry.roofBracingConfig ? (row.geometry.roofBracingConfig as any) : undefined,
      wallBracingConfig: row.geometry.wallBracingConfig ? (row.geometry.wallBracingConfig as any) : undefined,
      notes: Array.isArray(row.geometry.notes) ? (row.geometry.notes as string[]) : [],
      createdAt: row.geometry.createdAt.toISOString(),
      updatedAt: row.geometry.updatedAt.toISOString(),
      gridLines: row.geometry.gridLines.map((g) => ({
        id: g.id,
        axis: g.axis as "X" | "Z",
        index: g.index,
        coordinate_m: g.coordinateM,
        label: g.label,
      })),
      bays: row.geometry.bays.map((b) => ({
        id: b.id,
        index: b.index,
        startX_m: b.startXM,
        endX_m: b.endXM,
        length_m: b.lengthM,
      })),
      spans: row.geometry.spans.map((s) => ({
        id: s.id,
        index: s.index,
        startZ_m: s.startZM,
        endZ_m: s.endZM,
        width_m: s.widthM,
      })),
    },
    materials: row.materials.map((m) => ({
      id: m.id,
      name: m.name,
      grade: m.grade,
      fy_MPa: m.fyMPa,
      fu_MPa: m.fuMPa,
      E_MPa: m.eMPa,
      poisson: m.poisson,
      density_kgpm3: m.densityKgpm3,
      source: m.source,
      catalogVersion: m.catalogVersion,
    })),
    sections: row.sections.map((s) => ({
      id: s.id,
      family: s.family,
      designation: s.designation,
      area_mm2: s.areaMm2 ?? undefined,
      Ix_mm4: s.ixMm4 ?? undefined,
      Iy_mm4: s.iyMm4 ?? undefined,
      Zx_mm3: s.zxMm3 ?? undefined,
      Zy_mm3: s.zyMm3 ?? undefined,
      rx_mm: s.rxMm ?? undefined,
      ry_mm: s.ryMm ?? undefined,
      unitMass_kgpm: s.unitMassKgpm,
      materialId: s.materialId ?? undefined,
      geometryNotes: s.geometryNotes,
      geometryConfig: s.geometryConfig ? (s.geometryConfig as any) : (null as any),
      catalogVersion: s.catalogVersion,
      source: s.source,
    })),
    structuralModel: {
      nodes: row.nodes.map((n) => ({
        id: n.id,
        projectId: n.projectId,
        label: n.label,
        x_m: n.xM,
        y_m: n.yM,
        z_m: n.zM,
        role: n.role,
        gridLineId: n.gridLineId ?? undefined,
        bayId: n.bayId ?? undefined,
        metadata: (n.metadata ?? {}) as Record<string, unknown>,
      })),
      members: row.members.map((m) => ({
        id: m.id,
        projectId: m.projectId,
        label: m.label,
        type: m.type,
        startNodeId: m.startNodeId,
        endNodeId: m.endNodeId,
        sectionId: m.sectionId ?? undefined,
        materialId: m.materialId ?? undefined,
        designGroup: m.designGroup,
        length_m: m.lengthM,
        quantity: m.quantity,
        unitMass_kgpm: m.unitMassKgpm ?? undefined,
        totalWeight_kg: m.totalWeightKg ?? undefined,
        weightStatus: m.weightStatus as CanonicalProject["structuralModel"]["members"][number]["weightStatus"],
      })),
      supports: row.supports.map((s) => ({
        id: s.id,
        nodeId: s.nodeId,
        type: s.type,
        notes: s.notes,
      })),
      releases: row.releases.map((r) => ({
        id: r.id,
        memberId: r.memberId,
        startFx: r.startFx,
        startFy: r.startFy,
        startFz: r.startFz,
        startMx: r.startMx,
        startMy: r.startMy,
        startMz: r.startMz,
        endFx: r.endFx,
        endFy: r.endFy,
        endFz: r.endFz,
        endMx: r.endMx,
        endMy: r.endMy,
        endMz: r.endMz,
      })),
    },
    loadCases: row.loadCases.map((lc) => ({
      id: lc.id,
      projectId: lc.projectId,
      type: lc.type,
      description: lc.description,
      source: lc.source,
      designBasisId: lc.designBasisId,
      status: lc.status as CanonicalProject["loadCases"][number]["status"],
      applications: lc.applications.map((a) => ({
        id: a.id,
        loadCaseId: a.loadCaseId,
        targetType: a.targetType as any,
        targetId: a.targetId,
        magnitude: a.magnitude,
        direction: a.direction as any,
        units: a.units,
        source: a.source,
        designBasisRef: a.designBasisRef,
        description: a.description,
      })),
    })),
    loadCombinations: row.loadCombinations.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      label: c.label,
      category: c.category,
      source: c.source,
      status: c.status as any,
      factors: c.factors.map((f) => ({ loadCaseId: f.loadCaseId, factor: f.factor })),
    })),
    connections: row.connections.map((conn) => ({
      id: conn.id,
      projectId: conn.projectId,
      type: conn.type as any,
      nodeId: conn.nodeId ?? undefined,
      sourceMemberIds: Array.isArray(conn.sourceMemberIds) ? conn.sourceMemberIds as string[] : [],
      status: conn.status as any,
      components: conn.components.map((comp) => ({
        id: comp.id,
        connectionId: comp.connectionId,
        type: comp.type as any,
        materialId: comp.materialId ?? undefined,
        dimensions: (comp.dimensions ?? {}) as Record<string, unknown>,
        quantity: comp.quantity,
        mass_kg: comp.massKg,
        status: comp.status as any,
        source: comp.source,
      })),
      metadata: (conn.metadata ?? {}) as Record<string, unknown>,
    })),
    analysisRuns: row.analysisRuns.map((run) => ({
      id: run.id,
      projectId: run.projectId,
      provider: run.provider as any,
      providerVersion: run.providerVersion,
      modelHash: run.modelHash,
      status: run.status as any,
      diagnostics: (run.diagnostics as string[]) ?? [],
      memberResults: run.memberResults.map((mr) => ({
        id: mr.id,
        analysisRunId: mr.analysisRunId,
        memberId: mr.memberId,
        loadCaseId: mr.loadCaseId ?? undefined,
        combinationId: mr.combinationId ?? undefined,
        axialForce_kN: mr.axialForceKn,
        shearForceY_kN: mr.shearForceYKn,
        shearForceZ_kN: mr.shearForceZKn,
        bendingMomentY_kNm: mr.bendingMomentYKnM,
        bendingMomentZ_kNm: mr.bendingMomentZKnM,
        torsion_kNm: mr.torsionKnM,
        displacement_mm: mr.displacementMm,
        authenticity: mr.authenticity as any,
      })),
      nodeResults: run.nodeResults.map((nr) => ({
        id: nr.id,
        analysisRunId: nr.analysisRunId,
        nodeId: nr.nodeId,
        loadCaseId: nr.loadCaseId ?? undefined,
        combinationId: nr.combinationId ?? undefined,
        reactionFx_kN: nr.reactionFxKn,
        reactionFy_kN: nr.reactionFyKn,
        reactionFz_kN: nr.reactionFzKn,
        reactionMx_kNm: nr.reactionMxKnM,
        reactionMy_kNm: nr.reactionMyKnM,
        reactionMz_kNm: nr.reactionMzKnM,
        displacementX_mm: nr.displacementXMm,
        displacementY_mm: nr.displacementYMm,
        displacementZ_mm: nr.displacementZMm,
        authenticity: nr.authenticity as any,
      })),
      createdAt: run.createdAt.toISOString(),
      duration_ms: run.durationMs,
    })),
    validation: validation
      ? {
          id: validation.id,
          projectId: validation.projectId,
          exportBlocked: validation.exportBlocked,
          createdAt: validation.createdAt.toISOString(),
          issues: validation.issues.map((i) => ({
            id: i.id,
            severity: i.severity,
            code: i.code,
            message: i.message,
            entityType: i.entityType ?? undefined,
            entityId: i.entityId ?? undefined,
          })),
        }
      : {
          id: row.id,
          projectId: row.id,
          exportBlocked: true,
          createdAt: row.createdAt.toISOString(),
          issues: [],
        },
    benchmark: (row.benchmark ?? {
      enabled: false,
      note: "Benchmark kg/m² is comparison-only. It must never scale engineering quantities.",
    }) as CanonicalProject["benchmark"],
    disclaimer: row.disclaimer,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return CanonicalProjectSchema.parse(document);
}
