import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EVENT_SCHEDULE } from '../../data/mockData';
import {
  Calendar,
  Compass,
  Search,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Building,
} from 'lucide-react';

export const FindRoomSchedule: React.FC = () => {
  const { nodes, zones, setSelectedTargetNodeId, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');

  const filteredSessions = EVENT_SCHEDULE.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredRooms = nodes.filter((n) => {
    const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = selectedFloor === 'all' || n.floor === selectedFloor;
    return matchesSearch && matchesFloor;
  });

  const handleNavigateToNode = (nodeId: string) => {
    setSelectedTargetNodeId(nodeId);
    setActiveTab('venue3d');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <Calendar className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Find a Room &amp; Schedule</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Search event locations, conference halls, and keynote sessions with direct 1-click 3D wayfinding.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search room, hall, or talk..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0B1F36] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#142B4A]" />
              Event Schedule &amp; Agenda ({filteredSessions.length})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 hover:bg-[#F6F2EA] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A]">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{session.time}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8DDC8]/60 text-[10px]">
                      {session.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B1F36]">{session.title}</h4>
                  <p className="text-xs text-[#64748B]">Speaker: {session.speaker}</p>
                  <p className="text-xs text-[#142B4A] font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#142B4A]" />
                    <span>{session.location}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateToNode(session.targetNodeId)}
                  className="px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#E8DDC8]" />
                  <span>Navigate in 3D</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Directory / Room Index (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0B1F36] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#142B4A]" />
              Venue Room Directory
            </h3>

            {/* Floor filter */}
            <div className="flex items-center gap-1 bg-[#F6F2EA] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedFloor('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  selectedFloor === 'all' ? 'bg-[#142B4A] text-white' : 'text-[#64748B]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedFloor(1)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  selectedFloor === 1 ? 'bg-[#142B4A] text-white' : 'text-[#64748B]'
                }`}
              >
                L1
              </button>
              <button
                type="button"
                onClick={() => setSelectedFloor(2)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  selectedFloor === 2 ? 'bg-[#142B4A] text-white' : 'text-[#64748B]'
                }`}
              >
                L2
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredRooms.map((node) => {
              const matchedZone = zones.find((z) => z.id === node.zoneId);

              return (
                <div
                  key={node.id}
                  className="p-3 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#142B4A] block">{node.name}</span>
                    <span className="text-[10px] text-[#64748B]">
                      Level {node.floor} &bull; Type: {node.type}
                    </span>
                    {matchedZone?.isClosed && (
                      <span className="text-[10px] text-red-600 font-bold block">
                        Temporarily Closed
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigateToNode(node.id)}
                    className="p-2 rounded-lg bg-[#F6F2EA] hover:bg-[#142B4A] hover:text-white text-[#142B4A] transition-colors cursor-pointer"
                    title={`Calculate route to ${node.name}`}
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
