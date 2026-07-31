import React from 'react';
import { AspectRatio, Resolution } from '../types';
import { Monitor, Smartphone, Sliders, Cpu, Check } from 'lucide-react';

interface SettingsPanelProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  resolution: Resolution;
  onResolutionChange: (res: Resolution) => void;
  lang: 'en' | 'ar';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  lang,
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800/80 pb-2.5">
        <Sliders className="w-4 h-4 text-indigo-400" />
        <span>{isAr ? '3. إعدادات نموذج الفيديو (Veo 3.1)' : '3. Model & Video Specs'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aspect Ratio Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {isAr ? 'أبعاد المشهد (Aspect Ratio)' : 'Aspect Ratio'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* 16:9 Landscape */}
            <button
              type="button"
              onClick={() => onAspectRatioChange('16:9')}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="w-6 h-4 border-2 border-current rounded-[2px] flex items-center justify-center">
                <Monitor className="w-2.5 h-2.5" />
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center gap-1">
                  16:9
                  {aspectRatio === '16:9' && <Check className="w-3 h-3 text-indigo-400" />}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isAr ? 'عرضي (شاشة كاملة)' : 'Landscape'}
                </div>
              </div>
            </button>

            {/* 9:16 Portrait */}
            <button
              type="button"
              onClick={() => onAspectRatioChange('9:16')}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="w-4 h-6 border-2 border-current rounded-[2px] flex items-center justify-center">
                <Smartphone className="w-2.5 h-2.5" />
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center gap-1">
                  9:16
                  {aspectRatio === '9:16' && <Check className="w-3 h-3 text-indigo-400" />}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isAr ? 'طولي (ستوري/تيك توك)' : 'Portrait Reel'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Resolution Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {isAr ? 'دقة الفيديو (Resolution)' : 'Resolution'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onResolutionChange('720p')}
              className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                resolution === '720p'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold flex items-center justify-center gap-1">
                720p HD
                {resolution === '720p' && <Check className="w-3 h-3 text-indigo-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAr ? 'توليد أسرع' : 'Fast Preview'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onResolutionChange('1080p')}
              className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                resolution === '1080p'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold flex items-center justify-center gap-1">
                1080p FHD
                {resolution === '1080p' && <Check className="w-3 h-3 text-indigo-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAr ? 'جودة عالية سينمائية' : 'High Quality'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Model Spec Badge */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Model: <strong className="text-slate-200 font-mono">veo-3.1-fast-generate-preview</strong></span>
        </div>
        <span className="text-emerald-400 font-medium">Veo Neural Engine</span>
      </div>
    </div>
  );
};
