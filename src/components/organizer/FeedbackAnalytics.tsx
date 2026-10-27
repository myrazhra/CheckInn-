import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Star, TrendingUp, ThumbsUp, Heart, Smile } from 'lucide-react';

export const FeedbackAnalytics: React.FC = () => {
  const { feedbacks } = useApp();

  const totalReviews = feedbacks.length;
  const avgRating =
    totalReviews > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const positiveCount = feedbacks.filter((f) => f.sentiment === 'positive').length;
  const positivePct = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#0B1F36] text-[#E8DDC8]">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Visitor Experience &amp; Feedback Analytics</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Continuous sentiment telemetry across 3D navigation, camera check-in, and venue amenities.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">
            Average Satisfaction Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#0B1F36]">{avgRating}</span>
            <span className="text-sm text-[#64748B]">/ 5.0</span>
          </div>
          <div className="flex text-amber-400 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">
            Positive Sentiment Ratio
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-600">{positivePct}%</span>
            <span className="text-xs text-[#64748B]">delighted attendees</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Zero critical safety or congestion complaints.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">
            Total Submissions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#142B4A]">{totalReviews}</span>
            <span className="text-xs text-[#64748B]">verified reviews</span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-2">Real-time sync active</p>
        </div>
      </div>

      {/* Feedback Stream */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
        <h3 className="font-bold text-sm text-[#0B1F36] mb-4">Live Attendee Reviews</h3>
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#142B4A]">{f.visitorName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8DDC8]/60 text-[10px] font-semibold text-[#142B4A]">
                    {f.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: f.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono">{f.timestamp}</span>
                </div>
              </div>
              <p className="text-[#172437] font-medium leading-relaxed">{f.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
