import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Ticket,
  ShieldCheck,
  Compass,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  QrCode,
  Layers,
  Radio,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { loginAsVisitor, loginAsOrganizer } = useApp();

  const [authModal, setAuthModal] = useState<'visitor' | 'organizer' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  const openVisitorModal = () => {
    setEmail('sarah.jenkins@example.com');
    setPassword('CheckIn2026!');
    setErrorMsg('');
    setForgotPasswordSubmitted(false);
    setAuthModal('visitor');
  };

  const openOrganizerModal = () => {
    setEmail('director@checkinplus.io');
    setPassword('AdminCommand2026!');
    setErrorMsg('');
    setForgotPasswordSubmitted(false);
    setAuthModal('organizer');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (authModal === 'visitor') {
      loginAsVisitor(email, email.split('@')[0].replace('.', ' ').toUpperCase());
    } else {
      loginAsOrganizer(email, 'Event Commander');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#172437] flex flex-col justify-between font-sans">
      {/* Top Banner */}
      <header className="border-b border-[#E8DDC8] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center text-white shadow-md">
              <QrCode className="w-6 h-6 text-[#E8DDC8]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#142B4A]">
                CheckIn<span className="text-[#0B1F36] font-black">+</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8DDC8]/60 text-[#142B4A]">
                v2.6 Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8DDC8]/40 text-[#142B4A] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Grand Metropolis Summit 2026
            </span>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8DDC8]/70 border border-[#E8DDC8] text-[#142B4A] text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#142B4A]" />
          <span>The Next-Generation Event Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B1F36] tracking-tight max-w-3xl leading-tight">
          Smarter Events. <br className="hidden sm:inline" />
          <span className="text-[#142B4A] underline decoration-[#E8DDC8] decoration-4 underline-offset-8">
            Seamless Experiences.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#64748B] max-w-2xl leading-relaxed">
          CheckIn+ connects event attendance, real-time camera QR scanning, interactive 3D venue navigation, and live crowd intelligence in one unified platform. Choose your account type to proceed:
        </p>

        {/* Two Prominent Login Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
          {/* OPTION 1: VISITOR LOGIN */}
          <div className="relative group bg-white rounded-2xl border-2 border-[#E8DDC8] p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#142B4A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#F6F2EA] border border-[#E8DDC8] flex items-center justify-center text-[#142B4A] group-hover:bg-[#142B4A] group-hover:text-[#E8DDC8] transition-colors">
                  <Ticket className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F6F2EA] text-[#142B4A] border border-[#E8DDC8]">
                  Option 1
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#0B1F36] mb-3">
                Visitor Experience
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                Your personal event companion. Check in, explore the venue, navigate in 3D, receive updates, and enjoy a smoother event experience.
              </p>

              <div className="space-y-2 mb-8 text-xs text-[#172437]/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant digital QR tickets &amp; fast check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive 3D indoor map &amp; moving navigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public crowd congestion levels &amp; smart badge cues</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#F6F2EA]">
              <button
                type="button"
                onClick={openVisitorModal}
                className="w-full py-3.5 px-6 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Continue as Visitor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => loginAsVisitor('sarah.jenkins@example.com', 'Sarah Jenkins (VIP)')}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/50 text-xs font-semibold text-[#142B4A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Instant Demo: Sarah Jenkins (VIP Pass)</span>
              </button>
            </div>
          </div>

          {/* OPTION 2: ORGANIZER LOGIN */}
          <div className="relative group bg-white rounded-2xl border-2 border-[#E8DDC8] p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#142B4A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#0B1F36] border border-[#0B1F36] flex items-center justify-center text-[#E8DDC8] group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#142B4A] text-white">
                  Option 2
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#0B1F36] mb-3">
                Organizer Command Centre
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                Your event command centre. Monitor attendance, crowd levels, live venue operations, navigation, smart badges, notifications, and event feedback.
              </p>

              <div className="space-y-2 mb-8 text-xs text-[#172437]/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real camera QR ticket scanner with audible feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3D Digital Twin with animated crowd simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Corridor closures, capacity alerts &amp; smart badge ops</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#F6F2EA]">
              <button
                type="button"
                onClick={openOrganizerModal}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0B1F36] hover:bg-[#142B4A] text-[#E8DDC8] font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Login as Organizer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => loginAsOrganizer('director@checkinplus.io', 'Director Vance')}
                className="w-full py-2.5 px-4 rounded-xl border border-[#0B1F36] bg-[#0B1F36]/5 hover:bg-[#0B1F36]/10 text-xs font-semibold text-[#0B1F36] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Instant Demo: Command Operations Lead</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7 CheckIn+ Technologies Footnote */}
        <div className="mt-14 max-w-4xl w-full bg-white/70 rounded-2xl p-6 border border-[#E8DDC8] text-left">
          <p className="text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-3">
            7 Integrated Event Technologies:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <QrCode className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">1. QR Tickets</span>
            </div>
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <Compass className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">2. 3D Navigation</span>
            </div>
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <Users className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">3. Crowd AI</span>
            </div>
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <Layers className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">4. Schedules</span>
            </div>
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <Radio className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">5. Smart Badges</span>
            </div>
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <Sparkles className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">6. Alerts</span>
            </div>
            <div className="p-2.5 bg-[#F6F2EA] rounded-xl border border-[#E8DDC8]/60">
              <CheckCircle2 className="w-5 h-5 mx-auto text-[#142B4A] mb-1.5" />
              <span className="text-[11px] font-semibold block text-[#172437]">7. Feedback</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8DDC8] bg-white py-4 px-6 text-center text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 CheckIn+ Event Systems. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#142B4A] cursor-pointer">Privacy First Architecture</span>
            <span>&bull;</span>
            <span className="hover:text-[#142B4A] cursor-pointer">Accessibility Compliant</span>
            <span>&bull;</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Production Ready</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E8DDC8] max-w-md w-full p-8 shadow-2xl relative text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${authModal === 'visitor' ? 'bg-[#142B4A]' : 'bg-[#0B1F36]'}`}>
                  {authModal === 'visitor' ? <Ticket className="w-6 h-6 text-[#E8DDC8]" /> : <ShieldCheck className="w-6 h-6 text-[#E8DDC8]" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F36]">
                    {authModal === 'visitor' ? 'Visitor Portal' : 'Organizer Sign In'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {authModal === 'visitor' ? 'Access your ticket, 3D map & schedule' : 'Authenticate for command controls'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthModal(null)}
                className="w-8 h-8 rounded-full bg-[#F6F2EA] hover:bg-[#E8DDC8] text-[#172437] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                aria-label="Close authentication modal"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {forgotPasswordSubmitted && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Password recovery link has been dispatched to <strong>{email}</strong>.
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172437] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authModal === 'visitor' ? 'sarah.jenkins@example.com' : 'admin@checkinplus.io'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-sm text-[#172437] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#172437]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordSubmitted(true)}
                    className="text-[11px] text-[#142B4A] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-sm text-[#172437] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#64748B] hover:text-[#172437] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.99] cursor-pointer ${
                    authModal === 'visitor' ? 'bg-[#142B4A] hover:bg-[#0B1F36]' : 'bg-[#0B1F36] hover:bg-[#142B4A]'
                  }`}
                >
                  {authModal === 'visitor' ? 'Enter Visitor Dashboard' : 'Authenticate Command Access'}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E8DDC8] text-center">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Demo Authentication Mode
              </span>
              <button
                type="button"
                onClick={() => {
                  if (authModal === 'visitor') {
                    loginAsVisitor('sarah.jenkins@example.com', 'Sarah Jenkins (VIP)');
                  } else {
                    loginAsOrganizer('director@checkinplus.io', 'Director Vance');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E8DDC8]/60 hover:bg-[#E8DDC8] text-[#142B4A] text-xs font-bold transition-colors cursor-pointer"
              >
                Instant Access as Demo {authModal === 'visitor' ? 'Visitor' : 'Organizer'}
              </button>
              <p className="mt-2 text-[10px] text-[#64748B]">
                Demo mode is clearly labelled and simulates full platform authorization without external SSO delays.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
