import React from 'react';
import { Play, Download, Trash2, Clock, Monitor, Smartphone, Film } from 'lucide-react';
import { VideoHistoryItem } from '../types';

interface GalleryProps {
  history: VideoHistoryItem[];
  onSelectVideo: (item: VideoHistoryItem) => void;
  onClearHistory: () => void;
  lang: 'en' | 'ar';
}

export const Gallery: React.FC<GalleryProps> = ({
  history,
  onSelectVideo,
  onClearHistory,
  lang,
}) => {
  const isAr = lang === 'ar';

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>{isAr ? 'سجل الفيديوهات المنشأة' : 'Generated Videos History'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
            {history.length}
          </span>
        </h3>

        <button
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'مسح السجل' : 'Clear History'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectVideo(item)}
            className="group cursor-pointer rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-2.5 transition-all hover:scale-[1.01] hover:shadow-lg flex flex-col justify-between"
          >
            <div className="relative aspect-video w-full rounded-lg bg-slate-950 overflow-hidden mb-2 flex items-center justify-center">
              {item.imageThumbnail ? (
                <img
                  src={item.imageThumbnail}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
              ) : (
                <video src={item.videoUrl} className="w-full h-full object-cover opacity-80" />
              )}
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/80 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900/80 text-indigo-300 border border-slate-700">
                  {item.aspectRatio}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900/80 text-slate-300 border border-slate-700">
                  {item.resolution}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-200 font-medium line-clamp-2 mb-1.5">
                "{item.prompt || (isAr ? 'فيديو تحريك صورة' : 'Photo animation')}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{item.createdAt}</span>
                <span className="text-indigo-400 font-medium group-hover:underline">
                  {isAr ? 'عرض وتنزيل ←' : 'Play & Download →'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
