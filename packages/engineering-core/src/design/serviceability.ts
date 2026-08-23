export function checkServiceability(
  memberType: string,
  length_m: number
): { limit: string; status: string; warnings: string[] } {
  // Real serviceability needs deflection results from structural analysis
  // As this is preliminary without a solver, we mark it as AWAITING ANALYSIS
  return {
    limit: memberType === "RAFTER" || memberType === "TAPERED_RAFTER" ? "Span/150" : "H/150",
    status: "AWAITING_ANALYSIS",
    warnings: ["Deflection cannot be calculated without global structural analysis (Phase 10)"],
  };
}
