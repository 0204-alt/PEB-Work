import { describe, it, expect } from "vitest";
import { generateGridSystem, generateGeometry } from "./geometry.js";

describe("geometry engine", () => {
  it("should generate deterministic grid for divisible bay spacing", () => {
    const result = generateGridSystem(30, 20, 6, undefined, false);
    
    expect(result.gridLines.filter(g => g.axis === "Z")).toHaveLength(2); // A, B
    expect(result.gridLines.filter(g => g.axis === "X")).toHaveLength(6); // 1 to 6
    
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0].width_m).toBe(20);
    
    expect(result.bays).toHaveLength(5);
    expect(result.bays[0].length_m).toBe(6);
    expect(result.bays[4].length_m).toBe(6);
    expect(result.bays[4].endX_m).toBe(30);
  });

  it("should generate deterministic grid for unequal final bay", () => {
    const result = generateGridSystem(32, 20, 6, undefined, true);
    
    expect(result.bays).toHaveLength(6); // 5 * 6 = 30, plus 1 * 2 = 32
    expect(result.bays[4].length_m).toBe(6);
    expect(result.bays[5].length_m).toBe(2);
    expect(result.bays[5].endX_m).toBe(32);
    
    expect(result.gridLines.filter(g => g.axis === "X")).toHaveLength(7);
  });

  it("should divide length equally by numberOfBays", () => {
    const result = generateGridSystem(30, 15, undefined, 5, false);
    
    expect(result.bays).toHaveLength(5);
    result.bays.forEach(bay => {
      expect(bay.length_m).toBe(6);
    });
    expect(result.bays[4].endX_m).toBe(30);
  });
});

describe("geometry engine node and member generation", () => {
  it("should generate proper nodes and members for a single span building", () => {
    const config = {
      id: "geom-1",
      projectId: "proj-1",
      length_m: 30,
      width_m: 20,
      eaveHeight_m: 8,
      roofSlopeRiseRun: "1:10",
      baySpacing_m: 6,
      numberOfBays: undefined,
      unequalFinalBay: false,
      gridLines: [],
      bays: [],
      spans: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { nodes, members, gridLines } = generateGeometry(config as any);

    // 5 bays = 6 frames (grid lines)
    // 6 frames * 5 nodes per frame = 30 nodes
    expect(nodes).toHaveLength(30);
    // 6 frames * 4 members per frame = 24 members
    expect(members).toHaveLength(24);

    const xGrids = gridLines.filter(g => g.axis === "X");
    expect(xGrids).toHaveLength(6);

    // Verify ridge height (slope 1:10 = 0.1, span = 20, half span = 10, rise = 1)
    // Ridge should be 8 + 1 = 9m
    const ridgeNode = nodes.find(n => n.role === "RIDGE");
    expect(ridgeNode).toBeDefined();
    expect(ridgeNode?.y_m).toBe(9);
    
    // Validate end-wall column logic
    const firstFrameRafters = members.filter(m => m.startNodeId === nodes[0].id || m.endNodeId === nodes[0].id);
    const endWallColumns = members.filter(m => m.type === "END_WALL_COLUMN");
    expect(endWallColumns).toHaveLength(4); // 2 on first frame, 2 on last frame
  });
});
