import React from 'react';
import { useApp } from '../../context/AppContext';
import { CrowdScenario } from '../../types';
import {
  Activity,
  Users,
  Store,
  Coffee,
  AlertOctagon,
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

interface ScenarioDefinition {
  id: CrowdScenario;
  name: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  primaryZone: string;
  expectedLoad: string;
  severity: 'normal' | 'warning' | 'critical';
  details: string[];
}

export const PREDEFINED_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'normal',
    name: 'Normal Event Flow',
    badge: 'Baseline Circulation',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: Activity,
    description:
      'Visitors arrive steadily, validate tickets, and circulate naturally between exhibition booths, keynote stages, and dining areas.',
    primaryZone: 'All Zones Balanced',
    expectedLoad: '40% - 65% Capacity',
    severity: 'normal',
    details: [
      'Steady entry throughput without queue formation',
      'Smooth corridor transit on Level 1 and Level 2',
      'No active capacity threshold alerts',
    ],
  },
  {
    id: 'registration_queue',
    name: 'Registration Queue',
    badge: 'Queue & Bottleneck',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Users,
    description:
      'A concentrated influx of morning delegates causes lines to form at check-in desks and smart badge collection terminals.',
    primaryZone: 'Registration & Smart Badge Kiosks',
    expectedLoad: '~92% Capacity (165/180)',
    severity: 'warning',
    details: [
      'Visible queues form at registration counter',
      'Entrance security experiences increased traffic',
      'Automatic warning alert triggered to marshal staff',
    ],
  },
  {
    id: 'crowded_exhibition',
    name: 'Crowded Exhibition',
    badge: 'High Density Surge',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    icon: Store,
    description:
      'Attendees cluster densely around prime robotics and AI partner exhibits, pushing the main hall toward maximum fire code occupancy.',
    primaryZone: 'Exhibition & Innovation Hall (L1)',
    expectedLoad: '~96% Capacity (480/500)',
    severity: 'critical',
    details: [
      'Dense clustering at booth aisles',
      'Critical threshold alert broadcast to organizers',
      'System recommends redirecting attendees to Level 2',
    ],
  },
  {
    id: 'busy_food_court',
    name: 'Busy Food Court',
    badge: 'Lunchtime Peak',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Coffee,
    description:
      'Session break drives massive footfall toward catering stations, coffee kiosks, and seating lounges, creating localized queues.',
    primaryZone: 'Food Court & Refreshment Hub',
    expectedLoad: '~95% Capacity (238/250)',
    severity: 'warning',
    details: [
      'Waiting queues at food counters',
      'Corridor south experiences slowdown',
      'Public crowd indicator warns visitors of peak wait time',
    ],
  },
  {
    id: 'blocked_entrance',
    name: 'Blocked Entrance',
    badge: 'Access Incident & Detour',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertOctagon,
    description:
      'Main entrance gate is temporarily barricaded. Virtual visitors immediately detect path obstruction and calculate alternative safe corridors.',
    primaryZone: 'Main Entrance Turnstiles (Closed)',
    expectedLoad: 'Detour Recalculation',
    severity: 'critical',
    details: [
      'Primary entrance edge marked closed in graph',
      'Dijkstra routing reroutes all pedestrian flows',
      'Simulated smart badges pulse warning cues',
    ],
  },
  {
    id: 'crowd_dispersal',
    name: 'Crowd Dispersal',
    badge: 'Controlled Exit Flow',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: ArrowUpRight,
    description:
      'Delegates leave crowded session halls and disperse smoothly toward exterior exits, transit hubs, and outdoor courtyards.',
    primaryZone: 'Auditorium & Exit Hallways',
    expectedLoad: 'Dropped to ~35% (Safe)',
    severity: 'normal',
    details: [
      'Congested halls empty gradually',
      'Zone colors transition back to normal green',
      'Active congestion warnings auto-resolve',
    ],
  },
];

