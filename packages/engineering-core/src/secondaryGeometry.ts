import { createId } from "./ids.js";
import type { Geometry, Node, Member } from "./types.js";
import type { GeometryResult } from "./geometry.js";

export function generateSecondarySteel(config: Geometry, primaryGeometry: GeometryResult): GeometryResult {
  const nodes = [...primaryGeometry.nodes];
  const members = [...primaryGeometry.members];

  // Eave Struts
  if (config.eaveStrutConfig?.enabled) {
    generateEaveStruts(config, primaryGeometry, nodes, members);
  }

  // Purlins
  if (config.purlinConfig?.enabled) {
    generatePurlins(config, primaryGeometry, nodes, members);
  }

  // Girts
  if (config.girtConfig?.enabled) {
    generateGirts(config, primaryGeometry, nodes, members);
  }
  
  // End Wall
  if (config.endWallConfig?.enabled) {
    generateEndWallSecondary(config, primaryGeometry, nodes, members);
  }

  // Sag Rods
  if (config.sagRodConfig?.enabled) {
    generateSagRods(config, primaryGeometry, nodes, members);
  }

  return {
    ...primaryGeometry,
    nodes,
    members
  };
}

function generateEaveStruts(config: Geometry, primaryGeometry: GeometryResult, nodes: Node[], members: Member[]) {
  const eaveNodes = primaryGeometry.nodes.filter(n => n.role === "EAVE");
  const zGroups = new Map<number, Node[]>();
  
  for (const node of eaveNodes) {
    if (!zGroups.has(node.z_m)) {
      zGroups.set(node.z_m, []);
    }
    zGroups.get(node.z_m)!.push(node);
  }

  for (const [z, groupNodes] of zGroups.entries()) {
    groupNodes.sort((a, b) => a.x_m - b.x_m);
    
    for (let i = 0; i < groupNodes.length - 1; i++) {
      const startNode = groupNodes[i];
      const endNode = groupNodes[i + 1];
      const length = endNode.x_m - startNode.x_m;
      
      members.push({
        id: createId(),
        projectId: config.projectId,
        label: `M-EAVESTRUT-Z${z.toFixed(2)}-X${startNode.x_m.toFixed(2)}`,
        type: "EAVE_STRUT",
        startNodeId: startNode.id,
        endNodeId: endNode.id,
        designGroup: "Eave Struts",
        length_m: length,
        quantity: 1,
        weightStatus: "NOT_IMPLEMENTED",
        metadata: {}
      });
    }
  }
}

