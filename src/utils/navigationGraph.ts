import { VenueNode, VenueEdge, RouteResult, NavigationStep } from '../types';

/**
 * Calculates shortest walkable route using Dijkstra's algorithm.
 * Accounts for accessibility restrictions, closed edges, and congestion weights.
 */
export function calculateDijkstraRoute(
  startNodeId: string,
  targetNodeId: string,
  nodes: VenueNode[],
  edges: VenueEdge[],
  accessibleOnly: boolean = false
): RouteResult | null {
  if (startNodeId === targetNodeId) {
    const node = nodes.find((n) => n.id === startNodeId);
    return {
      nodePath: [startNodeId],
      totalDistance: 0,
      estimatedTimeSeconds: 0,
      steps: [
        {
          instruction: `You are already at ${node?.name || 'your destination'}.`,
          distance: 0,
          fromNode: startNodeId,
          toNode: startNodeId,
          action: 'arrive',
        },
      ],
      isAlternativeRoute: false,
      containsCongestedAreas: false,
    };
  }

  const nodeMap = new Map<string, VenueNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  if (!nodeMap.has(startNodeId) || !nodeMap.has(targetNodeId)) {
    return null;
  }

  // Build adjacency list (bi-directional for walkable corridors unless specified)
  const adj = new Map<string, Array<{ to: string; weight: number; edge: VenueEdge }>>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((edge) => {
    if (edge.isClosed) return; // skip closed edges
    if (accessibleOnly && !edge.accessible) return; // skip non-accessible edges

    const weight = edge.distanceMeters * (edge.congestionWeight || 1.0);
    adj.get(edge.fromNodeId)?.push({ to: edge.toNodeId, weight, edge });
    adj.get(edge.toNodeId)?.push({ to: edge.fromNodeId, weight, edge });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, { prevNode: string; edge: VenueEdge }>();
  const unvisited = new Set<string>();

  nodes.forEach((n) => {
    distances.set(n.id, Infinity);
    unvisited.add(n.id);
  });
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      const d = distances.get(nodeId)!;
      if (d < minDistance) {
        minDistance = d;
        current = nodeId;
      }
    });

    if (!current || minDistance === Infinity) break;
    if (current === targetNodeId) break;

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const alt = distances.get(current)! + neighbor.weight;
      if (alt < distances.get(neighbor.to)!) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, { prevNode: current, edge: neighbor.edge });
      }
    }
  }

  if (distances.get(targetNodeId) === Infinity) {
    return null; // No valid route found (e.g. partition or corridor closure)
  }

  // Reconstruct path
  const path: string[] = [];
  let curr = targetNodeId;
  const pathEdges: VenueEdge[] = [];

  while (curr !== startNodeId) {
    path.unshift(curr);
    const prevInfo = previous.get(curr);
    if (!prevInfo) break;
    pathEdges.unshift(prevInfo.edge);
    curr = prevInfo.prevNode;
  }
  path.unshift(startNodeId);

  // Compute total geometric distance
  let totalDistance = 0;
  let containsCongestion = false;
  pathEdges.forEach((e) => {
    totalDistance += e.distanceMeters;
    if (e.congestionWeight > 1.2) {
      containsCongestion = true;
    }
  });

  const walkingSpeedMetersPerSec = 1.2;
  const estimatedTimeSeconds = Math.round(totalDistance / walkingSpeedMetersPerSec);

  // Generate turn-by-turn navigation instructions
  const steps: NavigationStep[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = nodeMap.get(path[i])!;
    const to = nodeMap.get(path[i + 1])!;
    const edge = pathEdges[i];

    let action: NavigationStep['action'] = 'straight';
    let text = `Walk ${Math.round(edge.distanceMeters)}m towards ${to.name}`;

    if (edge.floorTransition) {
      action = 'take_stairs';
      text = `Take stairs / elevator to Level ${to.floor} towards ${to.name}`;
    } else if (i > 0) {
      // Calculate relative turn angle between vectors (prev -> from) and (from -> to)
      const prev = nodeMap.get(path[i - 1])!;
      const v1x = from.x - prev.x;
      const v1z = from.z - prev.z;
      const v2x = to.x - from.x;
      const v2z = to.z - from.z;

      // 2D cross product to determine turn direction (in 3D, z is depth)
      const cross = v1x * v2z - v1z * v2x;
      const dot = v1x * v2x + v1z * v2z;
      const angle = Math.atan2(cross, dot); // in radians

      if (angle > 0.4) {
        action = 'turn_right';
        text = `Turn right into ${to.name} (${Math.round(edge.distanceMeters)}m)`;
      } else if (angle < -0.4) {
        action = 'turn_left';
        text = `Turn left into ${to.name} (${Math.round(edge.distanceMeters)}m)`;
      } else {
        action = 'straight';
        text = `Continue straight along ${to.name} (${Math.round(edge.distanceMeters)}m)`;
      }
    } else {
      text = `Head towards ${to.name} (${Math.round(edge.distanceMeters)}m)`;
    }

    steps.push({
      instruction: text,
      distance: edge.distanceMeters,
      fromNode: from.id,
      toNode: to.id,
      action,
    });
  }

  const destinationNode = nodeMap.get(targetNodeId);
  steps.push({
    instruction: `You have arrived at ${destinationNode?.name || 'your destination'}.`,
    distance: 0,
    fromNode: targetNodeId,
    toNode: targetNodeId,
    action: 'arrive',
  });

  return {
    nodePath: path,
    totalDistance: Math.round(totalDistance),
    estimatedTimeSeconds,
    steps,
    isAlternativeRoute: containsCongestion,
    containsCongestedAreas: containsCongestion,
  };
}

/**
 * Validates if an existing path is still walkable when venue edges update.
 */
export function isRouteStillValid(nodePath: string[], edges: VenueEdge[]): boolean {
  for (let i = 0; i < nodePath.length - 1; i++) {
    const fromId = nodePath[i];
    const toId = nodePath[i + 1];
    const edge = edges.find(
      (e) =>
        (e.fromNodeId === fromId && e.toNodeId === toId) ||
        (e.fromNodeId === toId && e.toNodeId === fromId)
    );
    if (!edge || edge.isClosed) {
      return false;
    }
  }
  return true;
}
