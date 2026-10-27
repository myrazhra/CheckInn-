/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Navbar } from './components/Navbar';

// Visitor Components
import { VisitorHome } from './components/visitor/VisitorHome';
import { MyTicket } from './components/visitor/MyTicket';
import { Venue3DMap } from './components/navigation/Venue3DMap';
import { FindRoomSchedule } from './components/visitor/FindRoomSchedule';
import { VisitorCrowdView } from './components/visitor/VisitorCrowdView';
import { VisitorSmartBadge } from './components/visitor/VisitorSmartBadge';
import { VisitorFeedback } from './components/visitor/VisitorFeedback';

// Organizer Components
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { AttendanceManager } from './components/organizer/AttendanceManager';
import { QRScannerView } from './components/organizer/QRScannerView';
import { DigitalTwinView } from './components/organizer/DigitalTwinView';
import { NavigationOps } from './components/organizer/NavigationOps';
import { BadgeManagement } from './components/organizer/BadgeManagement';
import { NotificationBroadcast } from './components/organizer/NotificationBroadcast';
import { FeedbackAnalytics } from './components/organizer/FeedbackAnalytics';
import { VenueSettings } from './components/organizer/VenueSettings';

const MainAppContent: React.FC = () => {
  const { currentRole, activeTab, loginAsVisitor, loginAsOrganizer } = useApp();

  // Handle URL query parameters for fast autostart / direct navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const autostart = params.get('autostart');
      const roleParam = params.get('role');

      if (!currentRole) {
        if (roleParam === 'organizer' || autostart === 'organizer') {
          loginAsOrganizer('director@checkinplus.io', 'Director Vance');
        } else if (roleParam === 'visitor' || autostart === '1' || autostart === 'visitor') {
          loginAsVisitor('sarah.jenkins@example.com', 'Sarah Jenkins (VIP)');
        }
      }
    }
  }, [currentRole, loginAsVisitor, loginAsOrganizer]);

  if (!currentRole) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#172437] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {/* Visitor Views */}
        {currentRole === 'visitor' && (
          <>
            {activeTab === 'home' && <VisitorHome />}
            {activeTab === 'ticket' && <MyTicket />}
            {activeTab === 'venue3d' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
                  <h1 className="text-2xl font-bold text-[#0B1F36] mb-1">
                    Interactive 3D Indoor Venue Navigation
                  </h1>
                  <p className="text-sm text-[#64748B]">
                    Select any destination room, calculate the shortest accessible route, and watch the moving marker simulation guide you with turn-by-turn instructions.
                  </p>
                </div>
                <Venue3DMap isOrganizerView={false} />
              </div>
            )}
            {activeTab === 'schedule' && <FindRoomSchedule />}
            {activeTab === 'crowd' && <VisitorCrowdView />}
            {activeTab === 'badge' && <VisitorSmartBadge />}
            {activeTab === 'feedback' && <VisitorFeedback />}
          </>
        )}

        {/* Organizer Views */}
        {currentRole === 'organizer' && (
          <>
            {activeTab === 'command' && <OrganizerDashboard />}
            {activeTab === 'attendance' && <AttendanceManager />}
            {activeTab === 'scanner' && <QRScannerView />}
            {activeTab === 'digitaltwin' && <DigitalTwinView initialSubTab="map" />}
            {activeTab === 'scenarios' && <DigitalTwinView initialSubTab="scenarios" />}
            {activeTab === 'navigation_ops' && <NavigationOps />}
            {activeTab === 'badge_ops' && <BadgeManagement />}
            {activeTab === 'notifications' && <NotificationBroadcast />}
            {activeTab === 'feedback_analytics' && <FeedbackAnalytics />}
            {activeTab === 'venue_settings' && <VenueSettings />}
          </>
        )}
      </main>

      <footer className="border-t border-[#E8DDC8] bg-white py-3 px-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CheckIn+ Platform &bull; Navy Blue &amp; Beige Theme</span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#142B4A]">Role: {currentRole.toUpperCase()}</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">Web Audio &amp; Camera Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