function generatePurlins(config: Geometry, primaryGeometry: GeometryResult, nodes: Node[], members: Member[]) {
  const spacing = config.purlinConfig?.spacing_m || 1.5;
  const rafters = primaryGeometry.members.filter(m => m.type === "RAFTER");
  
  const raftersByFrame = new Map<number, Member[]>();
  for (const rafter of rafters) {
    const startNode = primaryGeometry.nodes.find(n => n.id === rafter.startNodeId)!;
    if (!raftersByFrame.has(startNode.x_m)) {
      raftersByFrame.set(startNode.x_m, []);
    }
    raftersByFrame.get(startNode.x_m)!.push(rafter);
  }

  const frameXCoords = Array.from(raftersByFrame.keys()).sort((a, b) => a - b);
  
  for (let i = 0; i < frameXCoords.length - 1; i++) {
    const frame1X = frameXCoords[i];
    const frame2X = frameXCoords[i + 1];
    
    const frame1Rafters = raftersByFrame.get(frame1X)!;
    const frame2Rafters = raftersByFrame.get(frame2X)!;
    
    for (const rafter1 of frame1Rafters) {
      const start1 = primaryGeometry.nodes.find(n => n.id === rafter1.startNodeId)!;
      const end1 = primaryGeometry.nodes.find(n => n.id === rafter1.endNodeId)!;
      
      const rafter2 = frame2Rafters.find(r => {
        const start2 = primaryGeometry.nodes.find(n => n.id === r.startNodeId)!;
        const end2 = primaryGeometry.nodes.find(n => n.id === r.endNodeId)!;
        return Math.abs(start1.z_m - start2.z_m) < 0.01 && Math.abs(end1.z_m - end2.z_m) < 0.01;
      });
      
      if (!rafter2) continue;
      
      const start2 = primaryGeometry.nodes.find(n => n.id === rafter2.startNodeId)!;
      const end2 = primaryGeometry.nodes.find(n => n.id === rafter2.endNodeId)!;
      
      const rafterLength = rafter1.length_m;
      const numPurlins = Math.floor(rafterLength / spacing);
      
      for (let p = 1; p <= numPurlins; p++) {
        const currentLength = p * spacing;
        const ratio = currentLength / rafterLength;
        
        const px1 = frame1X;
        const pz1 = start1.z_m + ratio * (end1.z_m - start1.z_m);
        const py1 = start1.y_m + ratio * (end1.y_m - start1.y_m);
        
        const px2 = frame2X;
        const pz2 = start2.z_m + ratio * (end2.z_m - start2.z_m);
        const py2 = start2.y_m + ratio * (end2.y_m - start2.y_m);
        
        const pNode1: Node = {
          id: createId(),
          projectId: config.projectId,
          label: `N-PURLIN-X${px1.toFixed(2)}-Z${pz1.toFixed(2)}`,
          x_m: px1,
          y_m: py1,
          z_m: pz1,
          role: "PURLIN",
          metadata: {}
        };
        
        const pNode2: Node = {
          id: createId(),
          projectId: config.projectId,
          label: `N-PURLIN-X${px2.toFixed(2)}-Z${pz2.toFixed(2)}`,
          x_m: px2,
          y_m: py2,
          z_m: pz2,
          role: "PURLIN",
          metadata: {}
        };
        
        let n1 = nodes.find(n => Math.abs(n.x_m - px1) < 0.01 && Math.abs(n.y_m - py1) < 0.01 && Math.abs(n.z_m - pz1) < 0.01);
        if (!n1) {
          n1 = pNode1;
          nodes.push(n1);
        }
        
        let n2 = nodes.find(n => Math.abs(n.x_m - px2) < 0.01 && Math.abs(n.y_m - py2) < 0.01 && Math.abs(n.z_m - pz2) < 0.01);
        if (!n2) {
          n2 = pNode2;
          nodes.push(n2);
        }
        
        members.push({
          id: createId(),
          projectId: config.projectId,
          label: `M-PURLIN-X${px1.toFixed(2)}-X${px2.toFixed(2)}-Z${pz1.toFixed(2)}`,
          type: "PURLIN",
          startNodeId: n1.id,
          endNodeId: n2.id,
          designGroup: "Purlins",
          length_m: px2 - px1,
          quantity: 1,
          weightStatus: "NOT_IMPLEMENTED",
          metadata: {}
        });
      }
    }
  }
}

