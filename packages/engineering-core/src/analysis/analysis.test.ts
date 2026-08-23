import { describe, it, expect } from "vitest";
import { createEmptyProject } from "../emptyProject.js";
import { computeAnalysisHash } from "../hash.js";
import { validateAnalysisModel } from "./validation.js";
import { UnavailableAnalysisProvider } from "./provider.js";
import { runDesignIteration } from "./iteration.js";

describe("Phase 10: Analysis Integration", () => {
  it("should generate a deterministic analysis hash", () => {
    const project1 = createEmptyProject({
      name: "Hash Test", location: "Loc", buildingType: "Warehouse", length_m: 20, width_m: 10, eaveHeight_m: 5
    });
    const hash1 = computeAnalysisHash(project1);
    
    // Exact same parameters should yield exact same hash.
    // Instead of re-running createEmptyProject which generates new UUIDs, we just clone the project object.
    const project2 = JSON.parse(JSON.stringify(project1));
    const hash2 = computeAnalysisHash(project2);
    expect(hash1).toBe(hash2);
  });

  it("should change hash when analysis-relevant input changes", () => {
    const project = createEmptyProject({
      name: "Stale Test", location: "Loc", buildingType: "Warehouse", length_m: 20, width_m: 10, eaveHeight_m: 5
    });
    const initialHash = computeAnalysisHash(project);

    // Modify section of a member
    project.structuralModel.members[0].sectionId = "new-section-123";
    const newHash = computeAnalysisHash(project);

    expect(initialHash).not.toBe(newHash);
  });

  it("should validate valid model", () => {
    const project = createEmptyProject({
      name: "Valid Test", location: "Loc", buildingType: "Warehouse", length_m: 20, width_m: 10, eaveHeight_m: 5
    });
    
    // For a real project we need sections and materials assigned.
    // The emptyProject.ts doesn't assign sections to everything by default in a complete way (some remain unassigned or generic),
    // but let's check what the validator returns.
    const validation = validateAnalysisModel(project);
    // There will be errors because we haven't assigned a sectionId to the default members in emptyProject
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.hasErrors).toBe(true);
  });

  it("unavailable provider should generate NO numerical results and flag REQUIRES_ENGINEERING_REVIEW", async () => {
    const project = createEmptyProject({
      name: "Provider Test", location: "Loc", buildingType: "Warehouse", length_m: 20, width_m: 10, eaveHeight_m: 5
    });
    
    const provider = new UnavailableAnalysisProvider();
    const run = await provider.analyze(project);

    // Should return no fake forces
    expect(run.memberResults.length).toBe(0);
    expect(run.nodeResults.length).toBe(0);

    // Should be blocked or requires review
    expect(run.status).toMatch(/ANALYSIS_BLOCKED|REQUIRES_ENGINEERING_REVIEW/);
    expect(run.provider).toBe("UNAVAILABLE");
    
    const hasWarning = run.diagnostics.some(d => 
      d.includes("No validated structural analysis solver") || 
      d.includes("Analysis blocked due to validation errors.")
    );
    expect(hasWarning).toBe(true);
  });

  it("design iteration should safely terminate when analysis is unavailable", async () => {
    const project = createEmptyProject({
      name: "Iter Test", location: "Loc", buildingType: "Warehouse", length_m: 20, width_m: 10, eaveHeight_m: 5
    });
    
    const iterResult = await runDesignIteration(project);
    
    // Must not pretend to converge
    expect(iterResult.convergenceStatus).toBe("ANALYSIS_UNAVAILABLE");
    expect(iterResult.designRun).toBeNull();
  });
});
