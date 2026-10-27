import { VenueZone, OperationalAlert } from '../types';

export type OccupancyStatus = 'normal' | 'busy' | 'critical' | 'closed';

export function calculateOccupancyPercent(count: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((count / capacity) * 100));
}

export function getOccupancyStatus(zone: VenueZone): OccupancyStatus {
  if (zone.isClosed) return 'closed';
  const count = zone.useCameraSource ? zone.currentCameraCount : zone.currentSimulatedCount;
  const percent = calculateOccupancyPercent(count, zone.capacity);

  if (percent >= 95) return 'critical';
  if (percent >= 80) return 'busy';
  return 'normal';
}

export function getStatusColor(status: OccupancyStatus): string {
  switch (status) {
    case 'normal':
      return '#10B981'; // Green
    case 'busy':
      return '#F59E0B'; // Amber
    case 'critical':
      return '#EF4444'; // Red
    case 'closed':
      return '#64748B'; // Slate Grey
  }
}

export function getStatusLabel(status: OccupancyStatus): string {
  switch (status) {
    case 'normal':
      return 'Normal Flow';
    case 'busy':
      return 'High Traffic';
    case 'critical':
      return 'Near / At Capacity';
    case 'closed':
      return 'Zone Closed';
  }
}

export function checkZoneAlert(zone: VenueZone): OperationalAlert | null {
  if (zone.isClosed) {
    return {
      id: `alert-${zone.id}-${Date.now()}`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: 'warning',
      occupancyPercent: 0,
      message: `${zone.name} is currently CLOSED (${zone.closureReason || 'Maintenance'}).`,
      recommendedAction: 'Direct attendees towards designated detour corridors.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSourceCamera: zone.useCameraSource,
      isResolved: false,
    };
  }

  const count = zone.useCameraSource ? zone.currentCameraCount : zone.currentSimulatedCount;
  const percent = calculateOccupancyPercent(count, zone.capacity);

  if (percent >= 95) {
    return {
      id: `alert-${zone.id}-${Date.now()}`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: 'critical',
      occupancyPercent: percent,
      message: `${zone.name} is at ${percent}% capacity (${count}/${zone.capacity} visitors).`,
      recommendedAction: 'Halt entry queue, activate auxiliary hall, broadcast congestion notification.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSourceCamera: zone.useCameraSource,
      isResolved: false,
    };
  }

  if (percent >= 80) {
    return {
      id: `alert-${zone.id}-${Date.now()}`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: 'warning',
      occupancyPercent: percent,
      message: `${zone.name} is approaching capacity (${percent}% full).`,
      recommendedAction: 'Prepare staff for crowd flow redirection to adjacent zones.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSourceCamera: zone.useCameraSource,
      isResolved: false,
    };
  }

  return null;
}
