import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Ticket,
  CheckInRecord,
  VenueZone,
  VenueNode,
  VenueEdge,
  SmartBadge,
  EventNotification,
  EventFeedback,
  OperationalAlert,
  CrowdScenario,
} from '../types';
import {
  INITIAL_EVENT,
  INITIAL_TICKETS,
  INITIAL_CHECKINS,
  INITIAL_ZONES,
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_BADGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEEDBACK,
} from '../data/mockData';
import { validateTicketScan, ValidationOutcome } from '../utils/ticketValidation';
import { checkZoneAlert } from '../utils/crowdLogic';

interface AppContextType {
  // Auth & Roles
  currentUser: UserProfile | null;
  currentRole: UserRole | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loginAsVisitor: (email?: string, name?: string) => void;
  loginAsOrganizer: (email?: string, name?: string) => void;
  logout: () => void;

  // Event Data
  event: typeof INITIAL_EVENT;
  tickets: Ticket[];
  checkIns: CheckInRecord[];
  zones: VenueZone[];
  nodes: VenueNode[];
  edges: VenueEdge[];
  badges: SmartBadge[];
  notifications: EventNotification[];
  feedbacks: EventFeedback[];
  alerts: OperationalAlert[];

  // Crowd & Simulation
  activeScenario: CrowdScenario;
  crowdMultiplier: number;
  simulationSpeed: number;
  isSimulationPaused: boolean;
  showAnimatedPeople: boolean;
  showCrowdHeatmap: boolean;
  useCameraDataGlobal: boolean;

