export interface StaadContext {
  projectId: string;
  lines: string[];
  nodeMap: Map<string, number>; // canonicalId -> staadId
  memberMap: Map<string, number>; // canonicalId -> staadId
  loadCaseMap: Map<string, number>; // canonicalId -> staadLoadCaseId
  warnings: string[];
  errors: string[];
  supportedSections: Set<string>;
  nextNodeId: number;
  nextMemberId: number;
  nextLoadCaseId: number;
}

export interface StaadExportResult {
  content: string;
  metadata: {
    modelHash: string;
    serializerVersion: string;
    nodeCount: number;
    memberCount: number;
  };
  warnings: string[];
  errors: string[];
  status: "EXPORT_READY" | "EXPORT_WITH_WARNINGS" | "EXPORT_BLOCKED";
}
