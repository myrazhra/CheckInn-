import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { tickets, checkIns, recordCheckIn } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = filterTier === 'all' || t.ticketTier === filterTier;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const exportCSV = () => {
    const headers = 'Ticket ID,Name,Email,Tier,Status,CheckIn Time,Seat Zone\n';
    const rows = filteredTickets
      .map(
        (t) =>
          `"${t.id}","${t.attendeeName}","${t.attendeeEmail}","${t.ticketTier}","${t.status}","${
            t.firstCheckedInAt || 'N/A'
          }","${t.seatZone}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkin_attendance_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <Users className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Attendance &amp; Delegate Registry</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Manage all attendee tickets, view check-in timestamps, and perform manual operational verifications.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-xs font-bold text-[#142B4A] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Roster</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-4 shadow-xs flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or ticket ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] focus:ring-2 focus:ring-[#142B4A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B]">Tier:</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium"
          >
            <option value="all">All Tiers</option>
            <option value="VIP All-Access">VIP All-Access</option>
            <option value="General Admission">General Admission</option>
            <option value="Speaker / Press">Speaker / Press</option>
            <option value="Exhibitor Pass">Exhibitor Pass</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B]">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="valid">Pending Check-In</option>
            <option value="checked_in">Checked In</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F6F2EA]/80 border-b border-[#E8DDC8] text-[#142B4A] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Attendee</th>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Access Tier</th>
                <th className="py-3.5 px-4">Seat / Zone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-in Time</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F2EA]">
              {filteredTickets.map((t) => {
                const isCheckedIn = t.status === 'checked_in';
                const isRevoked = t.status === 'revoked';
                const isExpired = t.status === 'expired';

                return (
                  <tr key={t.id} className="hover:bg-[#F6F2EA]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-[#142B4A] block">{t.attendeeName}</span>
                        <span className="text-[11px] text-[#64748B]">{t.attendeeEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0B1F36]">{t.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#E8DDC8]/60 text-[#142B4A] font-semibold text-[11px]">
                        {t.ticketTier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{t.seatZone}</td>
                    <td className="py-3 px-4">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Checked In
                        </span>
                      ) : isRevoked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          Revoked
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300">
                          Pending Scan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#64748B]">
                      {t.firstCheckedInAt || '&mdash;'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isCheckedIn && !isRevoked && !isExpired && (
                        <button
                          type="button"
                          onClick={() => recordCheckIn(t.qrPayload, 'manual_code')}
                          className="px-2.5 py-1 rounded-lg bg-[#142B4A] hover:bg-[#0B1F36] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Manual Check-In
                        </button>
                      )}
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
