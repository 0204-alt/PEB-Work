import { describe, expect, it } from "vitest";
import { createEmptyProject, serializeProject, deserializeProject } from "@peb/engineering-core";

describe("API domain contract", () => {
  it("create payload produces a serializable canonical project", () => {
    const project = createEmptyProject({
      name: "API fixture",
      location: "Delhi",
      buildingType: "Warehouse",
      length_m: 40,
      width_m: 20,
      eaveHeight_m: 8,
    });
    expect(project.validationRuns[0].exportBlocked).toBe(true);
    expect(deserializeProject(serializeProject(project)).id).toBe(project.id);
  });
});
