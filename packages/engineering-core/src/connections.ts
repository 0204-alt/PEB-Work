import { createId } from "./ids.js";
import type { CanonicalProject, Connection, Node, Member } from "./types.js";

export function generateConnections(project: CanonicalProject): Connection[] {
  const connections: Connection[] = [];
  const nodes = project.structuralModel.nodes;
  const members = project.structuralModel.members;

  const nodeMap = new Map<string, Node>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const membersByStartNode = new Map<string, Member[]>();
  const membersByEndNode = new Map<string, Member[]>();
  const allMembersByNode = new Map<string, Member[]>();

  for (const m of members) {
    if (!membersByStartNode.has(m.startNodeId)) membersByStartNode.set(m.startNodeId, []);
    membersByStartNode.get(m.startNodeId)!.push(m);

    if (!membersByEndNode.has(m.endNodeId)) membersByEndNode.set(m.endNodeId, []);
    membersByEndNode.get(m.endNodeId)!.push(m);

    if (!allMembersByNode.has(m.startNodeId)) allMembersByNode.set(m.startNodeId, []);
    allMembersByNode.get(m.startNodeId)!.push(m);
    
    if (!allMembersByNode.has(m.endNodeId)) allMembersByNode.set(m.endNodeId, []);
    allMembersByNode.get(m.endNodeId)!.push(m);
  }

  for (const node of nodes) {
    const connectedMembers = allMembersByNode.get(node.id) || [];
    
    // 1. BASE_PLATE
    if (node.role === "BASE") {
      const columns = connectedMembers.filter(m => m.type === "COLUMN" || m.type === "TAPERED_COLUMN" || m.type === "END_WALL_COLUMN" || m.type === "CRANE_COLUMN");
      for (const col of columns) {
        connections.push({
          id: createId(),
          projectId: project.id,
          type: "BASE_PLATE",
          nodeId: node.id,
          sourceMemberIds: [col.id],
          status: "REQUIRES_ENGINEERING_REVIEW",
          components: [],
          metadata: { generatedBy: "CONNECTION_SYSTEM", basePlateNote: "Anchor bolts and plate dimensions are NOT_YET_DEFINED." }
        });
      }
    }

    // 2. RAFTER_COLUMN
    if (node.role === "EAVE") {
      const rafters = connectedMembers.filter(m => m.type === "RAFTER" || m.type === "TAPERED_RAFTER");
      const columns = connectedMembers.filter(m => m.type === "COLUMN" || m.type === "TAPERED_COLUMN" || m.type === "END_WALL_COLUMN");
      
      if (rafters.length > 0 && columns.length > 0) {
        connections.push({
          id: createId(),
          projectId: project.id,
          type: "RAFTER_COLUMN",
          nodeId: node.id,
          sourceMemberIds: [...rafters.map(r => r.id), ...columns.map(c => c.id)],
          status: "REQUIRES_ENGINEERING_REVIEW",
          components: [],
          metadata: { generatedBy: "CONNECTION_SYSTEM" }
        });
      }
    }

    // 3. RAFTER_SPLICE
    if (node.role === "RIDGE" || node.role === "INTERMEDIATE_ROOF") {
      const rafters = connectedMembers.filter(m => m.type === "RAFTER" || m.type === "TAPERED_RAFTER");
      // Only generate if there's an actual physical splice configured. 
      // An analytical junction must not automatically be classified as a physical splice.
      if ((node.metadata?.isSplice === true || node.metadata?.splice === true) && rafters.length >= 2) {
        connections.push({
          id: createId(),
          projectId: project.id,
          type: "RAFTER_SPLICE",
          nodeId: node.id,
          sourceMemberIds: rafters.map(r => r.id),
          status: "REQUIRES_ENGINEERING_REVIEW",
          components: [],
          metadata: { generatedBy: "CONNECTION_SYSTEM" }
        });
      }
    }

    // 4. CRANE_BRACKET
    if (node.role === "CRANE_SUPPORT") {
      const runways = connectedMembers.filter(m => m.type === "CRANE_RUNWAY");
      if (runways.length > 0) {
        connections.push({
          id: createId(),
          projectId: project.id,
          type: "CRANE_BRACKET",
          nodeId: node.id,
          sourceMemberIds: runways.map(r => r.id),
          status: "REQUIRES_ENGINEERING_REVIEW",
          components: [],
          metadata: { generatedBy: "CONNECTION_SYSTEM" }
        });
      }
    }

    // 5. SECONDARY
    if (node.role === "PURLIN" || node.role === "GIRT") {
      const secondary = connectedMembers.filter(m => m.type === "PURLIN" || m.type === "GIRT" || m.type === "EAVE_STRUT");
      if (secondary.length > 0) {
         connections.push({
          id: createId(),
          projectId: project.id,
          type: node.role === "PURLIN" ? "PURLIN" : "GIRT",
          nodeId: node.id,
          sourceMemberIds: secondary.map(s => s.id),
          status: "REQUIRES_ENGINEERING_REVIEW",
          components: [],
          metadata: { generatedBy: "CONNECTION_SYSTEM" }
        });
      }
    }

    // 6. BRACING
    if (node.role === "BRACING") {
      const bracings = connectedMembers.filter(m => m.type === "ROOF_BRACING" || m.type === "WALL_BRACING");
      const primary = connectedMembers.filter(m => m.type !== "ROOF_BRACING" && m.type !== "WALL_BRACING");
      if (bracings.length > 0) {
         connections.push({
          id: createId(),
          projectId: project.id,
          type: "BRACING",
          nodeId: node.id,
          sourceMemberIds: [...bracings.map(b => b.id), ...primary.map(p => p.id)],
          status: "REQUIRES_ENGINEERING_REVIEW",
          components: [],
          metadata: { generatedBy: "CONNECTION_SYSTEM" }
        });
      }
    }
  }

  // Idempotency: sort by node ID to ensure deterministic order
  connections.sort((a, b) => (a.nodeId || "").localeCompare(b.nodeId || ""));

  return connections;
}
