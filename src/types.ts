export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface ImageUploadData {
  dataUrl: string; // full data:image/png;base64,...
  mimeType: string;
  base64Bytes: string;
  name: string;
  width?: number;
  height?: number;
}

export interface VideoGenerationConfig {
  prompt: string;
  image: ImageUploadData | null;
  aspectRatio: AspectRatio;
  resolution: Resolution;
}

export interface VideoHistoryItem {
  id: string;
  createdAt: string;
  prompt: string;
  imageThumbnail?: string;
  videoUrl: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  operationName: string;
  durationSeconds?: number;
}

export interface PromptPreset {
  id: string;
  titleEn: string;
  titleAr: string;
  promptEn: string;
  promptAr: string;
  category: 'camera' | 'nature' | 'cinematic' | 'portrait' | 'fantasy';
  iconName: string;
}

export interface SampleImage {
  id: string;
  nameEn: string;
  nameAr: string;
  url: string;
  recommendedPromptEn: string;
  recommendedPromptAr: string;
  aspectRatio: AspectRatio;
}
