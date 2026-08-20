export interface WordToken {
  word: string;
  start: number;
  end: number;
  speaker: string;
  score?: number;
  highlight?: boolean;
  customColor?: string;
  emoji?: string;
}

export interface BRollClip {
  id: string;
  start_time: number;
  end_time: number;
  duration: number;
  query: string;
  tag: string;
  ken_burns_effect: 'zoom_in' | 'zoom_out' | 'pan_right' | 'pan_left';
  media_url: string;
  opacity?: number;
}

export interface CropKeyframe {
  time: number;
  crop_x: number;
  crop_y: number;
  crop_w: number;
  crop_h: number;
}

export interface Clip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  virality_score: number;
  hook_score: number;
  flow_score: number;
  virality_reason: string;
  broll_keywords: string[];
  suggested_emojis: string[];
  summary: string;
  words: WordToken[];
  brolls: BRollClip[];
  layout: 'auto_track' | 'split_screen' | 'blur_bg' | 'pip';
}

export interface CaptionStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  highlightColor: string;
  outlineColor: string;
  outlineWidth: number;
  uppercase: boolean;
  wordsPerChunk: number;
  animationStyle: 'bounce' | 'pop' | 'glow' | 'karaoke_fill' | 'fade';
  showEmojis: boolean;
}

export interface Project {
  id: string;
  title: string;
  videoUrl: string;
  sourceType: 'youtube' | 'upload' | 'sample';
  duration: number;
  resolution: { width: number; height: number };
  clips: Clip[];
  allWords: WordToken[];
  status: 'idle' | 'processing' | 'ready' | 'error';
}

export type PipelineStage = 
  | 'ingest'
  | 'audio_extract'
  | 'transcribe'
  | 'hook_curate'
  | 'face_track'
  | 'broll_match'
  | 'caption_render'
  | 'completed';
