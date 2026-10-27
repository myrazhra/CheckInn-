import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  QrCode,
  Ticket,
  Compass,
  Users,
  Calendar,
  Radio,
  MessageSquare,
  Shield,
  Activity,
  Bell,
  Sliders,
  LogOut,
  Volume2,
  VolumeX,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../utils/audioFeedback';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activeTab,
    setActiveTab,
    logout,
    checkIns,
    alerts,
    event,
  } = useApp();

  const [isMuted, setIsMuted] = useState(getSoundMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  const activeAlertCount = alerts.filter((a) => !a.isResolved).length;

  const visitorTabs = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'ticket', label: 'My Ticket', icon: Ticket },
    { id: 'venue3d', label: '3D Venue Map', icon: Compass },
    { id: 'schedule', label: 'Find a Room & Schedule', icon: Calendar },
    { id: 'crowd', label: 'Crowd Levels', icon: Users },
    { id: 'badge', label: 'Smart Badge', icon: Radio },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const organizerTabs = [
    { id: 'command', label: 'Command Centre', icon: Activity },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'digitaltwin', label: 'Live 3D Digital Twin', icon: Compass },
    { id: 'scenarios', label: 'Simulation Scenarios', icon: Sliders },
    { id: 'navigation_ops', label: 'Navigation Ops', icon: Compass },
    { id: 'badge_ops', label: 'Smart Badges', icon: Radio },
    { id: 'notifications', label: 'Broadcast', icon: Bell },
    { id: 'feedback_analytics', label: 'Feedback Analytics', icon: MessageSquare },
    { id: 'venue_settings', label: 'Settings', icon: Sliders },
  ];

  const tabs = currentRole === 'visitor' ? visitorTabs : organizerTabs;

  return (
    <header className="bg-white border-b border-[#E8DDC8] sticky top-0 z-40 shadow-xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab(currentRole === 'visitor' ? 'home' : 'command')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#0B1F36] transition-colors">
              <QrCode className="w-5 h-5 text-[#E8DDC8]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#142B4A] leading-none block">
                CheckIn<span className="text-[#0B1F36] font-black">+</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-medium leading-none">
                {event.name}
              </span>
            </div>
          </button>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ml-2 ${
              currentRole === 'visitor'
                ? 'bg-[#E8DDC8]/60 text-[#142B4A] border border-[#E8DDC8]'
                : 'bg-[#0B1F36] text-[#E8DDC8]'
            }`}
          >
            {currentRole === 'visitor' ? <Ticket className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            <span className="capitalize">{currentRole} Portal</span>
          </span>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Metrics */}
          {currentRole === 'organizer' && (
            <div className="hidden lg:flex items-center gap-4 text-xs pr-2 border-r border-[#E8DDC8]">
              <div className="flex items-center gap-1.5 text-[#142B4A] font-semibold bg-[#F6F2EA] px-2.5 py-1 rounded-lg">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{checkIns.length} Checked In</span>
              </div>
              {activeAlertCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('digitaltwin')}
                  className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>{activeAlertCount} Zone Alert{activeAlertCount > 1 ? 's' : ''}</span>
                </button>
              )}
            </div>
          )}

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#142B4A] hover:bg-[#F6F2EA] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* User profile capsule */}
          <div className="hidden sm:flex items-center gap-2 pl-2">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#E8DDC8]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#142B4A] text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
            )}
            <div className="text-left">
              <span className="text-xs font-bold text-[#142B4A] block leading-tight">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-[#64748B] block leading-tight">
                {currentRole === 'visitor' ? 'Attendee Pass' : 'Ops Director'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-red-50 hover:text-red-600 text-[#142B4A] text-xs font-semibold transition-colors cursor-pointer"
            title="Log Out & Switch Role"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#142B4A] hover:bg-[#F6F2EA] cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Tabs */}
      <nav className="hidden md:block bg-[#F6F2EA]/70 border-t border-[#E8DDC8] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#142B4A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#142B4A] hover:bg-white/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E8DDC8]' : 'text-[#64748B]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E8DDC8] p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#142B4A] text-white'
                    : 'text-[#172437] hover:bg-[#F6F2EA]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8DDC8]' : 'text-[#64748B]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