export const SimulationScenarios: React.FC = () => {
  const {
    activeScenario,
    setCrowdScenario,
    crowdMultiplier,
    setCrowdMultiplier,
    simulationSpeed,
    setSimulationSpeed,
    isSimulationPaused,
    setIsSimulationPaused,
    showAnimatedPeople,
    setShowAnimatedPeople,
    showCrowdHeatmap,
    setShowCrowdHeatmap,
  } = useApp();

  const currentDef =
    PREDEFINED_SCENARIOS.find((s) => s.id === activeScenario) || PREDEFINED_SCENARIOS[0];

  return (
    <div className="bg-white rounded-3xl border border-[#E8DDC8] p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#E8DDC8]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white shadow-xs">
              <Sliders className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h2 className="text-2xl font-bold text-[#0B1F36]">
              Simulation Scenarios
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Demo Simulation Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Select and trigger predefined crowd intelligence scenarios to test venue capacities, queue formation, entrance closures, and dynamic navigation rerouting in real time.
          </p>
        </div>

        {/* Global Scenario Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pause / Resume Simulation */}
          <button
            type="button"
            onClick={() => setIsSimulationPaused(!isSimulationPaused)}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isSimulationPaused
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isSimulationPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Crowd</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Crowd</span>
              </>
            )}
          </button>

          {/* Reset to Normal Flow */}
          <button
            type="button"
            onClick={() => setCrowdScenario('normal')}
            className="py-2 px-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-[#142B4A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to Normal Event Flow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>

          {/* Clock Rate */}
          <div className="flex items-center gap-1 bg-[#F6F2EA] p-1 rounded-xl border border-[#E8DDC8]">
            <span className="text-[10px] font-bold text-[#64748B] px-1.5">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  simulationSpeed === spd
                    ? 'bg-[#142B4A] text-white'
                    : 'text-[#64748B] hover:text-[#142B4A]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Currently Active Scenario Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B1F36] to-[#142B4A] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <currentDef.icon className="w-6 h-6 text-[#E8DDC8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8DDC8]">
                Currently Active Scenario
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">{currentDef.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{currentDef.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Primary Focus
            </span>
            <span className="text-xs font-bold text-[#E8DDC8] block truncate max-w-[180px]">
              {currentDef.primaryZone}
            </span>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white">
            {currentDef.expectedLoad}
          </span>
        </div>
      </div>

      {/* Six Predefined Scenarios Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#142B4A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#142B4A]" />
            <span>Select &amp; Trigger Scenario (6 Predefined Environments)</span>
          </h3>
          <span className="text-[11px] text-[#64748B]">
            Click any scenario to activate immediate 3D crowd movement
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PREDEFINED_SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeScenario === sc.id;

            return (
              <div
                key={sc.id}
                className={`rounded-2xl border-2 p-5 flex flex-col justify-between transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F6F2EA] border-[#142B4A] shadow-md ring-2 ring-[#142B4A]/20'
                    : 'bg-white border-[#E8DDC8] hover:border-[#142B4A]/60 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-[#142B4A] text-[#E8DDC8]'
                          : 'bg-[#F6F2EA] text-[#142B4A] border border-[#E8DDC8]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sc.badgeColor}`}
                    >
                      {sc.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#0B1F36] mb-1">{sc.name}</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-4 min-h-[48px]">
                    {sc.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#F6F2EA] text-[11px] text-[#172437]/80">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Primary Zone:</span>
                      <span className="font-semibold text-[#142B4A] truncate max-w-[140px]">
                        {sc.primaryZone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Expected Load:</span>
                      <span className="font-bold text-[#172437]">{sc.expectedLoad}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F6F2EA]">
                  {isActive ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-[#142B4A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Scenario Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCrowdScenario(sc.id)}
                      className="w-full py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#142B4A] hover:text-white text-[#142B4A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Trigger Scenario</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crowd Density & Visualizer Settings */}
      <div className="p-5 rounded-2xl bg-[#F6F2EA]/60 border border-[#E8DDC8] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 space-y-1">
          <div className="flex justify-between text-xs font-bold text-[#142B4A]">
            <span>Virtual Visitor Volume Scale</span>
            <span>{Math.round(crowdMultiplier * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={crowdMultiplier}
            onChange={(e) => setCrowdMultiplier(parseFloat(e.target.value))}
            className="w-full accent-[#142B4A] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#64748B]">
            <span>Low (50%)</span>
            <span>Standard (100%)</span>
            <span>Maximum Surge (250%)</span>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-end">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-[#172437] cursor-pointer">
            <input
              type="checkbox"
              checked={showAnimatedPeople}
              onChange={(e) => setShowAnimatedPeople(e.target.checked)}
              className="w-4 h-4 rounded text-[#142B4A] accent-[#142B4A] cursor-pointer"
            />
            <span>Show Animated 3D People</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-[#172437] cursor-pointer">
            <input
              type="checkbox"
              checked={showCrowdHeatmap}
              onChange={(e) => setShowCrowdHeatmap(e.target.checked)}
              className="w-4 h-4 rounded text-[#142B4A] accent-[#142B4A] cursor-pointer"
            />
            <span>Heatmap Density Overlay</span>
          </label>
        </div>
      </div>
    </div>
  );
};