  // Actions
  recordCheckIn: (payload: string, method: 'camera_qr' | 'manual_code' | 'kiosk_scan') => ValidationOutcome;
  toggleEdgeClosure: (edgeId: string) => void;
  toggleZoneClosure: (zoneId: string, reason?: string) => void;
  setCrowdScenario: (scenario: CrowdScenario) => void;
  setCrowdMultiplier: (val: number | ((prev: number) => number)) => void;
  setSimulationSpeed: (speed: number) => void;
  setIsSimulationPaused: (paused: boolean | ((prev: boolean) => boolean)) => void;
  setShowAnimatedPeople: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowCrowdHeatmap: (show: boolean | ((prev: boolean) => boolean)) => void;
  setUseCameraDataGlobal: (use: boolean | ((prev: boolean) => boolean)) => void;
  addNotification: (
    title: string,
    body: string,
    category?: EventNotification['category'],
    audience?: EventNotification['audience']
  ) => void;
  submitFeedback: (
    rating: number,
    category: EventFeedback['category'],
    comment: string
  ) => void;
  sendBadgeHapticCue: (badgeId: string, cueMessage: string) => void;
  selectedStartNodeId: string;
  setSelectedStartNodeId: (id: string) => void;
  selectedTargetNodeId: string;
  setSelectedTargetNodeId: (id: string) => void;
  activeFloorView: 1 | 2;
  setActiveFloorView: (floor: 1 | 2) => void;
  updateZoneCounts: (zoneId: string, simDelta: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');

  const [event] = useState(INITIAL_EVENT);
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('checkin_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem('checkin_history');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [zones, setZones] = useState<VenueZone[]>(() => {
    const saved = localStorage.getItem('checkin_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [nodes] = useState<VenueNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<VenueEdge[]>(() => {
    const saved = localStorage.getItem('checkin_edges');
    return saved ? JSON.parse(saved) : INITIAL_EDGES;
  });

  const [badges, setBadges] = useState<SmartBadge[]>(INITIAL_BADGES);
  const [notifications, setNotifications] = useState<EventNotification[]>(() => {
    const saved = localStorage.getItem('checkin_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [feedbacks, setFeedbacks] = useState<EventFeedback[]>(() => {
    const saved = localStorage.getItem('checkin_feedbacks');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });

  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);

  // Simulation controls
  const [activeScenario, setActiveScenarioState] = useState<CrowdScenario>('normal');
  const [crowdMultiplier, setCrowdMultiplier] = useState<number>(1.0);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [showAnimatedPeople, setShowAnimatedPeople] = useState<boolean>(true);
  const [showCrowdHeatmap, setShowCrowdHeatmap] = useState<boolean>(true);
  const [useCameraDataGlobal, setUseCameraDataGlobal] = useState<boolean>(false);

  // Navigation selection
  const [selectedStartNodeId, setSelectedStartNodeId] = useState<string>('n-l1-ent');
  const [selectedTargetNodeId, setSelectedTargetNodeId] = useState<string>('n-l2-keynote');
  const [activeFloorView, setActiveFloorView] = useState<1 | 2>(1);

  // Sync state to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('checkin_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('checkin_history', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('checkin_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('checkin_edges', JSON.stringify(edges));
  }, [edges]);

  useEffect(() => {
    localStorage.setItem('checkin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('checkin_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Periodically audit zones for alerts
  useEffect(() => {
    const newAlerts: OperationalAlert[] = [];
    zones.forEach((z) => {
      const alert = checkZoneAlert(z);
      if (alert) newAlerts.push(alert);
    });
    setAlerts(newAlerts);
  }, [zones]);

  const loginAsVisitor = (email = 'sarah.jenkins@example.com', name = 'Sarah Jenkins') => {
    const user: UserProfile = {
      id: 'USR-VISITOR-01',
      name,
      email,
      role: 'visitor',
      ticketId: 'TCK-10042',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    };
    setCurrentUser(user);
    setCurrentRole('visitor');
    setActiveTab('home');
  };

  const loginAsOrganizer = (email = 'director@checkinplus.io', name = 'Event Director') => {
    const user: UserProfile = {
      id: 'USR-ORG-01',
      name,
      email,
      role: 'organizer',
      organization: 'Global Operations Centre',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setCurrentUser(user);
    setCurrentRole('organizer');
    setActiveTab('command');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveTab('home');
  };

  const recordCheckIn = (
    payload: string,
    method: 'camera_qr' | 'manual_code' | 'kiosk_scan'
  ): ValidationOutcome => {
    const outcome = validateTicketScan(payload, tickets, event.id);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (outcome.status === 'success' && outcome.ticket) {
      // Atomic state update: mark ticket as checked in
      const updatedTicketId = outcome.ticket.id;
      setTickets((prev) =>
        prev.map((t) =>
          t.id === updatedTicketId
            ? { ...t, status: 'checked_in', firstCheckedInAt: nowStr, checkedInBy: `${currentUser?.name || 'Scanner'} (${method})` }
            : t
        )
      );

      const newRecord: CheckInRecord = {
        id: `CHK-${Date.now()}`,
        ticketId: outcome.ticket.id,
        attendeeName: outcome.ticket.attendeeName,
        attendeeEmail: outcome.ticket.attendeeEmail,
        ticketTier: outcome.ticket.ticketTier,
        timestamp: nowStr,
        method,
        scannerOperator: currentUser?.name || 'Gate Scanner',
        status: 'success',
      };
      setCheckIns((prev) => [newRecord, ...prev]);

      // Increment entrance zone simulated/camera count
      setZones((prev) =>
        prev.map((z) =>
          z.id === 'zone-l1-entrance'
            ? {
                ...z,
                currentSimulatedCount: z.currentSimulatedCount + 1,
                currentCameraCount: z.currentCameraCount + 1,
              }
            : z
        )
      );
    } else if (outcome.status === 'duplicate' && outcome.ticket) {
      const duplicateRecord: CheckInRecord = {
        id: `CHK-DUP-${Date.now()}`,
        ticketId: outcome.ticket.id,
        attendeeName: outcome.ticket.attendeeName,
        attendeeEmail: outcome.ticket.attendeeEmail,
        ticketTier: outcome.ticket.ticketTier,
        timestamp: nowStr,
        method,
        scannerOperator: currentUser?.name || 'Gate Scanner',
        status: 'duplicate_blocked',
        rejectionReason: 'Already checked in',
      };
      setCheckIns((prev) => [duplicateRecord, ...prev]);
    } else {
      const invalidRecord: CheckInRecord = {
        id: `CHK-INV-${Date.now()}`,
        ticketId: payload.slice(0, 24),
        attendeeName: 'Unknown Attendee',
        attendeeEmail: 'N/A',
        ticketTier: 'N/A',
        timestamp: nowStr,
        method,
        scannerOperator: currentUser?.name || 'Gate Scanner',
        status: 'invalid_rejected',
        rejectionReason: outcome.rejectionReason || 'Invalid QR code',
      };
      setCheckIns((prev) => [invalidRecord, ...prev]);
    }

    return outcome;
  };

  const toggleEdgeClosure = (edgeId: string) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, isClosed: !e.isClosed } : e))
    );
  };

  const toggleZoneClosure = (zoneId: string, reason?: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              isClosed: !z.isClosed,
              closureReason: !z.isClosed ? reason || 'Temporarily closed by operations' : undefined,
            }
          : z
      )
    );
  };

  const setCrowdScenario = (scenario: CrowdScenario) => {
    setActiveScenarioState(scenario);

    // Update zone distributions to reflect the scenario
    setZones((prev) =>
      prev.map((z) => {
        let newSim = z.currentSimulatedCount;
        if (scenario === 'registration_queue') {
          if (z.id === 'zone-l1-reg') newSim = 165; // ~92% capacity
          if (z.id === 'zone-l1-entrance') newSim = 135;
        } else if (scenario === 'crowded_exhibition') {
          if (z.id === 'zone-l1-exhibit') newSim = 480; // 96% capacity
        } else if (scenario === 'busy_food_court') {
          if (z.id === 'zone-l1-food') newSim = 238; // 95% capacity
        } else if (scenario === 'blocked_entrance') {
          if (z.id === 'zone-l1-entrance') newSim = 40;
        } else if (scenario === 'crowd_dispersal') {
          newSim = Math.max(20, Math.floor(z.capacity * 0.35));
        } else {
          // Normal
          if (z.id === 'zone-l1-entrance') newSim = 65;
          if (z.id === 'zone-l1-reg') newSim = 82;
          if (z.id === 'zone-l1-exhibit') newSim = 310;
          if (z.id === 'zone-l1-food') newSim = 165;
          if (z.id === 'zone-l2-keynote') newSim = 340;
          if (z.id === 'zone-l2-workshop') newSim = 75;
          if (z.id === 'zone-l2-lounge') newSim = 38;
        }
        return {
          ...z,
          currentSimulatedCount: newSim,
        };
      })
    );

    // If blocked entrance scenario, close the entrance edge
    if (scenario === 'blocked_entrance') {
      setEdges((prev) =>
        prev.map((e) => (e.id === 'e-ent-sec' ? { ...e, isClosed: true } : e))
      );
    } else {
      setEdges((prev) =>
        prev.map((e) => (e.id === 'e-ent-sec' ? { ...e, isClosed: false } : e))
      );
    }
  };

  const updateZoneCounts = (zoneId: string, simDelta: number) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              currentSimulatedCount: Math.max(0, Math.min(z.capacity, z.currentSimulatedCount + simDelta)),
            }
          : z
      )
    );
  };

  const addNotification = (
    title: string,
    body: string,
    category: EventNotification['category'] = 'announcement',
    audience: EventNotification['audience'] = 'all'
  ) => {
    const newNotif: EventNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audience,
      category,
      readByVisitor: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const submitFeedback = (
    rating: number,
    category: EventFeedback['category'],
    comment: string
  ) => {
    const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
    const newFb: EventFeedback = {
      id: `fb-${Date.now()}`,
      visitorName: currentUser?.name || 'Anonymous Visitor',
      rating,
      category,
      comment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentiment,
    };
    setFeedbacks((prev) => [newFb, ...prev]);
  };

  const sendBadgeHapticCue = (badgeId: string, cueMessage: string) => {
    setBadges((prev) =>
      prev.map((b) =>
        b.id === badgeId
          ? {
              ...b,
              lastHapticCue: cueMessage,
              lastHapticTimestamp: 'Just now',
            }
          : b
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        activeTab,
        setActiveTab,
        loginAsVisitor,
        loginAsOrganizer,
        logout,
        event,
        tickets,
        checkIns,
        zones,
        nodes,
        edges,
        badges,
        notifications,
        feedbacks,
        alerts,
        activeScenario,
        crowdMultiplier,
        simulationSpeed,
        isSimulationPaused,
        showAnimatedPeople,
        showCrowdHeatmap,
        useCameraDataGlobal,
        recordCheckIn,
        toggleEdgeClosure,
        toggleZoneClosure,
        setCrowdScenario,
        setCrowdMultiplier,
        setSimulationSpeed,
        setIsSimulationPaused,
        setShowAnimatedPeople,
        setShowCrowdHeatmap,
        setUseCameraDataGlobal,
        addNotification,
        submitFeedback,
        sendBadgeHapticCue,
        selectedStartNodeId,
        setSelectedStartNodeId,
        selectedTargetNodeId,
        setSelectedTargetNodeId,
        activeFloorView,
        setActiveFloorView,
        updateZoneCounts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
