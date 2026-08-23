import { CanonicalProject, LoadApplication } from "../types.js";
import { StaadContext } from "./types.js";

export function serializeLoads(project: CanonicalProject, ctx: StaadContext) {
  if (project.loadCases.length === 0) return;

  const sortedLoadCases = [...project.loadCases].sort((a, b) => a.id.localeCompare(b.id));

  for (const lc of sortedLoadCases) {
    // If Crane is OFF, do not export crane loads
    if (lc.type === "CRANE" && !project.geometry.craneConfig?.craneEnabled) {
      continue;
    }

    const staadLoadId = ctx.nextLoadCaseId++;
    ctx.loadCaseMap.set(lc.id, staadLoadId);
    
    // We sanitize title to avoid newlines or invalid characters
    const safeTitle = lc.description.replace(/[\r\n]+/g, " ").substring(0, 50);
    ctx.lines.push(`LOAD ${staadLoadId} LOADTYPE ${getLoadType(lc.type)} TITLE ${safeTitle}`);
    
    const selfWeightApp = lc.applications.find(a => a.targetType === "MEMBER_GROUP" && a.source === "SELF_WEIGHT");
    if (selfWeightApp) {
      // Check for double counting
      // Only export SELFWEIGHT Y -1 if explicitly defined in canonical model as intended
      ctx.lines.push(`SELFWEIGHT Y -1`);
    }

    const otherApps = lc.applications.filter(a => !(a.targetType === "MEMBER_GROUP" && a.source === "SELF_WEIGHT"));
    if (otherApps.length > 0) {
      serializeLoadApplications(otherApps, ctx);
    }
  }
}

function getLoadType(type: string): string {
  switch (type) {
    case "DEAD": return "DEAD";
    case "LIVE": return "LIVE";
    case "WIND_PLUS_X":
    case "WIND_MINUS_X":
    case "WIND_PLUS_Z":
    case "WIND_MINUS_Z": return "WIND";
    case "CRANE": return "CRANE";
    case "SEISMIC": return "SEISMIC";
    default: return "NONE";
  }
}

function serializeLoadApplications(apps: LoadApplication[], ctx: StaadContext) {
  const jointLoads: string[] = [];
  const memberLoads: string[] = [];
  
  for (const app of apps) {
    if (app.targetType === "NODE") {
      const staadId = ctx.nodeMap.get(app.targetId);
      if (!staadId) {
        ctx.errors.push(`Load targets unknown node ${app.targetId}`);
        continue;
      }
      const staadDir = getStaadDirection(app.direction);
      if (!staadDir) {
        ctx.errors.push(`Load direction ${app.direction} unsupported.`);
        continue;
      }
      jointLoads.push(`${staadId} ${staadDir} ${app.magnitude.toFixed(4)}`);
    } else if (app.targetType === "MEMBER") {
      const staadId = ctx.memberMap.get(app.targetId);
      if (!staadId) {
        ctx.errors.push(`Load targets unknown member ${app.targetId}`);
        continue;
      }
      
      const staadDir = getStaadDirection(app.direction);
      if (!staadDir) {
        ctx.errors.push(`Load direction ${app.direction} unsupported.`);
        continue;
      }

      // Check if it's a point load or uniform line load based on metadata/source
      // Since our canonical model currently abstracts surface loads to line loads in load engine
      // we assume UNI (Uniform) for line loads if units are kN/m, or CON (Concentrated) if kN
      if (app.units === "kN/m") {
        memberLoads.push(`${staadId} UNI ${staadDir} ${app.magnitude.toFixed(4)}`);
      } else if (app.units === "kN") {
        // Point load, assume at center for now if no location is specified
        // NOTE: Precise load locations require more schema depth
        memberLoads.push(`${staadId} CON ${staadDir} ${app.magnitude.toFixed(4)}`);
      } else if (app.units === "kN/m2") {
        ctx.errors.push(`Surface loads directly applied to members are unsupported in basic generic STAAD export.`);
      } else {
        ctx.errors.push(`Unsupported load unit ${app.units}`);
      }
    } else {
      ctx.errors.push(`Load application target type ${app.targetType} is UNSUPPORTED.`);
    }
  }

  if (jointLoads.length > 0) {
    ctx.lines.push("JOINT LOAD");
    ctx.lines.push(...jointLoads);
  }
  
  if (memberLoads.length > 0) {
    ctx.lines.push("MEMBER LOAD");
    ctx.lines.push(...memberLoads);
  }
}

function getStaadDirection(dir: string): string | null {
  switch(dir) {
    case "GX": return "FX";
    case "GY": return "FY";
    case "GZ": return "FZ";
    case "MX": return "MX";
    case "MY": return "MY";
    case "MZ": return "MZ";
    case "LOCAL_Y": return "GY"; // STAAD standard member load typically Y 
    case "LOCAL_Z": return "GZ";
    default: return null;
  }
}
