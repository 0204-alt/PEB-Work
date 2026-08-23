export function checkCombinedUtilization(
  axialUtil: number,
  bendingUtil: number
): { utilization: number; status: string; warnings: string[] } {
  // Linear interaction for preliminary design
  // P/Pd + M/Md <= 1.0
  const combined = axialUtil + bendingUtil;
  return {
    utilization: combined,
    status: combined <= 1.0 ? "PASS" : "FAIL",
    warnings: [],
  };
}
