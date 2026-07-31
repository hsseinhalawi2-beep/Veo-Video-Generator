import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Sparkles, Check } from 'lucide-react';
import { ImageUploadData, SampleImage } from '../types';
import { SAMPLE_IMAGES } from '../data/presets';

interface ImageUploaderProps {
  image: ImageUploadData | null;
  onImageChange: (image: ImageUploadData | null) => void;
  lang: 'en' | 'ar';
  onSelectSamplePrompt?: (prompt: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  image,
  onImageChange,
  lang,
  onSelectSamplePrompt,
}) => {
  const isAr = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const base64Bytes = dataUrl.split(',')[1] || '';
        onImageChange({
          dataUrl,
          mimeType: file.type || 'image/jpeg',
          base64Bytes,
          name: file.name,
          width: img.width,
          height: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleImage) => {
    setLoadingSample(sample.id);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64Bytes = dataUrl.split(',')[1] || '';
        onImageChange({
          dataUrl,
          mimeType: blob.type || 'image/jpeg',
          base64Bytes,
          name: sample.nameEn,
          width: sample.aspectRatio === '16:9' ? 1280 : 720,
          height: sample.aspectRatio === '16:9' ? 720 : 1280,
        });
        if (onSelectSamplePrompt) {
          onSelectSamplePrompt(isAr ? sample.recommendedPromptAr : sample.recommendedPromptEn);
        }
        setLoadingSample(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setLoadingSample(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-200">
          {isAr ? '1. اختر أو ارفع الصورة (مطلوب للتحريك)' : '1. Upload Photo to Animate'}
        </label>
        {image && (
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {isAr ? 'تم تحميل الصورة' : 'Photo Loaded'}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {image ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900/90 p-2 shadow-lg">
          <div className="relative aspect-video max-h-64 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src={image.dataUrl}
              alt={image.name}
              className="max-h-full max-w-full object-contain rounded-md"
            />
            <button
              onClick={() => onImageChange(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500 text-slate-300 hover:text-white transition-all shadow-md"
              title={isAr ? 'حذف الصورة' : 'Remove Image'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 px-2 pb-1 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate max-w-[200px] font-medium text-slate-300">
              {image.name}
            </span>
            {image.width && image.height && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                {image.width} × {image.height}px
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            {isAr ? 'انقر لرفع صورة أو اسحبها هنا' : 'Click to upload a photo or drag & drop'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'يدعم PNG, JPG, WEBP (حتى 20 ميجابايت)' : 'Supports PNG, JPG, WEBP'}
          </p>
        </div>
      )}

      {/* Sample Photos Carousel */}
      {!image && (
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'أو تجربة إحدى الصور الجاهزة:' : 'Or try a sample photo:'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                disabled={loadingSample === sample.id}
                className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500/60 bg-slate-900 text-left transition-all hover:scale-[1.02] focus:outline-none"
              >
                <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                  <img
                    src={sample.url}
                    alt={sample.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {loadingSample === sample.id && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="p-1.5 text-[11px] font-medium text-slate-300 group-hover:text-indigo-300 truncate">
                  {isAr ? sample.nameAr : sample.nameEn}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
