import { createHash } from "node:crypto";
import type { CanonicalProject } from "./types.js";

/** Hash of engineering inputs only (excludes timestamps and generated graph). */
export function computeInputHash(project: CanonicalProject): string {
  const payload = {
    schemaVersion: project.schemaVersion,
    metadata: project.metadata,
    designBasis: {
      name: project.designBasis.name,
      standards: project.designBasis.standards,
      wind: project.designBasis.wind,
      seismic: project.designBasis.seismic,
      units: project.designBasis.units,
    },
    geometry: {
      length_m: project.geometry.length_m,
      width_m: project.geometry.width_m,
      eaveHeight_m: project.geometry.eaveHeight_m,
      roofSlopeRiseRun: project.geometry.roofSlopeRiseRun,
      baySpacing_m: project.geometry.baySpacing_m,
      numberOfBays: project.geometry.numberOfBays,
      unequalFinalBay: project.geometry.unequalFinalBay,
      spans: project.geometry.spans.map((s) => ({
        index: s.index,
        width_m: s.width_m,
      })),
    },
    benchmark: {
      enabled: project.benchmark.enabled,
      kgPerM2: project.benchmark.kgPerM2,
    },
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/** Hash of all structural inputs relevant to Phase 10 analysis. */
export function computeAnalysisHash(project: CanonicalProject): string {
  // Sort everything to ensure deterministic order
  const nodes = [...project.structuralModel.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const members = [...project.structuralModel.members].sort((a, b) => a.id.localeCompare(b.id));
  const sections = [...project.sections].sort((a, b) => a.id.localeCompare(b.id));
  const materials = [...project.materials].sort((a, b) => a.id.localeCompare(b.id));
  const supports = [...project.structuralModel.supports].sort((a, b) => a.id.localeCompare(b.id));
  const releases = [...project.structuralModel.releases].sort((a, b) => a.id.localeCompare(b.id));
  const loadCases = [...project.loadCases].sort((a, b) => a.id.localeCompare(b.id));
  const loadCombinations = [...project.loadCombinations].sort((a, b) => a.id.localeCompare(b.id));

  // The analysis hash includes exact coordinates, materials, section properties, boundary conditions, and loads.
  const payload = {
    schemaVersion: project.schemaVersion,
    nodes: nodes.map(n => ({ id: n.id, x: n.x_m, y: n.y_m, z: n.z_m, role: n.role })),
    members: members.map(m => ({ 
      id: m.id, startNodeId: m.startNodeId, endNodeId: m.endNodeId, type: m.type, 
      sectionId: m.sectionId, materialId: m.materialId, isTensionOnly: m.metadata?.isTensionOnly 
    })),
    sections: sections.map(s => ({ id: s.id, type: s.type, dimensions: s.dimensions })),
    materials: materials.map(m => ({ id: m.id, type: m.type, yieldStrength_MPa: m.yieldStrength_MPa })),
    supports: supports.map(s => ({ nodeId: s.nodeId, tx: s.tx, ty: s.ty, tz: s.tz, rx: s.rx, ry: s.ry, rz: s.rz })),
    releases: releases.map(r => ({ memberId: r.memberId, end: r.end, tx: r.tx, ty: r.ty, tz: r.tz, rx: r.rx, ry: r.ry, rz: r.rz })),
    loadCases: loadCases.map(lc => ({ 
      id: lc.id, type: lc.type,
      applications: [...lc.applications].sort((a, b) => a.id.localeCompare(b.id)).map(a => ({
        targetId: a.targetId, targetType: a.targetType, magnitude: a.magnitude, direction: a.direction 
      }))
    })),
    loadCombinations: loadCombinations.map(lc => ({
      id: lc.id, factors: [...lc.factors].sort((a, b) => a.loadCaseId.localeCompare(b.loadCaseId))
    }))
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
