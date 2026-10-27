import React, { useState } from 'react';
import { Venue3DMap } from '../navigation/Venue3DMap';
import { SimulationScenarios } from './SimulationScenarios';
import { useApp } from '../../context/AppContext';
import { Compass, Users, Sliders, Sparkles, Layers } from 'lucide-react';

export const DigitalTwinView: React.FC<{ initialSubTab?: 'map' | 'scenarios' }> = ({
  initialSubTab = 'map',
}) => {
  const { event, activeScenario, crowdMultiplier, useCameraDataGlobal } = useApp();
  const [subTab, setSubTab] = useState<'map' | 'scenarios'>(initialSubTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#0B1F36] text-[#E8DDC8]">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">
              Live 3D Digital Twin &amp; Crowd Intelligence
            </h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Interactive isometric 3D venue operations. Test crowd congestion scenarios, monitor dynamic zone heatmaps, and control corridor access.
          </p>
        </div>

        {/* View Switcher Sub-tabs */}
        <div className="flex items-center gap-1.5 bg-[#F6F2EA] p-1.5 rounded-2xl border border-[#E8DDC8]">
          <button
            type="button"
            onClick={() => setSubTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'map'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#142B4A]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Venue View</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('scenarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'scenarios'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#142B4A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulation Scenarios</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Scenarios Mode or Map Mode */}
      {subTab === 'scenarios' ? (
        <div className="space-y-6">
          <SimulationScenarios />

          {/* Connected 3D Viewport so organizer sees the visual effect immediately */}
          <div className="bg-white rounded-3xl border border-[#E8DDC8] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#142B4A]" />
                <h3 className="font-bold text-base text-[#0B1F36]">
                  Live 3D Digital Twin (Active Response to Selected Scenario)
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">
                Observe pedestrian movements and zone colors updating in real time
              </span>
            </div>
            <Venue3DMap isOrganizerView={true} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Embedded 3D Venue Map */}
          <Venue3DMap isOrganizerView={true} />

          {/* Quick Scenario Picker Banner */}
          <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#142B4A]" />
                <h3 className="font-bold text-sm text-[#0B1F36]">
                  Crowd Simulation Scenarios Manager
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Switch scenarios: Normal Flow, Registration Queue, Crowded Expo, Food Court, Blocked Entrance, Dispersal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSubTab('scenarios')}
              className="py-2.5 px-4 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Sliders className="w-4 h-4 text-[#E8DDC8]" />
              <span>Open Predefined Scenarios Suite</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
