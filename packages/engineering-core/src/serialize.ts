import {
  CanonicalProjectSchema,
  type CanonicalProject,
} from "./types.js";

export function serializeProject(project: CanonicalProject): string {
  const parsed = CanonicalProjectSchema.parse(project);
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export function deserializeProject(json: string): CanonicalProject {
  const data: unknown = JSON.parse(json);
  return CanonicalProjectSchema.parse(data);
}

export function cloneProject(project: CanonicalProject): CanonicalProject {
  return deserializeProject(serializeProject(project));
}
