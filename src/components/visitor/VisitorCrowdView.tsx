import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, AlertTriangle, Clock, Info, CheckCircle2, Compass } from 'lucide-react';
import {
  calculateOccupancyPercent,
  getOccupancyStatus,
  getStatusColor,
  getStatusLabel,
} from '../../utils/crowdLogic';

export const VisitorCrowdView: React.FC = () => {
  const { zones, useCameraDataGlobal, setActiveTab } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <Users className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Live Crowd &amp; Congestion Levels</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Plan your venue movements smoothly by monitoring public occupancy and queue lengths.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
          {useCameraDataGlobal ? 'Verified Camera Sensor Feed' : 'Demo Simulation Model'}
        </span>
      </div>

      {/* Recommended Visit Windows Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">Smart Visit Recommendations:</span>
          <strong>Food Court:</strong> Lowest queue times expected between 1:45 PM – 3:00 PM. <br />
          <strong>Exhibition Hall:</strong> Optimal exploration windows are early morning (9:00 AM – 10:30 AM) and late afternoon.
        </div>
      </div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => {
          const count = useCameraDataGlobal ? zone.currentCameraCount : zone.currentSimulatedCount;
          const pct = calculateOccupancyPercent(count, zone.capacity);
          const status = getOccupancyStatus(zone);
          const colorHex = getStatusColor(status);
          const label = getStatusLabel(status);

          return (
            <div
              key={zone.id}
              className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F6F2EA] text-[#142B4A]">
                    Level {zone.floor} &bull; {zone.category.toUpperCase()}
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: colorHex }}
                  >
                    {label}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#0B1F36]">{zone.name}</h3>
                <p className="text-xs text-[#64748B] mt-1">{zone.description}</p>

                {/* Occupancy Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#64748B]">Current Occupancy</span>
                    <span className="text-[#142B4A]">
                      {count} / {zone.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#F6F2EA] rounded-full overflow-hidden border border-[#E8DDC8]/60">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colorHex,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F6F2EA] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  Source: {useCameraDataGlobal ? zone.cameraDeviceName || 'Sensor CAM' : 'Simulation Engine'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('venue3d')}
                  className="text-xs font-bold text-[#142B4A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>View in 3D Map</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
