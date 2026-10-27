import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDijkstraRoute, isRouteStillValid } from './navigationGraph';
import { validateTicketScan, parseQRPayload } from './ticketValidation';
import { calculateOccupancyPercent, getOccupancyStatus } from './crowdLogic';
import { VenueNode, VenueEdge, Ticket, VenueZone } from '../types';

test('calculateDijkstraRoute finds shortest path on connected graph', () => {
  const nodes: VenueNode[] = [
    { id: 'A', name: 'Entrance', floor: 1, x: 0, z: 0, type: 'entrance', isAccessible: true },
    { id: 'B', name: 'Lobby Corridor', floor: 1, x: 10, z: 0, type: 'corridor', isAccessible: true },
    { id: 'C', name: 'Exhibition Hall', floor: 1, x: 20, z: 0, type: 'room', isAccessible: true },
    { id: 'D', name: 'Side Corridor', floor: 1, x: 10, z: 10, type: 'corridor', isAccessible: true },
  ];

  const edges: VenueEdge[] = [
    { id: 'e1', fromNodeId: 'A', toNodeId: 'B', distanceMeters: 10, isClosed: false, congestionWeight: 1, accessible: true },
    { id: 'e2', fromNodeId: 'B', toNodeId: 'C', distanceMeters: 10, isClosed: false, congestionWeight: 1, accessible: true },
    { id: 'e3', fromNodeId: 'A', toNodeId: 'D', distanceMeters: 15, isClosed: false, congestionWeight: 1, accessible: true },
    { id: 'e4', fromNodeId: 'D', toNodeId: 'C', distanceMeters: 15, isClosed: false, congestionWeight: 1, accessible: true },
  ];

  const route = calculateDijkstraRoute('A', 'C', nodes, edges);
  assert.ok(route, 'Route should exist');
  assert.deepEqual(route.nodePath, ['A', 'B', 'C'], 'Direct path via B is shorter than D');
  assert.equal(route.totalDistance, 20);
});

test('calculateDijkstraRoute takes detour when primary corridor is closed', () => {
  const nodes: VenueNode[] = [
    { id: 'A', name: 'Entrance', floor: 1, x: 0, z: 0, type: 'entrance', isAccessible: true },
    { id: 'B', name: 'Main Hallway', floor: 1, x: 10, z: 0, type: 'corridor', isAccessible: true },
    { id: 'C', name: 'Auditorium', floor: 1, x: 20, z: 0, type: 'room', isAccessible: true },
    { id: 'D', name: 'Detour Passage', floor: 1, x: 10, z: 10, type: 'corridor', isAccessible: true },
  ];

  // Close the main hallway edge B->C
  const edges: VenueEdge[] = [
    { id: 'e1', fromNodeId: 'A', toNodeId: 'B', distanceMeters: 10, isClosed: false, congestionWeight: 1, accessible: true },
    { id: 'e2', fromNodeId: 'B', toNodeId: 'C', distanceMeters: 10, isClosed: true, congestionWeight: 1, accessible: true }, // CLOSED
    { id: 'e3', fromNodeId: 'A', toNodeId: 'D', distanceMeters: 15, isClosed: false, congestionWeight: 1, accessible: true },
    { id: 'e4', fromNodeId: 'D', toNodeId: 'C', distanceMeters: 15, isClosed: false, congestionWeight: 1, accessible: true },
  ];

  const route = calculateDijkstraRoute('A', 'C', nodes, edges);
  assert.ok(route, 'Detour route should exist');
  assert.deepEqual(route.nodePath, ['A', 'D', 'C'], 'Should reroute via detour passage D');
  assert.equal(route.totalDistance, 30);
});

test('isRouteStillValid detects when an edge along path is closed', () => {
  const edges: VenueEdge[] = [
    { id: 'e1', fromNodeId: 'A', toNodeId: 'B', distanceMeters: 10, isClosed: false, congestionWeight: 1, accessible: true },
    { id: 'e2', fromNodeId: 'B', toNodeId: 'C', distanceMeters: 10, isClosed: false, congestionWeight: 1, accessible: true },
  ];
  assert.equal(isRouteStillValid(['A', 'B', 'C'], edges), true);

  edges[1].isClosed = true;
  assert.equal(isRouteStillValid(['A', 'B', 'C'], edges), false);
});

test('validateTicketScan properly handles new, duplicate, and invalid tickets', () => {
  const tickets: Ticket[] = [
    {
      id: 'TCK-001',
      qrPayload: 'CHECKIN:TCK-001:HASH1',
      attendeeName: 'Alex Mercer',
      attendeeEmail: 'alex@example.com',
      ticketTier: 'VIP All-Access',
      eventName: 'Tech Summit 2026',
      eventId: 'EVT-GLOBAL-2026',
      status: 'valid',
      seatZone: 'Zone VIP',
    },
    {
      id: 'TCK-002',
      qrPayload: 'CHECKIN:TCK-002:HASH2',
      attendeeName: 'Jordan Lee',
      attendeeEmail: 'jordan@example.com',
      ticketTier: 'General Admission',
      eventName: 'Tech Summit 2026',
      eventId: 'EVT-GLOBAL-2026',
      status: 'checked_in',
      firstCheckedInAt: '09:14 AM',
      seatZone: 'General Seating',
    },
  ];

  // Valid first check-in
  const resValid = validateTicketScan('CHECKIN:TCK-001:HASH1', tickets, 'EVT-GLOBAL-2026');
  assert.equal(resValid.status, 'success');
  assert.equal(resValid.ticket?.attendeeName, 'Alex Mercer');

  // Duplicate check-in
  const resDup = validateTicketScan('CHECKIN:TCK-002:HASH2', tickets, 'EVT-GLOBAL-2026');
  assert.equal(resDup.status, 'duplicate');
  assert.equal(resDup.ticket?.attendeeName, 'Jordan Lee');

  // Unrecognized QR
  const resUnknown = validateTicketScan('UNKNOWN_CODE_999', tickets, 'EVT-GLOBAL-2026');
  assert.equal(resUnknown.status, 'invalid');
});

test('crowdLogic computes percentages and status thresholds accurately', () => {
  assert.equal(calculateOccupancyPercent(50, 100), 50);
  assert.equal(calculateOccupancyPercent(95, 100), 95);

  const zone: VenueZone = {
    id: 'z1',
    name: 'Keynote Hall',
    floor: 1,
    category: 'conference',
    capacity: 200,
    currentSimulatedCount: 100,
    currentCameraCount: 100,
    useCameraSource: false,
    description: 'Main Hall',
    isClosed: false,
    position: { x: 0, y: 0, z: 0 },
    dimensions: { width: 10, depth: 10, height: 4 },
    color: '#10B981',
  };

  assert.equal(getOccupancyStatus(zone), 'normal');

  zone.currentSimulatedCount = 170; // 85% -> busy
  assert.equal(getOccupancyStatus(zone), 'busy');

  zone.currentSimulatedCount = 195; // 97.5% -> critical
  assert.equal(getOccupancyStatus(zone), 'critical');

  zone.isClosed = true;
  assert.equal(getOccupancyStatus(zone), 'closed');
});
