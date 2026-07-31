import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptConfig } from './components/PromptConfig';
import { SettingsPanel } from './components/SettingsPanel';
import { VideoPlayer } from './components/VideoPlayer';
import { Gallery } from './components/Gallery';
import {
  AspectRatio,
  Resolution,
  ImageUploadData,
  VideoHistoryItem,
} from './types';
import { Sparkles, Film, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Input states
  const [image, setImage] = useState<ImageUploadData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');

  // Generation & playback states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<VideoHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('veo_video_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('veo_video_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  const isAr = lang === 'ar';

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle Language
  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Automatically sync image orientation to aspect ratio option
  const handleImageChange = (newImage: ImageUploadData | null) => {
    setImage(newImage);
    if (newImage && newImage.width && newImage.height) {
      if (newImage.height > newImage.width) {
        setAspectRatio('9:16');
      } else {
        setAspectRatio('16:9');
      }
    }
  };

  // Launch Veo Video Generation
  const handleGenerate = async () => {
    if (!image && (!prompt || prompt.trim().length === 0)) {
      setError(
        isAr
          ? 'يرجى رفع صورة أو كتابة وصف المشهد على الأقل لبدء التوليد.'
          : 'Please upload a photo or enter a motion prompt to start generation.'
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    setStatusMessage(isAr ? 'بدء الاتصال بخادم Veo 3.1...' : 'Initiating Veo 3.1 server connection...');
    setActiveVideoUrl(null);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image: image
            ? {
                base64Bytes: image.base64Bytes,
                mimeType: image.mimeType,
              }
            : null,
          aspectRatio,
          resolution,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to start video generation.');
      }

      const opName = data.operationName;
      setCurrentOperation(opName);
      setStatusMessage(isAr ? 'تم بدء عملية التوليد. جاري التحقق من الاكتما ل...' : 'Operation created. Polling Veo status...');

      // Start Polling Loop
      pollStatus(opName);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred during video generation.');
      setIsLoading(false);
    }
  };

  // Poll video status until done
  const pollStatus = async (opName: string) => {
    let attempts = 0;
    const maxAttempts = 120; // max 6 minutes polling

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const statusData = await res.json();

        if (statusData.error) {
          clearInterval(interval);
          setError(statusData.error);
          setIsLoading(false);
          return;
        }

        if (statusData.done) {
          clearInterval(interval);
          const videoStreamUrl = `/api/video-stream?op=${encodeURIComponent(opName)}`;
          setActiveVideoUrl(videoStreamUrl);
          setIsLoading(false);

          // Add to History
          const newItem: VideoHistoryItem = {
            id: Date.now().toString(),
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            prompt: prompt || (isAr ? 'تحريك صورة' : 'Photo animation'),
            imageThumbnail: image?.dataUrl,
            videoUrl: videoStreamUrl,
            aspectRatio,
            resolution,
            operationName: opName,
          };

          setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
        } else {
          // Update status message dynamically based on attempts
          if (attempts % 3 === 0) {
            const stepsAr = [
              'جاري تركيب ناقلات الحركة بالإطارات...',
              'تحسين جودة الإضاءة والظلال برندر 60fps...',
              'معالجة تباين الألوان وعمق المشهد...',
              'اللمسات الأخيرة على ملف الفيديو...',
            ];
            const stepsEn = [
              'Synthesizing temporal frame motion...',
              'Enhancing lighting and shadows at 60fps...',
              'Applying color balance and scene depth...',
              'Finalizing MP4 video rendering...',
            ];
            const nextIdx = Math.floor(attempts / 3) % stepsAr.length;
            setStatusMessage(isAr ? stepsAr[nextIdx] : stepsEn[nextIdx]);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError(
            isAr
              ? 'استغرقت العملية وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى.'
              : 'Operation timed out. Please try again.'
          );
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  const handleSelectHistoryVideo = (item: VideoHistoryItem) => {
    setActiveVideoUrl(item.videoUrl);
    setCurrentOperation(item.operationName);
    setAspectRatio(item.aspectRatio);
    setResolution(item.resolution);
    setPrompt(item.prompt);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('veo_video_history');
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`min-h-screen font-sans transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Top Bar */}
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Banner Notice */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900 border border-indigo-500/30 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {isAr ? 'تحويل الصور إلى فيديوهات سينمائية بواسطة نموذج Veo 3.1' : 'Animate Static Photos into Cinematic Videos with Veo 3.1'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {isAr
                  ? 'قم برفع أي صورة، اختر أبعاد المشهد (16:9 أو 9:16)، وأضف وصف الحركة للحصول على فيديو فائق الجودة بسرعة عالية.'
                  : 'Upload any photo, select landscape (16:9) or portrait (9:16) aspect ratio, and describe the camera motion for instant AI video generation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              veo-3.1-fast-generate-preview
            </span>
          </div>
        </div>

        {/* Main Grid: Inputs vs Output Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (7 cols on desktop) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-6 shadow-xl">
              {/* Step 1: Image Upload */}
              <ImageUploader
                image={image}
                onImageChange={handleImageChange}
                lang={lang}
                onSelectSamplePrompt={(samplePrompt) => setPrompt(samplePrompt)}
              />

              {/* Step 2: Prompt Configuration */}
              <PromptConfig
                prompt={prompt}
                onPromptChange={setPrompt}
                lang={lang}
              />

              {/* Step 3: Aspect Ratio & Specs */}
              <SettingsPanel
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                resolution={resolution}
                onResolutionChange={setResolution}
                lang={lang}
              />

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{isAr ? 'جاري توليد الفيديو بواسطة Veo 3.1...' : 'Generating Veo 3.1 Video...'}</span>
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5" />
                    <span>{isAr ? 'توليد الفيديو الآن (Generate Video)' : 'Generate Video Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Preview Stage (6 cols on desktop) */}
          <div className="lg:col-span-6">
            <div className="sticky top-20 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
              <VideoPlayer
                videoUrl={activeVideoUrl}
                isLoading={isLoading}
                statusMessage={statusMessage}
                error={error}
                onRetry={handleGenerate}
                aspectRatio={aspectRatio}
                resolution={resolution}
                prompt={prompt}
                lang={lang}
                operationName={currentOperation}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: History Gallery */}
        <Gallery
          history={history}
          onSelectVideo={handleSelectHistoryVideo}
          onClearHistory={handleClearHistory}
          lang={lang}
        />
      </main>
    </div>
  );
}

