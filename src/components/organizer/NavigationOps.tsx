import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, AlertTriangle, CheckCircle2, Lock, Unlock, Shuffle, Info } from 'lucide-react';

export const NavigationOps: React.FC = () => {
  const { edges, nodes, toggleEdgeClosure, setActiveTab, setSelectedTargetNodeId } = useApp();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <Compass className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Navigation Operations &amp; Corridors</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Dynamically open or close hallways, turnstiles, and stairs. Changes immediately update visitor routing and the 3D moving marker simulation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('digitaltwin')}
          className="py-2.5 px-4 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Inspect on 3D Map
        </button>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-[#F6F2EA] border border-[#E8DDC8] rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#142B4A] shrink-0 mt-0.5" />
        <p className="text-xs text-[#172437] leading-relaxed">
          Closing an active corridor or entrance triggers Dijkstra recalculation across all connected clients. If an attendee is currently running a navigation simulation along that corridor, their route will automatically divert via alternative safe walkways.
        </p>
      </div>

      {/* Edge Corridors Table */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F6F2EA]/60 border-b border-[#E8DDC8] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[#142B4A]">
            Walkway Network Edges ({edges.length})
          </span>
          <span className="text-xs text-[#64748B]">
            {edges.filter((e) => e.isClosed).length} Currently Closed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DDC8] text-[#64748B] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">From Node</th>
                <th className="py-3 px-4">To Node</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Congestion Factor</th>
                <th className="py-3 px-4">Operational State</th>
                <th className="py-3 px-4 text-right">Toggle Closure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F2EA]">
              {edges.map((e) => {
                const fromNode = nodes.find((n) => n.id === e.fromNodeId);
                const toNode = nodes.find((n) => n.id === e.toNodeId);

                return (
                  <tr key={e.id} className="hover:bg-[#F6F2EA]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#142B4A]">
                      {fromNode?.name || e.fromNodeId}
                      <span className="text-[10px] text-[#64748B] block font-normal">
                        L{fromNode?.floor}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#142B4A]">
                      {toNode?.name || e.toNodeId}
                      <span className="text-[10px] text-[#64748B] block font-normal">
                        L{toNode?.floor}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{e.distanceMeters}m</td>
                    <td className="py-3 px-4 font-semibold text-[#142B4A]">
                      {e.congestionWeight}x normal
                    </td>
                    <td className="py-3 px-4">
                      {e.isClosed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <Lock className="w-3 h-3 text-red-600" />
                          Closed &bull; Detour Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          Open &amp; Walkable
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleEdgeClosure(e.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          e.isClosed
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {e.isClosed ? 'Reopen Passage' : 'Close Passage'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
