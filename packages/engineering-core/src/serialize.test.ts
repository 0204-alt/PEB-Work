import { describe, expect, it } from "vitest";
import { createId } from "./ids.js";
import { createEmptyProject } from "./emptyProject.js";
import { computeInputHash } from "./hash.js";
import { cloneProject, deserializeProject, serializeProject } from "./serialize.js";
import { assertStructuralInvariants, DomainInvariantError } from "./invariants.js";
import type { CanonicalProject } from "./types.js";

describe("canonical project serialize/deserialize", () => {
  it("round-trips an empty Phase 1 project without losing structural fields", () => {
    const original = createEmptyProject({
      name: "Neemrana factory",
      location: "Neemrana",
      buildingType: "Warehouse",
      length_m: 175,
      width_m: 120,
      eaveHeight_m: 9.5,
      client: "Example",
    });
    const json = serializeProject(original);
    const restored = deserializeProject(json);
    expect(restored).toEqual(original);
    expect(restored.schemaVersion).toBe("1.0.0");
    expect(restored.geometry.length_m).toBe(175);
    expect(restored.geometry.spans).toHaveLength(1);
    expect(restored.structuralModel.nodes.length).toBeGreaterThan(0);
    expect(restored.validationRuns.length).toBe(1);
    expect(restored.validationRuns[0].exportBlocked).toBe(true);
    expect(restored.benchmark.note).toMatch(/never scale/i);
    expect(restored.disclaimer).toMatch(/PRELIMINARY DESIGN/);
  });

  it("round-trips nodes, members, supports, loads and combinations", () => {
    const base = createEmptyProject({
      name: "Two-node frame",
      location: "Delhi",
      buildingType: "Single Span PEB",
      length_m: 12,
      width_m: 6,
      eaveHeight_m: 8,
    });
    const n1 = createId();
    const n2 = createId();
    const m1 = createId();
    const sectionId = createId();
    const materialId = createId();
    const loadCaseId = createId();
    const comboId = createId();
    const populated: CanonicalProject = {
      ...base,
      materials: [
        {
          id: materialId,
          name: "Structural steel",
          grade: "E350",
          fy_MPa: 350,
          fu_MPa: 490,
          E_MPa: 2e5,
          poisson: 0.3,
          density_kgpm3: 7850,
          source: "Catalog placeholder — properties require confirmed material table",
          catalogVersion: "unset",
        },
      ],
      sections: [
        {
          id: sectionId,
          family: "built-up-I",
          designation: "PLACEHOLDER-NOT-FOR-DESIGN",
          unitMass_kgpm: 67,
          catalogVersion: "unset",
          source: "Test fixture only",
          geometryNotes: "Not a production section",
        },
      ],
      structuralModel: {
        nodes: [
          {
            id: n1,
            projectId: base.id,
            label: "N001",
            x_m: 0,
            y_m: 0,
            z_m: 0,
            role: "BASE",
            metadata: {},
          },
          {
            id: n2,
            projectId: base.id,
            label: "N002",
            x_m: 0,
            y_m: 8,
            z_m: 0,
            role: "EAVE",
            metadata: {},
          },
        ],
        members: [
          {
            id: m1,
            projectId: base.id,
            label: "M001",
            type: "COLUMN",
            startNodeId: n1,
            endNodeId: n2,
            sectionId,
            materialId,
            designGroup: "MAIN_COLUMNS",
            length_m: 8,
            quantity: 1,
            unitMass_kgpm: 67,
            totalWeight_kg: 536,
            weightStatus: "PRELIMINARY",
            metadata: {},
          },
        ],
        supports: [{ id: createId(), nodeId: n1, type: "PINNED", notes: "" }],
        releases: [],
      },
      loadCases: [
        {
          id: loadCaseId,
          projectId: base.id,
          type: "DEAD",
          description: "Self weight placeholder",
          source: "NOT_IMPLEMENTED",
          designBasisId: base.designBasis.id,
          status: "NOT_IMPLEMENTED",
          applications: [
            {
              id: createId(),
              loadCaseId,
              targetType: "MEMBER",
              targetId: m1,
              magnitude: -1,
              direction: "GY",
              units: "factor",
              source: "Test source",
              designBasisRef: "Test ref",
              description: "SELFWEIGHT placeholder — not a calculated load",
              metadata: {},
            },
          ],
        },
      ],
      loadCombinations: [
        {
          id: comboId,
          projectId: base.id,
          label: "ULS-PLACEHOLDER",
          category: "ULS",
          source: "NOT_IMPLEMENTED",
          status: "NOT_IMPLEMENTED",
          factors: [{ loadCaseId, factor: 1.5 }],
        },
      ],
    };

    assertStructuralInvariants(populated);
    const restored = cloneProject(populated);
    expect(restored.structuralModel.nodes[1]?.y_m).toBe(8);
    expect(restored.structuralModel.members[0]?.startNodeId).toBe(n1);
    expect(restored.structuralModel.members[0]?.totalWeight_kg).toBe(536);
    expect(restored.loadCombinations[0]?.factors[0]?.factor).toBe(1.5);
    expect(computeInputHash(populated)).toBe(computeInputHash(restored));
  });

  it("rejects a member that references a missing node", () => {
    const base = createEmptyProject({
      name: "Broken",
      location: "Delhi",
      buildingType: "Warehouse",
      length_m: 10,
      width_m: 10,
      eaveHeight_m: 8,
    });
    const n1 = createId();
    const broken: CanonicalProject = {
      ...base,
      structuralModel: {
        nodes: [
          {
            id: n1,
            projectId: base.id,
            label: "N001",
            x_m: 0,
            y_m: 0,
            z_m: 0,
            role: "BASE",
            metadata: {},
          },
        ],
        members: [
          {
            id: createId(),
            projectId: base.id,
            label: "M1042",
            type: "RAFTER",
            startNodeId: n1,
            endNodeId: createId(),
            designGroup: "RAFTERS",
            length_m: 1,
            quantity: 1,
            weightStatus: "NOT_IMPLEMENTED",
            metadata: {},
          },
        ],
        supports: [],
        releases: [],
      },
    };
    expect(() => assertStructuralInvariants(broken)).toThrow(DomainInvariantError);
    expect(() => assertStructuralInvariants(broken)).toThrow(/missing node/i);
  });

  it("does not treat benchmark as engineering mass", () => {
    const project = createEmptyProject({
      name: "Benchmark isolation",
      location: "Neemrana",
      buildingType: "Warehouse",
      length_m: 175,
      width_m: 120,
      eaveHeight_m: 9.5,
    });
    project.benchmark.enabled = true;
    project.benchmark.kgPerM2 = 34.155;
    project.benchmark.benchmarkMass_kg = 34.155 * 175 * 120;
    project.benchmark.engineeringMass_kg = 0;
    project.benchmark.difference_kg =
      (project.benchmark.engineeringMass_kg ?? 0) -
      (project.benchmark.benchmarkMass_kg ?? 0);
    expect(project.benchmark.benchmarkMass_kg).toBeCloseTo(717255, 0);
    expect(project.benchmark.engineeringMass_kg).not.toBe(
      project.benchmark.benchmarkMass_kg,
    );
  });
});
