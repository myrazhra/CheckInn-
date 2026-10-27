import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Send, CheckCircle2, Users, AlertTriangle } from 'lucide-react';
import { EventNotification } from '../../types';

export const NotificationBroadcast: React.FC = () => {
  const { notifications, addNotification } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<EventNotification['category']>('announcement');
  const [audience, setAudience] = useState<EventNotification['audience']>('all');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    addNotification(title.trim(), body.trim(), category, audience);
    setSentSuccess(true);
    setTitle('');
    setBody('');
    setTimeout(() => setSentSuccess(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#0B1F36] text-[#E8DDC8]">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Live Broadcast &amp; Alerts Center</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Dispatch emergency directives, session commencement pings, or crowd redirection bulletins to attendees.
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <form onSubmit={handleSend} className="bg-white rounded-2xl border border-[#E8DDC8] p-8 shadow-xs space-y-5">
        <h3 className="font-bold text-base text-[#0B1F36]">Compose Real-Time Notification</h3>

        {sentSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bulletin successfully broadcast across all visitor devices!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium"
            >
              <option value="announcement">General Announcement</option>
              <option value="congestion_alert">Crowd &amp; Congestion Warning</option>
              <option value="session_start">Keynote / Session Starting</option>
              <option value="emergency">Urgent Operational Notice</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-1.5">
              Audience Segment
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium"
            >
              <option value="all">All Attendees &amp; Staff (Venue-Wide)</option>
              <option value="visitors">Visitors &amp; Delegates Only</option>
              <option value="organizers">Security &amp; Ops Marshals Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-1.5">
            Subject Line
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Keynote Hall Seating Now Open on Level 2"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-1.5">
            Broadcast Message Body
          </label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Include concise guidance, alternative entrances, or session timing..."
            className="w-full p-3.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#E8DDC8]" />
          <span>Dispatch Broadcast to Attendees</span>
        </button>
      </form>

      {/* Broadcast History */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
        <h3 className="font-bold text-sm text-[#0B1F36] mb-3">Recent Broadcast History</h3>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#142B4A]">{n.title}</span>
                <span className="text-[10px] text-[#64748B] font-mono">{n.timestamp}</span>
              </div>
              <p className="text-[#64748B]">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