function generateGirts(config: Geometry, primaryGeometry: GeometryResult, nodes: Node[], members: Member[]) {
  const spacing = config.girtConfig?.spacing_m || 2.0;
  const columns = primaryGeometry.members.filter(m => m.type === "COLUMN" || m.type === "END_WALL_COLUMN");
  
  const colsByZ = new Map<number, Member[]>();
  for (const col of columns) {
    const startNode = primaryGeometry.nodes.find(n => n.id === col.startNodeId)!;
    if (!colsByZ.has(startNode.z_m)) {
      colsByZ.set(startNode.z_m, []);
    }
    colsByZ.get(startNode.z_m)!.push(col);
  }
  
  const zCoords = Array.from(colsByZ.keys()).sort((a, b) => a - b);
  if (zCoords.length === 0) return;
  
  for (const z of [zCoords[0], zCoords[zCoords.length - 1]]) {
    const sideCols = colsByZ.get(z)!;
    sideCols.sort((a, b) => {
      const na = primaryGeometry.nodes.find(n => n.id === a.startNodeId)!;
      const nb = primaryGeometry.nodes.find(n => n.id === b.startNodeId)!;
      return na.x_m - nb.x_m;
    });
    
    for (let i = 0; i < sideCols.length - 1; i++) {
      const col1 = sideCols[i];
      const col2 = sideCols[i + 1];
      
      const start1 = primaryGeometry.nodes.find(n => n.id === col1.startNodeId)!;
      const start2 = primaryGeometry.nodes.find(n => n.id === col2.startNodeId)!;
      
      const minHeight = Math.min(col1.length_m, col2.length_m);
      const numGirts = Math.floor(minHeight / spacing);
      
      for (let g = 1; g <= numGirts; g++) {
        const height = g * spacing;
        
        const px1 = start1.x_m;
        const py1 = start1.y_m + height;
        const pz1 = start1.z_m;
        
        const px2 = start2.x_m;
        const py2 = start2.y_m + height;
        const pz2 = start2.z_m;
        
        const gNode1: Node = {
          id: createId(),
          projectId: config.projectId,
          label: `N-GIRT-X${px1.toFixed(2)}-Y${py1.toFixed(2)}`,
          x_m: px1,
          y_m: py1,
          z_m: pz1,
          role: "GIRT",
          metadata: {}
        };
        
        const gNode2: Node = {
          id: createId(),
          projectId: config.projectId,
          label: `N-GIRT-X${px2.toFixed(2)}-Y${py2.toFixed(2)}`,
          x_m: px2,
          y_m: py2,
          z_m: pz2,
          role: "GIRT",
          metadata: {}
        };
        
        let n1 = nodes.find(n => Math.abs(n.x_m - px1) < 0.01 && Math.abs(n.y_m - py1) < 0.01 && Math.abs(n.z_m - pz1) < 0.01);
        if (!n1) {
          n1 = gNode1;
          nodes.push(n1);
        }
        
        let n2 = nodes.find(n => Math.abs(n.x_m - px2) < 0.01 && Math.abs(n.y_m - py2) < 0.01 && Math.abs(n.z_m - pz2) < 0.01);
        if (!n2) {
          n2 = gNode2;
          nodes.push(n2);
        }
        
        members.push({
          id: createId(),
          projectId: config.projectId,
          label: `M-GIRT-X${px1.toFixed(2)}-X${px2.toFixed(2)}-Y${py1.toFixed(2)}`,
          type: "GIRT",
          startNodeId: n1.id,
          endNodeId: n2.id,
          designGroup: "Side Wall Girts",
          length_m: px2 - px1,
          quantity: 1,
          weightStatus: "NOT_IMPLEMENTED",
          metadata: {}
        });
      }
    }
  }
}

