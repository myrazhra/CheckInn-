import React from 'react';
import { useApp } from '../../context/AppContext';
import { Radio, Battery, Send, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { playHapticSound } from '../../utils/audioFeedback';

export const BadgeManagement: React.FC = () => {
  const { badges, sendBadgeHapticCue } = useApp();

  const broadcastEmergencyHaptic = () => {
    playHapticSound('warning');
    badges.forEach((b) => {
      sendBadgeHapticCue(b.id, 'EMERGENCY: Proceed to nearest marked exit');
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#0B1F36] text-[#E8DDC8]">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Smart Badge Fleet Management</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Monitor battery levels, BLE sync states, and dispatch tactile navigation or safety alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={broadcastEmergencyHaptic}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Broadcast Emergency Evacuation Pulse</span>
        </button>
      </div>

      {/* Badges Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-[#142B4A] bg-[#F6F2EA] px-2.5 py-1 rounded-md">
                  {badge.id}
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  {badge.batteryLevel}%
                </span>
              </div>

              <h3 className="font-bold text-base text-[#0B1F36]">{badge.attendeeName}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{badge.ticketTier}</p>

              <div className="mt-4 p-3 bg-[#F6F2EA]/60 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Assigned Room:</span>
                  <span className="font-semibold text-[#172437]">{badge.currentAssignedRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Last Haptic Cue:</span>
                  <span className="font-semibold text-[#142B4A] truncate max-w-[130px]">
                    {badge.lastHapticCue || 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Firmware:</span>
                  <span className="font-mono text-[#64748B]">{badge.firmwareVersion}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#F6F2EA] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  playHapticSound('left');
                  sendBadgeHapticCue(badge.id, 'Turn Alert Dispatched');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#F6F2EA] hover:bg-[#E8DDC8] text-[#142B4A] text-xs font-bold transition-colors cursor-pointer"
              >
                Ping Haptic
              </button>
              <button
                type="button"
                onClick={() => {
                  playHapticSound('destination');
                  sendBadgeHapticCue(badge.id, 'Session Starting at Keynote');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Summon
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
