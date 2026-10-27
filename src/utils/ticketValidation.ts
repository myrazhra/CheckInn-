import { Ticket, CheckInRecord } from '../types';

export interface ValidationOutcome {
  status: 'success' | 'duplicate' | 'invalid';
  message: string;
  ticket?: Ticket;
  previousCheckIn?: string;
  rejectionReason?: string;
}

/**
 * Extracts ticket ID from various QR code payload formats.
 * Accepts "CHECKIN:TCK-88219:SEC-492", JSON { ticketId: "TCK-88219" }, or bare "TCK-88219"
 */
export function parseQRPayload(rawText: string): string | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();

  // Format: CHECKIN:TCK-xxxxx:hash
  if (trimmed.startsWith('CHECKIN:')) {
    const parts = trimmed.split(':');
    if (parts.length >= 2 && parts[1]) {
      return parts[1];
    }
  }

  // Format: JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.ticketId) return String(parsed.ticketId);
      if (parsed.id) return String(parsed.id);
    } catch {
      // not JSON
    }
  }

  // Format: Direct ticket ID like "TCK-10001"
  if (/^TCK-[A-Za-z0-9-]+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Fallback: Return raw string if non-empty
  return trimmed;
}

/**
 * Atomic validation function checking ticket validity, duplicate state, and expiration.
 */
export function validateTicketScan(
  scannedPayload: string,
  tickets: Ticket[],
  currentEventId: string = 'EVT-GLOBAL-2026'
): ValidationOutcome {
  const ticketId = parseQRPayload(scannedPayload);

  if (!ticketId) {
    return {
      status: 'invalid',
      message: 'Unrecognized QR code format. Please present an authorized CheckIn+ ticket.',
      rejectionReason: 'Invalid payload structure',
    };
  }

  const ticket = tickets.find(
    (t) => t.id.toLowerCase() === ticketId.toLowerCase() || t.qrPayload === scannedPayload
  );

  if (!ticket) {
    return {
      status: 'invalid',
      message: `Ticket "${ticketId}" was not found in the authorized attendee registry.`,
      rejectionReason: 'Ticket ID not in database',
    };
  }

  if (ticket.eventId !== currentEventId) {
    return {
      status: 'invalid',
      message: `Ticket belongs to a different event (${ticket.eventName}). Not valid for this session.`,
      rejectionReason: 'Event ID mismatch',
    };
  }

  if (ticket.status === 'revoked') {
    return {
      status: 'invalid',
      message: `Ticket ${ticket.id} has been revoked by event security.`,
      ticket,
      rejectionReason: 'Ticket revoked',
    };
  }

  if (ticket.status === 'expired') {
    return {
      status: 'invalid',
      message: `Ticket ${ticket.id} expired. Please visit the help desk.`,
      ticket,
      rejectionReason: 'Ticket expired',
    };
  }

  if (ticket.status === 'checked_in') {
    return {
      status: 'duplicate',
      message: `Ticket Already Checked In for ${ticket.attendeeName}.`,
      ticket,
      previousCheckIn: ticket.firstCheckedInAt || 'Earlier today',
      rejectionReason: 'Duplicate check-in detected',
    };
  }

  // First-time valid check-in
  return {
    status: 'success',
    message: `Verified! Welcome, ${ticket.attendeeName} (${ticket.ticketTier}).`,
    ticket,
  };
}
