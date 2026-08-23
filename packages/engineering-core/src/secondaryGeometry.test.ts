import { describe, it, expect } from "vitest";
import { generateGridSystem, generateGeometry } from "./geometry.js";
import { generateSecondarySteel } from "./secondaryGeometry.js";
import type { Geometry } from "./types.js";

describe("secondary geometry engine", () => {
  const config: Geometry = {
    id: "geom-1",
    projectId: "proj-1",
    length_m: 30,
    width_m: 20,
    eaveHeight_m: 8,
    roofSlopeRiseRun: "1:10",
    baySpacing_m: 6,
    unequalFinalBay: false,
    gridLines: [],
    bays: [],
    spans: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    purlinConfig: {
      enabled: true,
      spacing_m: 1.5,
      sectionSelectionMode: "AUTO"
    },
    girtConfig: {
      enabled: true,
      spacing_m: 2.0,
      sectionSelectionMode: "AUTO"
    },
    eaveStrutConfig: {
      enabled: true,
      sectionSelectionMode: "AUTO"
    }
  };

  it("should generate eave struts, purlins, and girts", () => {
    // 1. Generate primary geometry
    const primary = generateGeometry(config);
    expect(primary.members.filter(m => m.type === "RAFTER").length).toBeGreaterThan(0);
    
    // 2. Generate secondary steel
    const withSecondary = generateSecondarySteel(config, primary);
    
    const eaveStruts = withSecondary.members.filter(m => m.type === "EAVE_STRUT");
    expect(eaveStruts.length).toBeGreaterThan(0);
    
    const purlins = withSecondary.members.filter(m => m.type === "PURLIN");
    expect(purlins.length).toBeGreaterThan(0);
    
    const girts = withSecondary.members.filter(m => m.type === "GIRT");
    expect(girts.length).toBeGreaterThan(0);
    
    // No duplicates
    const memberIds = new Set(withSecondary.members.map(m => m.id));
    expect(memberIds.size).toBe(withSecondary.members.length);
  });
});
