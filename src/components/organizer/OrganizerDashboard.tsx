import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  QrCode,
  Compass,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Radio,
  Sliders,
  Bell,
} from 'lucide-react';
import { calculateOccupancyPercent, getOccupancyStatus, getStatusColor } from '../../utils/crowdLogic';

export const OrganizerDashboard: React.FC = () => {
  const {
    event,
    tickets,
    checkIns,
    zones,
    alerts,
    setActiveTab,
    useCameraDataGlobal,
    setCrowdScenario,
  } = useApp();

  const totalRegistered = event.totalRegistered;
  const checkedInCount = checkIns.filter((c) => c.status === 'success').length;
  const checkInRate = Math.round((checkedInCount / totalRegistered) * 100);

  const totalInVenue = zones.reduce(
    (acc, z) => acc + (useCameraDataGlobal ? z.currentCameraCount : z.currentSimulatedCount),
    0
  );

  const activeAlerts = alerts.filter((a) => !a.isResolved);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B1F36] text-white rounded-3xl p-8 border border-[#142B4A] shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8DDC8]">
              Live Event Command Centre
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">{event.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time operations, camera ticket verification, 3D digital twin &amp; crowd flow governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className="py-3 px-5 rounded-xl bg-[#E8DDC8] hover:bg-white text-[#0B1F36] font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('digitaltwin')}
            className="py-3 px-5 rounded-xl bg-[#142B4A] hover:bg-[#142B4A]/80 text-white font-bold text-xs flex items-center gap-2 border border-[#E8DDC8]/30 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#E8DDC8]" />
            <span>Launch 3D Digital Twin</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Total Verified Attendance
            </span>
            <span className="p-2 rounded-xl bg-[#F6F2EA] text-[#142B4A]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0B1F36]">{checkedInCount}</span>
            <span className="text-xs text-[#64748B]">/ {totalRegistered}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-700">{checkInRate}% Checked In</span>
            <span className="text-[#64748B]">Target: 85% by 10 AM</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Active Venue Occupancy
            </span>
            <span className="p-2 rounded-xl bg-[#F6F2EA] text-[#142B4A]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0B1F36]">{totalInVenue}</span>
            <span className="text-xs text-[#64748B]">visitors</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#142B4A]">
              {useCameraDataGlobal ? 'Camera Count' : 'Demo Simulation'}
            </span>
            <span className="text-emerald-700 font-semibold">&bull; Safe Threshold</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Operational Alerts
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700">{activeAlerts.length}</span>
            <span className="text-xs text-[#64748B]">active conditions</span>
          </div>
          <div className="mt-3 text-xs text-[#64748B]">
            {activeAlerts.length > 0 ? 'Action required in high traffic zones' : 'All zones within limits'}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Scanner Throughput
            </span>
            <span className="p-2 rounded-xl bg-[#F6F2EA] text-[#142B4A]">
              <QrCode className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0B1F36]">18.4</span>
            <span className="text-xs text-[#64748B]">scans / min</span>
          </div>
          <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audible feedback 100% active</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Live Alerts & Zone Occupancy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zone Capacities Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#0B1F36]">Zone Capacities &amp; Real-Time Load</h3>
            <button
              type="button"
              onClick={() => setActiveTab('digitaltwin')}
              className="text-xs font-bold text-[#142B4A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View in 3D Digital Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DDC8] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="pb-3">Zone / Hall</th>
                  <th className="pb-3">Floor</th>
                  <th className="pb-3">Occupancy</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EA]">
                {zones.map((z) => {
                  const count = useCameraDataGlobal ? z.currentCameraCount : z.currentSimulatedCount;
                  const pct = calculateOccupancyPercent(count, z.capacity);
                  const status = getOccupancyStatus(z);
                  const colorHex = getStatusColor(status);

                  return (
                    <tr key={z.id} className="hover:bg-[#F6F2EA]/40 transition-colors">
                      <td className="py-3 font-bold text-[#142B4A]">
                        {z.name}
                        {z.isClosed && <span className="ml-1 text-red-600 font-bold">(CLOSED)</span>}
                      </td>
                      <td className="py-3 text-[#64748B]">Level {z.floor}</td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <span className="font-semibold text-[#172437]">
                            {count} / {z.capacity} ({pct}%)
                          </span>
                          <div className="w-32 h-1.5 bg-[#F6F2EA] rounded-full overflow-hidden border border-[#E8DDC8]/60">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: colorHex }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2 py-0.5 rounded-full font-bold text-[10px] text-white"
                          style={{ backgroundColor: colorHex }}
                        >
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('navigation_ops')}
                          className="px-2 py-1 rounded-md border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#142B4A] hover:text-white text-[11px] font-semibold text-[#142B4A] transition-colors cursor-pointer"
                        >
                          Manage Flow
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Operational Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#0B1F36] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Live Alerts</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {activeAlerts.length}
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center text-[#64748B] text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-[#142B4A]">Normal Venue Operation</p>
                  <p className="text-[11px] mt-1">No zone capacity or congestion warnings active.</p>
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">{alt.zoneName}</span>
                      <span className="text-[10px] text-amber-800 font-mono">{alt.timestamp}</span>
                    </div>
                    <p className="text-amber-900 font-medium">{alt.message}</p>
                    <div className="pt-1 border-t border-amber-200 text-[11px] text-amber-800">
                      <strong>Recommended:</strong> {alt.recommendedAction}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8DDC8] flex gap-2">
            <button
              type="button"
              onClick={() => setCrowdScenario('crowd_dispersal')}
              className="flex-1 py-2 px-3 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Simulate Dispersal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="py-2 px-3 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] text-[#142B4A] text-xs font-bold hover:bg-[#E8DDC8] transition-colors cursor-pointer"
            >
              Broadcast Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
