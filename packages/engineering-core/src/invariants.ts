import type { CanonicalProject } from "./types.js";

export class DomainInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainInvariantError";
  }
}

/** Structural graph checks that must hold whenever members exist. */
export function assertStructuralInvariants(project: CanonicalProject): void {
  const nodeIds = new Set(project.structuralModel.nodes.map((n) => n.id));
  const labels = new Set<string>();

  for (const node of project.structuralModel.nodes) {
    if (labels.has(node.label)) {
      throw new DomainInvariantError(`Duplicate node label ${node.label}`);
    }
    labels.add(node.label);
    if (node.projectId !== project.id) {
      throw new DomainInvariantError(`Node ${node.label} project_id mismatch`);
    }
  }

  const coordKeys = new Set<string>();
  for (const node of project.structuralModel.nodes) {
    const key = `${node.x_m.toFixed(6)}|${node.y_m.toFixed(6)}|${node.z_m.toFixed(6)}`;
    if (coordKeys.has(key)) {
      throw new DomainInvariantError(`Duplicate node coordinates at ${key}`);
    }
    coordKeys.add(key);
  }

  const memberLabels = new Set<string>();
  for (const member of project.structuralModel.members) {
    if (memberLabels.has(member.label)) {
      throw new DomainInvariantError(`Duplicate member label ${member.label}`);
    }
    memberLabels.add(member.label);
    if (!nodeIds.has(member.startNodeId) || !nodeIds.has(member.endNodeId)) {
      throw new DomainInvariantError(
        `Member ${member.label} references a missing node`,
      );
    }
    if (member.startNodeId === member.endNodeId) {
      throw new DomainInvariantError(`Member ${member.label} has zero length topology`);
    }
  }

  for (const support of project.structuralModel.supports) {
    if (!nodeIds.has(support.nodeId)) {
      throw new DomainInvariantError(`Support references missing node ${support.nodeId}`);
    }
  }
}
