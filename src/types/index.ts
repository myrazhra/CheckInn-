export type UserRole = 'visitor' | 'organizer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ticketId?: string;
  organization?: string;
  avatar?: string;
}

export interface Ticket {
  id: string; // e.g. "TCK-88219"
  qrPayload: string; // "CHECKIN:TCK-88219:SEC-492"
  attendeeName: string;
  attendeeEmail: string;
  ticketTier: 'VIP All-Access' | 'General Admission' | 'Speaker / Press' | 'Exhibitor Pass';
  eventName: string;
  eventId: string;
  status: 'valid' | 'checked_in' | 'expired' | 'revoked';
  firstCheckedInAt?: string;
  checkedInBy?: string;
  seatZone: string;
  badgeAssignedId?: string;
}

export interface CheckInRecord {
  id: string;
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketTier: string;
  timestamp: string;
  method: 'camera_qr' | 'manual_code' | 'kiosk_scan';
  scannerOperator: string;
  status: 'success' | 'duplicate_blocked' | 'invalid_rejected';
  rejectionReason?: string;
}

export interface VenueZone {
  id: string;
  name: string;
  floor: 1 | 2;
  category: 'exhibition' | 'conference' | 'registration' | 'food' | 'lounge' | 'restroom' | 'entrance';
  capacity: number;
  currentSimulatedCount: number;
  currentCameraCount: number;
  useCameraSource: boolean; // toggle between camera detection and demo simulation
  cameraDeviceName?: string;
  cameraLastUpdated?: string;
  description: string;
  isClosed: boolean;
  closureReason?: string;
  position: { x: number; y: number; z: number }; // 3D coordinates in meters
  dimensions: { width: number; depth: number; height: number };
  color: string;
}

export interface VenueNode {
  id: string;
  name: string;
  floor: 1 | 2;
  x: number;
  z: number;
  type: 'room' | 'corridor' | 'entrance' | 'stairs' | 'elevator' | 'booth';
  zoneId?: string;
  isAccessible: boolean;
}

export interface VenueEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  isClosed: boolean;
  congestionWeight: number; // 1.0 = normal, 2.0 = congested, 999 = closed
  accessible: boolean;
  floorTransition?: boolean;
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  fromNode: string;
  toNode: string;
  action: 'straight' | 'turn_left' | 'turn_right' | 'take_stairs' | 'arrive';
}

export interface RouteResult {
  nodePath: string[];
  totalDistance: number;
  estimatedTimeSeconds: number;
  steps: NavigationStep[];
  isAlternativeRoute?: boolean;
  containsCongestedAreas?: boolean;
}

export interface AnimatedPerson {
  id: string;
  currentX: number;
  currentZ: number;
  targetNodeId: string;
  currentEdgeIndex: number;
  pathNodes: string[];
  floor: 1 | 2;
  speed: number;
  color: string;
  targetZoneId: string;
  waitTimeSeconds: number;
  status: 'walking' | 'queuing' | 'lingering';
  heading: number; // angle in radians
}

export type CrowdScenario =
  | 'normal'
  | 'registration_queue'
  | 'crowded_exhibition'
  | 'busy_food_court'
  | 'blocked_entrance'
  | 'crowd_dispersal';

export interface OperationalAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: 'info' | 'warning' | 'critical';
  occupancyPercent: number;
  message: string;
  recommendedAction: string;
  timestamp: string;
  isSourceCamera: boolean;
  isResolved: boolean;
}

export interface SmartBadge {
  id: string;
  attendeeId: string;
  attendeeName: string;
  ticketTier: string;
  batteryLevel: number;
  lastHapticCue?: string;
  lastHapticTimestamp?: string;
  currentAssignedRoom: string;
  firmwareVersion: string;
  status: 'active' | 'syncing' | 'offline';
}

export interface EventNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  audience: 'all' | 'visitors' | 'organizers';
  category: 'announcement' | 'congestion_alert' | 'session_start' | 'emergency';
  readByVisitor: boolean;
}

export interface EventFeedback {
  id: string;
  visitorName: string;
  rating: number; // 1-5
  category: 'general' | 'navigation' | 'checkin' | 'sessions' | 'facilities';
  comment: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}
