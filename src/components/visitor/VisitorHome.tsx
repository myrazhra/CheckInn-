import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ticket,
  Compass,
  Users,
  Calendar,
  Radio,
  Bell,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { EVENT_SCHEDULE } from '../../data/mockData';

export const VisitorHome: React.FC = () => {
  const { currentUser, tickets, setActiveTab, setSelectedTargetNodeId, notifications } = useApp();

  const myTicket =
    tickets.find((t) => t.id === currentUser?.ticketId) || tickets[0];
  const isCheckedIn = myTicket?.status === 'checked_in';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B1F36] to-[#142B4A] rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DDC8]/20 border border-[#E8DDC8]/30 text-xs font-semibold text-[#E8DDC8] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#E8DDC8]" />
            <span>Welcome to CheckIn+ Expo 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Hello, {currentUser?.name || 'Attendee'}!
          </h1>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">
            Your all-in-one companion for digital check-in, real-time 3D indoor navigation, crowd intelligence, and live schedules.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('ticket')}
              className="py-3 px-5 rounded-xl bg-[#E8DDC8] hover:bg-white text-[#0B1F36] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Ticket className="w-4 h-4" />
              <span>View My QR Ticket</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('venue3d')}
              className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#E8DDC8]" />
              <span>Explore 3D Venue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket Status Card */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-[#F6F2EA] text-[#142B4A] border border-[#E8DDC8]">
                <Ticket className="w-5 h-5" />
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isCheckedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isCheckedIn ? 'Checked In' : 'Active Pass'}
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#0B1F36]">Digital Access Pass</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Tier: <strong>{myTicket?.ticketTier}</strong> &bull; {myTicket?.id}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('ticket')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-xs font-bold text-[#142B4A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open Ticket &amp; QR Barcode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Wayfinding Card */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-[#F6F2EA] text-[#142B4A] border border-[#E8DDC8]">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Turn-by-Turn Ready
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#0B1F36]">Interactive 3D Map</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Elevated isometric map with moving simulation marker and detour detection.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('venue3d')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-xs font-bold text-[#142B4A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Start 3D Navigation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Crowd Intelligence Card */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-[#F6F2EA] text-[#142B4A] border border-[#E8DDC8]">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8DDC8] text-[#142B4A]">
                Live Heatmap
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#0B1F36]">Crowd Intelligence</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Public congestion indicators, quietest hours, and food court wait times.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('crowd')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-xs font-bold text-[#142B4A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>View Venue Crowd Levels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#142B4A]" />
              <h3 className="font-bold text-base text-[#0B1F36]">Featured Sessions Today</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-bold text-[#142B4A] hover:underline cursor-pointer"
            >
              Full Agenda &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {EVENT_SCHEDULE.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{item.time}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8DDC8]/60 text-[10px]">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B1F36]">{item.title}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetNodeId(item.targetNodeId);
                    setActiveTab('venue3d');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-[#E8DDC8]" />
                  <span>Navigate</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Announcements (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#142B4A]" />
              <h3 className="font-bold text-base text-[#0B1F36]">Live Announcements</h3>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#142B4A]">{n.title}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{n.timestamp}</span>
                </div>
                <p className="text-[#64748B] leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
