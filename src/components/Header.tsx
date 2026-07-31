import React from 'react';
import { Film, Sparkles, Moon, Sun, Globe, Key } from 'lucide-react';

interface HeaderProps {
  lang: 'en' | 'ar';
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 dark:bg-slate-950/80 border-b border-slate-800 text-white px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & App Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {isAr ? 'فيو أنيميشن ستوديو' : 'Veo Video Studio'}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                veo-3.1-fast
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {isAr ? 'تحويل الصور إلى فيديو ثلاثي الأبعاد بالذكاء الاصطناعي' : 'Animate static photos into cinematic videos'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Key Info Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/40 text-xs text-slate-400 border border-slate-800">
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>GEMINI_API_KEY</span>
          </div>
        </div>
      </div>
    </header>
  );
};
