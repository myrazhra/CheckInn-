import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  CameraOff,
  Flashlight,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  Keyboard,
  ShieldCheck,
  Clock,
  Sparkles,
  Ticket as TicketIcon,
} from 'lucide-react';
import {
  playSuccessSound,
  playDuplicateSound,
  playErrorSound,
  getSoundMuted,
  setSoundMuted,
} from '../../utils/audioFeedback';
import { ValidationOutcome } from '../../utils/ticketValidation';

export const QRScannerView: React.FC = () => {
  const { recordCheckIn, tickets, checkIns } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');
  const [permissionError, setPermissionError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isMuted, setIsMuted] = useState(getSoundMuted());

  // Current scan outcome modal
  const [scanResult, setScanResult] = useState<ValidationOutcome | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual code entry fallback
  const [manualCode, setManualCode] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Demo QR sample cards
  const [sampleQRCodes, setSampleQRCodes] = useState<Array<{ id: string; name: string; tier: string; dataUrl: string }>>([]);

  // Generate QR image data URLs for quick on-screen demo verification
  useEffect(() => {
    async function generateSampleQRs() {
      const samples: Array<{ id: string; name: string; tier: string; dataUrl: string }> = [];
      const testTickets = tickets.slice(0, 4);
      for (const t of testTickets) {
        try {
          const url = await QRCode.toDataURL(t.qrPayload, {
            width: 140,
            margin: 1,
            color: { dark: '#0B1F36', light: '#FFFFFF' },
          });
          samples.push({ id: t.id, name: t.attendeeName, tier: t.ticketTier, dataUrl: url });
        } catch (e) {
          console.warn('QR gen error:', e);
        }
      }
      setSampleQRCodes(samples);
    }
    generateSampleQRs();
  }, [tickets]);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setTorchEnabled(false);
  }, []);

  const handleScanOutcome = useCallback(
    (rawPayload: string, method: 'camera_qr' | 'manual_code') => {
      setIsProcessing(true);
      const outcome = recordCheckIn(rawPayload, method);
      setScanResult(outcome);

      if (outcome.status === 'success') {
        playSuccessSound();
      } else if (outcome.status === 'duplicate') {
        playDuplicateSound();
      } else {
        playErrorSound();
      }

      // Resume scanning after 2.8 seconds or when modal dismissed
      setTimeout(() => {
        setIsProcessing(false);
      }, 2500);
    },
    [recordCheckIn]
  );

  // Core real-time QR detection loop
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (!isProcessing) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleScanOutcome(code.data, 'camera_qr');
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleScanOutcome, isProcessing]);

  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setPermissionError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission('unsupported');
      setPermissionError('This browser or device does not support Web Camera API.');
      return;
    }

    try {
      setCameraPermission('prompt');
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
        setHasTorch(Boolean(capabilities?.torch));
      }

      setCameraPermission('granted');
      setIsScanning(true);
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err: unknown) {
      const errName = (err as Error)?.name;
      const errMsg = (err as Error)?.message || 'Failed to acquire video stream.';
      console.warn('Camera access rejected:', err);
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setPermissionError('Camera permission was denied. Please grant permission in your browser URL bar.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraPermission('unsupported');
        setPermissionError('No video input hardware found on this machine.');
      } else {
        setCameraPermission('denied');
        setPermissionError(`Camera initialization error: ${errMsg}`);
      }
      setIsScanning(false);
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const next = !torchEnabled;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (track as any).applyConstraints({
          advanced: [{ torch: next }],
        });
        setTorchEnabled(next);
      } catch (e) {
        console.warn('Torch constraint not supported:', e);
      }
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isScanning) {
      startCamera(nextMode);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setManualSubmitting(true);
    handleScanOutcome(manualCode.trim(), 'manual_code');
    setManualCode('');
    setManualSubmitting(false);
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#142B4A] text-white">
              <Camera className="w-5 h-5 text-[#E8DDC8]" />
            </span>
            <h1 className="text-2xl font-bold text-[#0B1F36]">Real Camera QR Scanner</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Audible Feedback Enabled
            </span>
          </div>
          <p className="text-sm text-[#64748B]">
            Detects real QR ticket codes through the device camera, verifies attendee status, detects duplicate scans, and plays audio tones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              setSoundMuted(next);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-[#F6F2EA] text-[#142B4A] border-[#E8DDC8]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Camera Viewport Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A]">
                Live Camera Feed
              </span>
              <div className="flex items-center gap-2">
                {isScanning && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Scanning Active
                  </span>
                )}
                {facingMode === 'environment' ? (
                  <span className="text-xs text-[#64748B] bg-[#F6F2EA] px-2 py-0.5 rounded-md">
                    Rear Lens
                  </span>
                ) : (
                  <span className="text-xs text-[#64748B] bg-[#F6F2EA] px-2 py-0.5 rounded-md">
                    Front Lens
                  </span>
                )}
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className="relative aspect-4/3 w-full bg-[#0B1F36] rounded-2xl overflow-hidden border-2 border-[#142B4A] flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay Reticle */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Darkened vignette surround */}
                  <div className="relative w-64 h-64 border-2 border-emerald-400 rounded-3xl overflow-hidden shadow-[0_0_0_9999px_rgba(11,31,54,0.45)]">
                    {/* Animated scanning laser line */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2s_infinite]"></div>
                    {/* Corner Guides */}
                    <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                  </div>
                  <span className="absolute bottom-4 text-xs font-semibold text-white/90 bg-[#0B1F36]/80 px-3 py-1 rounded-full border border-white/20">
                    Align QR ticket inside the frame
                  </span>
                </div>
              )}

              {/* Camera Off / Permission Idle State */}
              {!isScanning && (
                <div className="text-center p-6 text-white max-w-sm">
                  {cameraPermission === 'denied' ? (
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                        <CameraOff className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Camera Permission Denied</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {permissionError || 'Please click the camera lock icon in your browser address bar to allow camera access.'}
                      </p>
                    </div>
                  ) : cameraPermission === 'unsupported' ? (
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Camera Hardware Unavailable</h3>
                      <p className="text-xs text-slate-300">
                        {permissionError || 'No video camera detected. You can use the manual code validator below to test check-in operations.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[#142B4A] text-[#E8DDC8] flex items-center justify-center border border-[#E8DDC8]/30">
                        <Camera className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Device Camera Idle</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Click &ldquo;Start Camera Scanner&rdquo; to activate your real device camera. Privacy ensured: video streams locally in-memory and is never uploaded.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scanner Controls Toolbar */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!isScanning ? (
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#E8DDC8]" />
                  <span>Start Camera Scanner</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Scanner &amp; Release Camera</span>
                </button>
              )}

              <button
                type="button"
                onClick={flipCamera}
                disabled={!isScanning}
                className="py-3 px-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA] hover:bg-[#E8DDC8]/60 text-[#142B4A] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                title="Switch Front / Rear Camera"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Flip Lens</span>
              </button>

              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  disabled={!isScanning}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    torchEnabled
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'border-[#E8DDC8] bg-[#F6F2EA] text-[#142B4A]'
                  }`}
                  title="Toggle Flashlight / Torch"
                >
                  <Flashlight className="w-4 h-4" />
                  <span className="hidden sm:inline">Torch</span>
                </button>
              )}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-[#E8DDC8] flex items-center justify-between text-[11px] text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Camera Privacy: Local memory barcode decoding only. Zero facial tracking.</span>
            </div>
          </div>
        </div>

        {/* Scan Result & Manual Fallback Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result Alert Card */}
          <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] block mb-3">
              Validation Result
            </span>

            {scanResult ? (
              <div
                className={`p-5 rounded-2xl border animate-in zoom-in-95 duration-200 ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : scanResult.status === 'duplicate'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.status === 'success' && (
                    <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {scanResult.status === 'duplicate' && (
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  {scanResult.status === 'invalid' && (
                    <XCircle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 ${
                        scanResult.status === 'success'
                          ? 'bg-emerald-600 text-white'
                          : scanResult.status === 'duplicate'
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {scanResult.status === 'success'
                        ? 'FIRST CHECK-IN VALID'
                        : scanResult.status === 'duplicate'
                        ? 'DUPLICATE SCAN DETECTED'
                        : 'INVALID TICKET REJECTED'}
                    </span>

                    <h4 className="font-bold text-base leading-tight mt-1">
                      {scanResult.ticket?.attendeeName || 'Unknown Badge'}
                    </h4>
                    <p className="text-xs font-medium mt-1 leading-relaxed opacity-90">
                      {scanResult.message}
                    </p>

                    {scanResult.ticket && (
                      <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="opacity-75">Ticket ID:</span>
                          <span className="font-mono font-bold">{scanResult.ticket.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Tier:</span>
                          <span className="font-bold">{scanResult.ticket.ticketTier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Seat / Zone:</span>
                          <span>{scanResult.ticket.seatZone}</span>
                        </div>
                        {scanResult.previousCheckIn && (
                          <div className="flex justify-between text-amber-900 font-bold">
                            <span>Prior Check-in:</span>
                            <span>{scanResult.previousCheckIn}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setScanResult(null)}
                    className="text-xs font-bold underline cursor-pointer"
                  >
                    Dismiss Confirmation
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#F6F2EA]/60 border border-dashed border-[#E8DDC8] text-center text-[#64748B]">
                <TicketIcon className="w-8 h-8 mx-auto mb-2 text-[#142B4A]/40" />
                <p className="text-xs font-semibold text-[#142B4A]">Ready to Scan</p>
                <p className="text-[11px] mt-1 text-[#64748B]">
                  Point camera at an attendee&apos;s digital ticket or paper QR pass to validate.
                </p>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback */}
          <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard className="w-4 h-4 text-[#142B4A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A]">
                Manual Ticket ID Fallback
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-3">
              Clearly separated fallback for damaged phone screens or camera-less terminals.
            </p>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. TCK-10042"
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-xs text-[#172437] font-mono focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
              <button
                type="submit"
                disabled={manualSubmitting || !manualCode.trim()}
                className="py-2 px-4 rounded-xl bg-[#142B4A] hover:bg-[#0B1F36] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Verify Code
              </button>
            </form>
          </div>

          {/* Recent Scans Activity */}
          <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A]">
                Recent Check-In Activity ({checkIns.length})
              </span>
              <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {checkIns.slice(0, 5).map((chk) => (
                <div
                  key={chk.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F6F2EA]/50 border border-[#E8DDC8]/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        chk.status === 'success'
                          ? 'bg-emerald-500'
                          : chk.status === 'duplicate_blocked'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    ></span>
                    <div>
                      <span className="font-bold text-[#142B4A] block leading-tight">
                        {chk.attendeeName}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">
                        {chk.ticketId} &bull; {chk.ticketTier}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#64748B] font-mono">{chk.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Ticket Samples for Easy Camera Testing */}
      <div className="bg-white rounded-2xl border border-[#E8DDC8] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#142B4A]" />
              <h3 className="font-bold text-sm text-[#0B1F36]">
                Demo Tickets for Live Camera Verification
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Point your physical device camera at these QR codes (or open from another device) to test real optical decoding, sound, and duplicate scan blocking.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#E8DDC8]/70 text-[#142B4A]">
            Demo Testing Suite
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sampleQRCodes.map((s) => {
            const ticketObj = tickets.find((t) => t.id === s.id);
            const isAlreadyCheckedIn = ticketObj?.status === 'checked_in';

            return (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-[#E8DDC8] bg-[#F6F2EA]/40 text-center flex flex-col items-center justify-between"
              >
                <div className="bg-white p-2 rounded-xl shadow-xs border border-[#E8DDC8]/80 mb-2">
                  <img src={s.dataUrl} alt={`QR for ${s.name}`} className="w-28 h-28 mx-auto" />
                </div>
                <div className="w-full">
                  <span className="font-bold text-xs text-[#0B1F36] block truncate">{s.name}</span>
                  <span className="text-[10px] text-[#64748B] block font-mono">{s.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8DDC8]/60 text-[#142B4A] font-semibold inline-block mt-1">
                    {s.tier}
                  </span>
                </div>

                <div className="mt-3 w-full">
                  {isAlreadyCheckedIn ? (
                    <span className="w-full py-1 text-[11px] font-bold text-amber-800 bg-amber-100 rounded-lg block">
                      Already Checked In
                    </span>
                  ) : (
                    <span className="w-full py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-lg block">
                      Ready for Scan
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleScanOutcome(ticketObj?.qrPayload || s.id, 'kiosk_scan')}
                    className="mt-1.5 w-full py-1 text-[10px] font-bold text-[#142B4A] hover:bg-white rounded-md border border-[#E8DDC8] cursor-pointer"
                  >
                    Simulate Kiosk Scan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
