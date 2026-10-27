import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Star, Send, CheckCircle2, ThumbsUp } from 'lucide-react';
import { EventFeedback } from '../../types';

export const VisitorFeedback: React.FC = () => {
  const { submitFeedback, feedbacks } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState<EventFeedback['category']>('navigation');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitFeedback(rating, category, comment.trim());
    setSubmitted(true);
    setComment('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <MessageSquare className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Event Experience Feedback</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Help event directors refine check-in speed, 3D wayfinding accuracy, and crowd flow.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border-2 border-[#E8DDC8] p-8 text-center space-y-4 shadow-sm animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-[#0B1F36]">Thank You for Your Feedback!</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Your review has been synchronized live to the organizer&apos;s command operations dashboard.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="py-2.5 px-6 rounded-xl bg-[#142B4A] text-white text-xs font-bold hover:bg-[#0B1F36] transition-colors cursor-pointer"
          >
            Submit Another Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8DDC8] p-8 shadow-sm space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-2">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-bold text-[#142B4A]">
                {rating === 5 ? 'Exceptional' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-2">
              Feedback Focus Area
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-sm text-[#172437] font-medium focus:ring-2 focus:ring-[#142B4A]"
            >
              <option value="navigation">3D Indoor Navigation &amp; Wayfinding</option>
              <option value="checkin">Camera QR Ticket &amp; Entrance Speed</option>
              <option value="sessions">Conference Sessions &amp; Stages</option>
              <option value="facilities">Venue Facilities &amp; Food Court</option>
              <option value="general">General Event Experience</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#142B4A] mb-2">
              Your Comments &amp; Suggestions
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what worked well and what could be improved..."
              className="w-full p-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-sm text-[#172437] focus:ring-2 focus:ring-[#142B4A]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#E8DDC8]" />
            <span>Submit Feedback</span>
          </button>
        </form>
      )}

      {/* Recent Feedback Feed */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[#142B4A] mb-3">
          Community Experience Highlights
        </h4>
        <div className="space-y-3">
          {feedbacks.slice(0, 3).map((fb) => (
            <div
              key={fb.id}
              className="p-3.5 rounded-xl border border-[#E8DDC8]/80 bg-[#F6F2EA]/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#142B4A]">{fb.visitorName}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">{fb.timestamp}</span>
              </div>
              <p className="text-[#64748B]">{fb.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
