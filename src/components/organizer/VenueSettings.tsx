import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Camera, Users, Shield, Save, CheckCircle2, RotateCcw } from 'lucide-react';

export const VenueSettings: React.FC = () => {
  const {
    event,
    zones,
    useCameraDataGlobal,
    setUseCameraDataGlobal,
    crowdMultiplier,
    setCrowdMultiplier,
    simulationSpeed,
    setSimulationSpeed,
  } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#0B1F36] text-[#E8DDC8]">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Venue Operations &amp; Telemetry Settings</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Configure crowd counting data sources, optical sensor streams, and safety threshold triggers.
          </p>
        </div>
      </div>

      {/* Primary Data Mode Toggle */}
      <div className="bg-white rounded-3xl border border-[#E8DDC8] p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-base text-[#0B1F36] mb-1">
            Crowd Intelligence Data Feed Mode
          </h3>
          <p className="text-xs text-[#64748B]">
            Ensure clear separation between camera-based people detection and animated demo simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setUseCameraDataGlobal(false)}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              !useCameraDataGlobal
                ? 'bg-[#F6F2EA] border-[#142B4A] shadow-sm'
                : 'bg-white border-[#E8DDC8] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                Mode 1
              </span>
              {!useCameraDataGlobal && (
                <span className="text-xs font-bold text-[#142B4A] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Active
                </span>
              )}
            </div>
            <h4 className="font-bold text-base text-[#0B1F36]">Demo Crowd Simulation</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Generates virtual visitors, realistic queue formation, and congestion scenarios across the 3D venue. Clearly labeled as simulated demo data.
            </p>
          </div>

          <div
            onClick={() => setUseCameraDataGlobal(true)}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              useCameraDataGlobal
                ? 'bg-[#F6F2EA] border-[#142B4A] shadow-sm'
                : 'bg-white border-[#E8DDC8] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                Mode 2
              </span>
              {useCameraDataGlobal && (
                <span className="text-xs font-bold text-[#142B4A] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Active
                </span>
              )}
            </div>
            <h4 className="font-bold text-base text-[#0B1F36]">Camera People Counting</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Accepts aggregated headcount feeds from physical edge camera devices (CAM-L1, CAM-L2). Privacy-first: aggregate density only with no facial recognition.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="pt-6 border-t border-[#E8DDC8] grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-2">
              Virtual Crowd Scale: {Math.round(crowdMultiplier * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={crowdMultiplier}
              onChange={(e) => setCrowdMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#142B4A]"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] mt-1">
              <span>50% (Sparse)</span>
              <span>100% (Normal)</span>
              <span>250% (Max Density)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-2">
              Simulation Clock Rate: {simulationSpeed}x
            </label>
            <div className="flex gap-2">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSimulationSpeed(spd)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    simulationSpeed === spd
                      ? 'bg-[#142B4A] text-white'
                      : 'bg-[#F6F2EA] text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  {spd}x Real-Time
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
