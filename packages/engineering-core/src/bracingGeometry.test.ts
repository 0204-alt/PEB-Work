import { describe, it, expect } from "vitest";
import { generateBracing } from "./bracingGeometry.js";
import { createEmptyProject } from "./emptyProject.js";

describe("generateBracing", () => {
  it("should generate roof bracing members if enabled", () => {
    const project = createEmptyProject({
      name: "Test",
      location: "Loc",
      buildingType: "Type",
      length_m: 20,
      width_m: 10,
      eaveHeight_m: 6
    });

    const hasRoofBracing = project.structuralModel.members.some(m => m.type === "ROOF_BRACING");
    expect(hasRoofBracing).toBe(true);
  });

  it("should generate wall bracing members if enabled", () => {
    const project = createEmptyProject({
      name: "Test",
      location: "Loc",
      buildingType: "Type",
      length_m: 20,
      width_m: 10,
      eaveHeight_m: 6
    });

    const hasWallBracing = project.structuralModel.members.some(m => m.type === "WALL_BRACING");
    expect(hasWallBracing).toBe(true);
  });
});
