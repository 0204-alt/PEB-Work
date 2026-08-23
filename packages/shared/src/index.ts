export const ROLES = [
  "ADMIN",
  "DESIGN_ENGINEER",
  "ESTIMATOR",
  "REVIEWER",
  "VIEWER",
] as const;

export type Role = (typeof ROLES)[number];

export const PROJECT_SCHEMA_VERSION = "1.0.0";
export const APPLICATION_VERSION = "0.1.0-phase1";

export const COORDINATE_SYSTEM = {
  x: "building length (m)",
  y: "vertical height (m)",
  z: "building width (m)",
} as const;

export const ENGINEERING_DISCLAIMER =
  "PRELIMINARY DESIGN / ESTIMATION — FINAL STRUCTURAL DESIGN TO BE VERIFIED BY QUALIFIED ENGINEER.";
