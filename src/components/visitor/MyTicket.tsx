import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Share2,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export const MyTicket: React.FC = () => {
  const { currentUser, tickets, event, setActiveTab, setSelectedTargetNodeId } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Find current user's ticket
  const myTicket =
    tickets.find((t) => t.id === currentUser?.ticketId) ||
    tickets[0]; // fallback to first demo ticket

  useEffect(() => {
    if (myTicket) {
      QRCode.toDataURL(myTicket.qrPayload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0B1F36',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((e) => console.warn('QR gen error:', e));
    }
  }, [myTicket]);

  const isCheckedIn = myTicket?.status === 'checked_in';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <TicketIcon className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Digital Access Pass</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Your official CheckIn+ event credential with real camera-scannable QR barcode.
          </p>
        </div>

        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
            isCheckedIn
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-blue-50 text-blue-800 border-blue-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCheckedIn ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
            }`}
          />
          {isCheckedIn ? 'Verified & Checked In' : 'Active Pass — Ready for Scan'}
        </span>
      </div>

      {/* Ticket Pass Card (Boarding Pass / VIP Credential Styling) */}
      <div className="bg-white rounded-3xl border-2 border-[#E8DDC8] overflow-hidden shadow-lg">
        {/* Ticket Top Ribbon */}
        <div className="bg-[#142B4A] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8DDC8] block mb-1">
              Official Delegate Pass
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{event.name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#E8DDC8]" />
                {event.date}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E8DDC8]" />
                {event.venue}
              </span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#0B1F36] border border-[#E8DDC8]/30 text-right">
            <span className="text-[10px] text-[#E8DDC8] block uppercase font-bold tracking-wider">
              Access Tier
            </span>
            <span className="text-sm font-black text-white">{myTicket.ticketTier}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Attendee Details (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                Attendee Name
              </span>
              <h3 className="text-2xl font-bold text-[#0B1F36]">{myTicket.attendeeName}</h3>
              <p className="text-sm text-[#64748B]">{myTicket.attendeeEmail}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F6F2EA]">
              <div>
                <span className="text-xs font-semibold text-[#64748B] block mb-1">Seat / Zone</span>
                <span className="text-sm font-bold text-[#172437]">{myTicket.seatZone}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#64748B] block mb-1">Smart Badge ID</span>
                <span className="text-sm font-bold text-[#142B4A] font-mono">
                  {myTicket.badgeAssignedId || 'BDG-042'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F6F2EA] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#64748B] block">Check-in Status</span>
                {isCheckedIn ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    First Scan at {myTicket.firstCheckedInAt}
                  </span>
                ) : (
                  <span className="font-semibold text-blue-700">Present at entrance camera</span>
                )}
              </div>
              <div>
                <span className="text-[#64748B] block">Ticket Ref</span>
                <span className="font-mono font-bold text-[#0B1F36]">{myTicket.id}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTargetNodeId('n-l2-keynote');
                  setActiveTab('venue3d');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#E8DDC8]" />
                <span>Navigate to Assigned Seat in 3D</span>
              </button>
            </div>
          </div>

          {/* QR Barcode Column (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#F6F2EA]/60 rounded-3xl border border-[#E8DDC8]">
            <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-3">
              Official QR Pass
            </span>

            <div className="p-3 bg-white rounded-2xl shadow-md border border-[#E8DDC8]">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Ticket QR Barcode" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Generating Barcode...
                </div>
              )}
            </div>

            <span className="font-mono text-xs font-bold text-[#142B4A] mt-3">
              {myTicket.qrPayload}
            </span>
            <span className="text-[10px] text-[#64748B] text-center mt-1">
              Encrypted event barcode verified by CheckIn+ Camera Scanners
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
