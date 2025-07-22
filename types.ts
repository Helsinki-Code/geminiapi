import React from 'react';

export type ViewType = 'home' | 'text' | 'image' | 'chat' | 'search' | 'json' | 'video' | 'speech' | 'music' | 'url' | 'youtube' | 'api_keys';

export interface NavItem {
  id: ViewType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MusicSession {
  setWeightedPrompts(config: { weightedPrompts: { text: string; weight: number }[] }): Promise<void>;
  setMusicGenerationConfig(config: { musicGenerationConfig: any }): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  reset_context(): Promise<void>;
  close(): void;
}