function generateEndWallSecondary(config: Geometry, primaryGeometry: GeometryResult, nodes: Node[], members: Member[]) {
  const spacing = config.endWallConfig?.spacing_m || 2.0;
  
  // Find End Wall Columns
  const endWallCols = primaryGeometry.members.filter(m => m.type === "END_WALL_COLUMN" || m.type === "COLUMN");
  
  const colsByX = new Map<number, Member[]>();
  for (const col of endWallCols) {
    const startNode = primaryGeometry.nodes.find(n => n.id === col.startNodeId)!;
    if (!colsByX.has(startNode.x_m)) {
      colsByX.set(startNode.x_m, []);
    }
    colsByX.get(startNode.x_m)!.push(col);
  }
  
  const xCoords = Array.from(colsByX.keys()).sort((a, b) => a - b);
  if (xCoords.length < 2) return;
  
  // End walls are at min X and max X
  for (const x of [xCoords[0], xCoords[xCoords.length - 1]]) {
    const wallCols = colsByX.get(x)!;
    wallCols.sort((a, b) => {
      const na = primaryGeometry.nodes.find(n => n.id === a.startNodeId)!;
      const nb = primaryGeometry.nodes.find(n => n.id === b.startNodeId)!;
      return na.z_m - nb.z_m;
    });
    
    // Connect adjacent columns on the end wall with girts
    for (let i = 0; i < wallCols.length - 1; i++) {
      const col1 = wallCols[i];
      const col2 = wallCols[i + 1];
      
      const start1 = primaryGeometry.nodes.find(n => n.id === col1.startNodeId)!;
      const start2 = primaryGeometry.nodes.find(n => n.id === col2.startNodeId)!;
      
      const minHeight = Math.min(col1.length_m, col2.length_m);
      const numGirts = Math.floor(minHeight / spacing);
      
      for (let g = 1; g <= numGirts; g++) {
        const height = g * spacing;
        
        const px1 = start1.x_m;
        const py1 = start1.y_m + height;
        const pz1 = start1.z_m;
        
        const px2 = start2.x_m;
        const py2 = start2.y_m + height;
        const pz2 = start2.z_m;
        
        const gNode1: Node = {
          id: createId(),
          projectId: config.projectId,
          label: `N-EW-GIRT-Z${pz1.toFixed(2)}-Y${py1.toFixed(2)}`,
          x_m: px1,
          y_m: py1,
          z_m: pz1,
          role: "GIRT",
          metadata: {}
        };
        
        const gNode2: Node = {
          id: createId(),
          projectId: config.projectId,
          label: `N-EW-GIRT-Z${pz2.toFixed(2)}-Y${py2.toFixed(2)}`,
          x_m: px2,
          y_m: py2,
          z_m: pz2,
          role: "GIRT",
          metadata: {}
        };
        
        let n1 = nodes.find(n => Math.abs(n.x_m - px1) < 0.01 && Math.abs(n.y_m - py1) < 0.01 && Math.abs(n.z_m - pz1) < 0.01);
        if (!n1) {
          n1 = gNode1;
          nodes.push(n1);
        }
        
        let n2 = nodes.find(n => Math.abs(n.x_m - px2) < 0.01 && Math.abs(n.y_m - py2) < 0.01 && Math.abs(n.z_m - pz2) < 0.01);
        if (!n2) {
          n2 = gNode2;
          nodes.push(n2);
        }
        
        members.push({
          id: createId(),
          projectId: config.projectId,
          label: `M-EW-GIRT-Z${pz1.toFixed(2)}-Z${pz2.toFixed(2)}-Y${py1.toFixed(2)}`,
          type: "END_WALL_SECONDARY", // Distinguish from side-wall girts if needed
          startNodeId: n1.id,
          endNodeId: n2.id,
          designGroup: "End Wall Girts",
          length_m: pz2 - pz1,
          quantity: 1,
          weightStatus: "NOT_IMPLEMENTED",
          metadata: {}
        });
      }
    }
  }
}

function generateSagRods(config: Geometry, primaryGeometry: GeometryResult, nodes: Node[], members: Member[]) {
  // Config determines whether we need 1 sag rod at midspan, or 2 at third-points etc.
  const sagRodConfig = config.sagRodConfig?.spacingConfiguration || "MIDSPAN";
  
  // Find all purlins and girts to connect
  const secondaryMembers = members.filter(m => m.type === "PURLIN" || m.type === "GIRT" || m.type === "END_WALL_SECONDARY");
  
  for (const member of secondaryMembers) {
    if (member.length_m > 4.5 && sagRodConfig === "MIDSPAN") {
      // Connect adjacent purlins/girts? 
      // Strictly, Sag rods span perpendicular to purlins/girts (connecting them).
      // A more complex spatial search is needed to identify parallel adjacent purlins/girts and connect them.
      // For now, we will add a midspan node but we need adjacent members to connect to.
      // To keep it simple and correct, we will leave sag rod connection generation to a dedicated routine 
      // that searches for vertically adjacent secondary members.
    }
  }
}
