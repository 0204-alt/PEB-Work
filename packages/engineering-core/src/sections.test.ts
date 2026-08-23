import { describe, it, expect } from "vitest";
import { calculateBuiltUpProperties, calculateTaperedProperties } from "./sections.js";
import { calculateShearModulus } from "./materials.js";

describe("Material Engine", () => {
  it("should calculate shear modulus correctly", () => {
    // E = 200000 MPa, v = 0.3 -> G = 200000 / 2.6 ≈ 76923
    const G = calculateShearModulus(200000, 0.3);
    expect(G).toBeCloseTo(76923.077, 1);
  });
});

describe("Section Property Engine", () => {
  it("should calculate deterministic properties for a symmetric built-up I-section", () => {
    // E.g., depth 500, web 10, flanges 200x16
    const config = {
      type: "BUILT_UP" as const,
      depth_mm: 500,
      webThickness_mm: 10,
      topFlangeWidth_mm: 200,
      topFlangeThickness_mm: 16,
      bottomFlangeWidth_mm: 200,
      bottomFlangeThickness_mm: 16,
    };
    // Steel density: 7850 kg/m^3
    const density = 7850;

    const props = calculateBuiltUpProperties(config, density);

    const hw = 500 - 32; // 468
    const aTop = 200 * 16; // 3200
    const aBot = 200 * 16; // 3200
    const aWeb = 10 * 468; // 4680
    const expectedArea = aTop + aBot + aWeb; // 11080 mm^2

    expect(props.area_mm2).toBe(expectedArea);

    const expectedMass = (expectedArea / 1_000_000) * density;
    expect(props.unitMass_kgpm).toBeCloseTo(expectedMass, 5);

    // Symmetric section centroid should be exactly at mid-height
    // Ix = 2 * (1/12 * 200 * 16^3 + 3200 * 242^2) + (1/12 * 10 * 468^3)
    // Ix_flanges = 2 * (68266.67 + 187404800) = 374946133.33
    // Ix_web = 85419360
    // Total Ix = 460365493.33
    expect(props.Ix_mm4).toBeCloseTo(460365493.33, 1);

    // Zx = Ix / (d/2) = 460365493.33 / 250 = 1841461.97
    expect(props.Zx_mm3).toBeCloseTo(1841461.97, 1);

    // Iy = 2 * (1/12 * 16 * 200^3) + 1/12 * 468 * 10^3
    // Iy_flanges = 2 * (10666666.67) = 21333333.33
    // Iy_web = 39000
    // Total Iy = 21372333.33
    expect(props.Iy_mm4).toBeCloseTo(21372333.33, 1);
  });

  it("should calculate properties for an asymmetric built-up I-section", () => {
    // depth 600, top flange 200x12, bottom flange 300x20, web 8
    const config = {
      type: "BUILT_UP" as const,
      depth_mm: 600,
      webThickness_mm: 8,
      topFlangeWidth_mm: 200,
      topFlangeThickness_mm: 12,
      bottomFlangeWidth_mm: 300,
      bottomFlangeThickness_mm: 20,
    };

    const props = calculateBuiltUpProperties(config, 7850);
    const hw = 600 - 12 - 20; // 568
    const aTop = 200 * 12; // 2400
    const aBot = 300 * 20; // 6000
    const aWeb = 8 * 568; // 4544
    const expectedArea = aTop + aBot + aWeb; // 12944

    expect(props.area_mm2).toBe(expectedArea);

    const yBot = 10;
    const yWeb = 20 + 568 / 2; // 304
    const yTop = 600 - 6; // 594

    const yBar = (aBot * yBot + aWeb * yWeb + aTop * yTop) / expectedArea;
    // (60000 + 1381376 + 1425600) / 12944 = 2866976 / 12944 ≈ 221.4907
    
    expect(props.Ix_mm4).toBeGreaterThan(0);
    expect(props.Iy_mm4).toBeGreaterThan(0);
    
    // Zx should divide by the max distance from centroid
    const maxDist = Math.max(yBar, 600 - yBar);
    expect(props.Zx_mm3).toBeCloseTo(props.Ix_mm4 / maxDist, 3);
  });

  it("should interpolate tapered sections correctly", () => {
    const config = {
      type: "TAPERED" as const,
      startDepth_mm: 400,
      endDepth_mm: 800,
      webThickness_mm: 8,
      topFlangeWidth_mm: 200,
      topFlangeThickness_mm: 12,
      bottomFlangeWidth_mm: 200,
      bottomFlangeThickness_mm: 12,
      length_m: 6,
    };

    const midProps = calculateTaperedProperties(config, 0.5, 7850);
    // At locationRatio = 0.5, depth should be 600
    const builtUp600 = calculateBuiltUpProperties({
      type: "BUILT_UP",
      depth_mm: 600,
      webThickness_mm: 8,
      topFlangeWidth_mm: 200,
      topFlangeThickness_mm: 12,
      bottomFlangeWidth_mm: 200,
      bottomFlangeThickness_mm: 12,
    }, 7850);

    expect(midProps).toEqual(builtUp600);
  });

  it("should throw error on invalid built-up geometry", () => {
    const config = {
      type: "BUILT_UP" as const,
      depth_mm: 10,
      webThickness_mm: 10,
      topFlangeWidth_mm: 200,
      topFlangeThickness_mm: 16,
      bottomFlangeWidth_mm: 200,
      bottomFlangeThickness_mm: 16,
    };
    expect(() => calculateBuiltUpProperties(config, 7850)).toThrowError(/flanges thicker than overall depth/);
  });
});
