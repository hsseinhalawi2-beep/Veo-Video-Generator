import React from 'react';
import { Sparkles, Wand2, Wind, Camera, Zap, Sun, Video, Trash2 } from 'lucide-react';
import { PROMPT_PRESETS } from '../data/presets';
import { PromptPreset } from '../types';

interface PromptConfigProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  lang: 'en' | 'ar';
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Wind: <Wind className="w-3.5 h-3.5" />,
  Camera: <Camera className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Sun: <Sun className="w-3.5 h-3.5" />,
  Video: <Video className="w-3.5 h-3.5" />,
};

export const PromptConfig: React.FC<PromptConfigProps> = ({
  prompt,
  onPromptChange,
  lang,
}) => {
  const isAr = lang === 'ar';

  const addModifier = (modifierEn: string, modifierAr: string) => {
    const textToAdd = isAr ? modifierAr : modifierEn;
    if (!prompt) {
      onPromptChange(textToAdd);
    } else {
      onPromptChange(`${prompt}, ${textToAdd}`);
    }
  };

  const handleApplyPreset = (preset: PromptPreset) => {
    onPromptChange(isAr ? preset.promptAr : preset.promptEn);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-200">
          {isAr ? '2. وصف الحركة والمشهد (اختياري/موصى به)' : '2. Motion & Camera Prompt'}
        </label>
        {prompt && (
          <button
            onClick={() => onPromptChange('')}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            {isAr ? 'مسح' : 'Clear'}
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={
            isAr
              ? 'صف الحركة المطلوبة... (مثال: نسيم عليل يحرك الشعر، تقريب كاميرا سينمائي سلس، انعكاسات ضوئية متحركة)'
              : 'Describe the desired motion... (e.g., gentle wind blowing hair, smooth cinematic camera pan forward, soft glowing light rays)'
          }
          rows={3}
          className="w-full rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 text-sm text-slate-100 placeholder-slate-500 resize-none transition-all shadow-inner"
        />
        <div className="absolute bottom-2.5 right-2.5 text-[10px] text-slate-500">
          {prompt.length} / 500
        </div>
      </div>

      {/* Quick Modifier Chips */}
      <div>
        <span className="text-xs text-slate-400 mb-1.5 block font-medium flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-indigo-400" />
          {isAr ? 'إضافات حركة سريعة:' : 'Quick Motion Enhancers:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => addModifier('slow motion 60fps', 'حركة بطيئة سلسة')}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60 transition-all hover:border-indigo-500/50"
          >
            + {isAr ? 'حركة بطيئة' : 'Slow Motion'}
          </button>
          <button
            type="button"
            onClick={() => addModifier('cinematic camera zoom', 'تقريب كاميرا سينمائي')}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60 transition-all hover:border-indigo-500/50"
          >
            + {isAr ? 'تقريب كاميرا' : 'Camera Zoom'}
          </button>
          <button
            type="button"
            onClick={() => addModifier('atmospheric fog & light rays', 'ضباب سينمائي وأشعة ضوء')}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60 transition-all hover:border-indigo-500/50"
          >
            + {isAr ? 'إضاءة سينمائية' : 'Light Rays'}
          </button>
          <button
            type="button"
            onClick={() => addModifier('subtle breeze movement', 'حركة نسيم خفيفة')}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60 transition-all hover:border-indigo-500/50"
          >
            + {isAr ? 'نسيم هادئ' : 'Soft Breeze'}
          </button>
        </div>
      </div>

      {/* Preset Prompts Grid */}
      <div className="pt-1">
        <span className="text-xs text-slate-400 mb-1.5 block font-medium">
          {isAr ? 'قوالب حركة جاهزة:' : 'Preset Motion Templates:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PROMPT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-left border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all group"
            >
              <div className="p-1 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                {ICON_MAP[preset.iconName] || <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <span className="truncate font-medium">
                {isAr ? preset.titleAr : preset.titleEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
