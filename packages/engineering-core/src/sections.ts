import type { Material, Section } from "./types.js";
import { z } from "zod";
import { BuiltUpGeometrySchema, TaperedGeometrySchema } from "./types.js";

type BuiltUpConfig = z.infer<typeof BuiltUpGeometrySchema>;
type TaperedConfig = z.infer<typeof TaperedGeometrySchema>;

export interface CalculatedSectionProperties {
  area_mm2: number;
  Ix_mm4: number;
  Iy_mm4: number;
  Zx_mm3: number;
  Zy_mm3: number;
  rx_mm: number;
  ry_mm: number;
  unitMass_kgpm: number;
}

export function calculateBuiltUpProperties(
  config: BuiltUpConfig,
  density_kgpm3: number
): CalculatedSectionProperties {
  const {
    depth_mm: d,
    webThickness_mm: tw,
    topFlangeWidth_mm: btf,
    topFlangeThickness_mm: ttf,
    bottomFlangeWidth_mm: bbf,
    bottomFlangeThickness_mm: tbf,
  } = config;

  if (d <= ttf + tbf) {
    throw new Error("Invalid built-up geometry: flanges thicker than overall depth.");
  }
  if (tw <= 0 || btf <= 0 || ttf <= 0 || bbf <= 0 || tbf <= 0) {
    throw new Error("Invalid built-up geometry: dimensions must be greater than zero.");
  }

  const hw = d - ttf - tbf; // web height

  const Atop = btf * ttf;
  const Aweb = tw * hw;
  const Abot = bbf * tbf;
  
  const area_mm2 = Atop + Aweb + Abot;

  // Unit mass calculation: area (mm2) -> m2 * density (kg/m3)
  const unitMass_kgpm = (area_mm2 / 1_000_000) * density_kgpm3;

  // Y distances from bottom
  const yBot = tbf / 2;
  const yWeb = tbf + hw / 2;
  const yTop = d - ttf / 2;

  // Centroid from bottom
  const yBar = (Abot * yBot + Aweb * yWeb + Atop * yTop) / area_mm2;

  // Moment of Inertia Ix
  const ixBot = (bbf * Math.pow(tbf, 3)) / 12 + Abot * Math.pow(yBot - yBar, 2);
  const ixWeb = (tw * Math.pow(hw, 3)) / 12 + Aweb * Math.pow(yWeb - yBar, 2);
  const ixTop = (btf * Math.pow(ttf, 3)) / 12 + Atop * Math.pow(yTop - yBar, 2);
  const Ix_mm4 = ixBot + ixWeb + ixTop;

  // Moment of Inertia Iy
  const iyBot = (tbf * Math.pow(bbf, 3)) / 12;
  const iyWeb = (hw * Math.pow(tw, 3)) / 12;
  const iyTop = (ttf * Math.pow(btf, 3)) / 12;
  const Iy_mm4 = iyBot + iyWeb + iyTop;

  // Section Moduli
  const yTopDist = d - yBar;
  const yBotDist = yBar;
  const Zx_mm3 = Ix_mm4 / Math.max(yTopDist, yBotDist);
  
  const xMaxDist = Math.max(btf / 2, bbf / 2, tw / 2);
  const Zy_mm3 = Iy_mm4 / xMaxDist;

  // Radius of gyration
  const rx_mm = Math.sqrt(Ix_mm4 / area_mm2);
  const ry_mm = Math.sqrt(Iy_mm4 / area_mm2);

  return {
    area_mm2,
    Ix_mm4,
    Iy_mm4,
    Zx_mm3,
    Zy_mm3,
    rx_mm,
    ry_mm,
    unitMass_kgpm,
  };
}

export function calculateTaperedProperties(
  config: TaperedConfig,
  locationRatio: number, // 0 = start, 1 = end
  density_kgpm3: number
): CalculatedSectionProperties {
  if (locationRatio < 0 || locationRatio > 1) {
    throw new Error("Location ratio must be between 0 and 1");
  }

  // Linear interpolation of depth
  const depth_mm = config.startDepth_mm + locationRatio * (config.endDepth_mm - config.startDepth_mm);

  const builtUpConfig: BuiltUpConfig = {
    type: "BUILT_UP",
    depth_mm,
    webThickness_mm: config.webThickness_mm,
    topFlangeWidth_mm: config.topFlangeWidth_mm,
    topFlangeThickness_mm: config.topFlangeThickness_mm,
    bottomFlangeWidth_mm: config.bottomFlangeWidth_mm,
    bottomFlangeThickness_mm: config.bottomFlangeThickness_mm,
  };

  return calculateBuiltUpProperties(builtUpConfig, density_kgpm3);
}
