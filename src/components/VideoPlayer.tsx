import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  AlertCircle,
  Film,
  Copy,
  Clock,
} from 'lucide-react';
import { AspectRatio, Resolution } from '../types';

interface VideoPlayerProps {
  videoUrl: string | null;
  isLoading: boolean;
  statusMessage?: string;
  error: string | null;
  onRetry?: () => void;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  prompt: string;
  lang: 'en' | 'ar';
  operationName?: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isLoading,
  statusMessage,
  error,
  onRetry,
  aspectRatio,
  resolution,
  prompt,
  lang,
  operationName,
}) => {
  const isAr = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Timer for loading duration
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleDownload = async () => {
    if (!operationName && !videoUrl) return;
    setIsDownloading(true);

    try {
      if (operationName) {
        const response = await fetch('/api/video-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `veo-3.1-animation-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `veo-3.1-animation-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reassuring step text generator
  const getProgressStep = (sec: number) => {
    if (sec < 5) return isAr ? 'تحليل تكوين الصورة وأبعاد الشاشة...' : 'Analyzing photo structure & depth map...';
    if (sec < 15) return isAr ? 'تهيئة نموذج Veo 3.1 وتطبيق اتجاهات الحركة...' : 'Initializing Veo 3.1 neural latent space...';
    if (sec < 30) return isAr ? 'تخليق ناقلات حركة الكاميرا ومحاكاة الفيزياء...' : 'Synthesizing camera motion & physics...';
    if (sec < 55) return isAr ? 'توليد الإطارات عالية الدقة بكسل ببكسل...' : 'Rendering high-definition video frames...';
    return isAr ? 'تجميع وتشفير ملف MP4 النهائي...' : 'Finalizing video stream & encoding MP4...';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-400" />
          <span>{isAr ? 'شاشة العرض المباشرة' : 'Live Preview Stage'}</span>
        </h2>
        {videoUrl && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {aspectRatio}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {resolution}
            </span>
          </div>
        )}
      </div>

      {/* Main Container Stage */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center min-h-[380px] ${
          aspectRatio === '9:16' ? 'max-w-xs mx-auto aspect-[9/16]' : 'w-full aspect-video'
        }`}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            {/* Pulsing Veo Orb */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 animate-spin opacity-75 blur-md" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-indigo-400/50 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Sparkles className="w-7 h-7 animate-pulse" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {isAr ? 'جاري تحريك الصورة بواسطة Veo 3.1...' : 'Generating Veo 3.1 Video...'}
            </h3>

            <p className="text-xs text-indigo-300 font-medium mb-3 animate-fade-in max-w-sm">
              {statusMessage || getProgressStep(elapsedSeconds)}
            </p>

            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>{isAr ? `الزمن المنقضي: ${elapsedSeconds} ثانية` : `Elapsed time: ${elapsedSeconds}s`}</span>
            </div>

            {/* Simulated Progress bar */}
            <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-1000"
                style={{ width: `${Math.min(95, Math.max(5, (elapsedSeconds / 45) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isAr ? 'تستغرق عملية توليد الفيديو العالي الجودة من 20 إلى 40 ثانية' : 'Veo video generation typically takes 20-40 seconds'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-6 text-center max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-red-400 mb-1">
              {isAr ? 'تعذر توليد الفيديو' : 'Video Generation Failed'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
              >
                {isAr ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            )}
          </div>
        )}

        {/* Empty Placeholder State */}
        {!videoUrl && !isLoading && !error && (
          <div className="p-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3 shadow-inner">
              <Film className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              {isAr ? 'المشهد جاهز للتوليد' : 'Ready to Animate'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'اختر صورة واكتب وصف الحركة، ثم انقر على "توليد الفيديو"'
                : 'Upload a photo, enter a motion prompt, and hit "Generate Video" to preview.'}
            </p>
          </div>
        )}

        {/* Active Video Player */}
        {videoUrl && !isLoading && !error && (
          <div className="relative w-full h-full flex items-center justify-center group">
            <video
              ref={videoRef}
              src={videoUrl}
              loop={isLooping}
              playsInline
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              className="max-h-full max-w-full object-contain rounded-xl"
            />

            {/* Custom Overlay Video Controls Bar */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
              {/* Seek Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-indigo-600 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Loop Toggle */}
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                      isLooping ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-slate-900/80 text-slate-400'
                    }`}
                    title={isAr ? 'تكرار مستمر' : 'Loop Video'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Playback Speed Selector */}
                  <select
                    value={playbackRate}
                    onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700 rounded px-1.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2.0x</option>
                  </select>

                  {/* Fullscreen */}
                  <button
                    onClick={handleFullscreen}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar when Video is ready */}
      {videoUrl && !isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isAr ? 'تحميل MP4' : 'Download Video (MP4)'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'مشاركة' : 'Share'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium truncate max-w-xs italic">
            "{prompt || (isAr ? 'تحريك سينمائي تلقائي' : 'Auto motion synthesis')}"
          </div>
        </div>
      )}
    </div>
  );
};
