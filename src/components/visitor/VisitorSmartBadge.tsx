import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Radio, Battery, Zap, Sparkles, AlertCircle, Compass, CheckCircle } from 'lucide-react';
import { playHapticSound } from '../../utils/audioFeedback';

export const VisitorSmartBadge: React.FC = () => {
  const { badges, currentUser, sendBadgeHapticCue } = useApp();
  const [activeCueMessage, setActiveCueMessage] = useState<string>('');

  const myBadge = badges[0]; // Active visitor badge

  const triggerTestCue = (type: 'left' | 'right' | 'destination' | 'warning', label: string) => {
    playHapticSound(type);
    setActiveCueMessage(`[Simulated Haptic] ${label}`);
    sendBadgeHapticCue(myBadge.id, label);
    setTimeout(() => {
      setActiveCueMessage('');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <Radio className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Smart Badge Companion</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            BLE-connected physical credential with vibrotactile directional cues for hands-free navigation.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Paired &amp; Synced
        </span>
      </div>

      {/* Visual Badge Card */}
      <div className="bg-white rounded-3xl border-2 border-[#E8DDC8] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Badge Device Representation */}
          <div className="w-64 h-88 bg-gradient-to-b from-[#0B1F36] to-[#142B4A] rounded-3xl p-6 text-white shadow-xl border-4 border-[#E8DDC8] flex flex-col justify-between relative overflow-hidden">
            {/* Lanyard punch hole */}
            <div className="w-10 h-2.5 mx-auto bg-black/40 rounded-full border border-white/20 mb-2" />

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8DDC8]">
                CheckIn+ Smart Credential
              </span>
              <h3 className="text-lg font-black mt-1">{currentUser?.name || 'Sarah Jenkins'}</h3>
              <span className="text-xs text-slate-300 font-medium">VIP All-Access Pass</span>
            </div>

            {/* LED Status Indicator */}
            <div className="p-3 bg-black/30 rounded-2xl border border-white/10 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Haptic Engine Ready</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate">
                {myBadge.lastHapticCue || 'Idle at Keynote Auditorium'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
              <span className="font-mono text-[10px] text-slate-400">{myBadge.id}</span>
              <span className="text-[#E8DDC8] font-bold text-[11px] flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                {myBadge.batteryLevel}%
              </span>
            </div>
          </div>

          {/* Haptic Controls & Simulator */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[#0B1F36]">Simulated Haptic Navigation Cues</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                During 3D venue navigation, your smart badge vibrates distinct tactile frequencies to alert you before turnings, stairs, or restricted zones without glancing at your phone.
              </p>
            </div>

            {activeCueMessage && (
              <div className="p-4 rounded-2xl bg-[#142B4A] text-white flex items-center gap-3 animate-in zoom-in-95">
                <Radio className="w-6 h-6 text-[#E8DDC8] animate-spin" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8DDC8] block">
                    Vibration Motor Active
                  </span>
                  <span className="text-sm font-bold">{activeCueMessage}</span>
                </div>
              </div>
            )}

            {/* Test buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerTestCue('left', 'Double Pulse: Turn Left in 15m')}
                className="p-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/60 hover:bg-[#E8DDC8] text-[#142B4A] text-xs font-bold text-left transition-colors cursor-pointer"
              >
                <span className="block font-black text-sm mb-0.5">◄ Left Turn</span>
                <span className="text-[10px] text-[#64748B] block">Test left pulse vibration</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTestCue('right', 'Double Pulse: Turn Right in 15m')}
                className="p-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/60 hover:bg-[#E8DDC8] text-[#142B4A] text-xs font-bold text-left transition-colors cursor-pointer"
              >
                <span className="block font-black text-sm mb-0.5">► Right Turn</span>
                <span className="text-[10px] text-[#64748B] block">Test right pulse vibration</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTestCue('destination', 'Long Chime: Destination Reached')}
                className="p-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/60 hover:bg-[#E8DDC8] text-[#142B4A] text-xs font-bold text-left transition-colors cursor-pointer"
              >
                <span className="block font-black text-sm mb-0.5">★ Destination Nearby</span>
                <span className="text-[10px] text-[#64748B] block">Test arrival pattern</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTestCue('warning', 'Rapid Buzz: Corridor Closed / Detour')}
                className="p-3.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold text-left transition-colors cursor-pointer"
              >
                <span className="block font-black text-sm mb-0.5">⚠️ Reroute Warning</span>
                <span className="text-[10px] text-red-600 block">Test blocked corridor buzz</span>
              </button>
            </div>

            <p className="text-[11px] text-[#64748B]">
              <strong>Note:</strong> On devices without physical BLE vibrator accessories, visual feedback and synthesized audio pulses are presented to simulate hardware interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
