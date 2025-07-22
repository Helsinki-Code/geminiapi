import React from 'react';
import { NavItem } from './types';
import HomeIcon from './components/icons/HomeIcon';
import TextIcon from './components/icons/TextIcon';
import ImageIcon from './components/icons/ImageIcon';
import SearchIcon from './components/icons/SearchIcon';
import JsonIcon from './components/icons/JsonIcon';
import ChatIcon from './components/icons/ChatIcon';
import VideoIcon from './components/icons/VideoIcon';
import SpeechIcon from './components/icons/SpeechIcon';
import MusicIcon from './components/icons/MusicIcon';
import UrlIcon from './components/icons/UrlIcon';
import YoutubeIcon from './components/icons/YoutubeIcon';
import KeyIcon from './components/icons/KeyIcon';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    title: 'API Machine Hub',
    description: 'Welcome! Select a Gemini capability to explore.',
    icon: <HomeIcon />,
  },
  {
    id: 'text',
    title: 'Text Generation',
    description: 'Generate text from a prompt for creative writing, summarization, and more.',
    icon: <TextIcon />,
  },
  {
    id: 'image',
    title: 'Image Generation',
    description: 'Create stunning images from textual descriptions.',
    icon: <ImageIcon />,
  },
  {
    id: 'video',
    title: 'Video Generation',
    description: 'Generate high-fidelity, 8-second 720p videos from a text prompt using Veo 3.',
    icon: <VideoIcon />,
  },
  {
    id: 'speech',
    title: 'Speech Generation',
    description: 'Transform text input into realistic single-speaker audio using native text-to-speech generation.',
    icon: <SpeechIcon />,
  },
  {
    id: 'music',
    title: 'Music Generation',
    description: 'Interactively create, steer, and perform instrumental music in real-time using the Lyria model.',
    icon: <MusicIcon />,
  },
  {
    id: 'chat',
    title: 'Conversational Chat',
    description: 'Engage in a multi-turn conversation with a stateful chat model.',
    icon: <ChatIcon />,
  },
  {
    id: 'search',
    title: 'Grounded Search',
    description: 'Get answers grounded in Google Search for up-to-date information.',
    icon: <SearchIcon />,
  },
  {
    id: 'json',
    title: 'JSON Output',
    description: 'Receive structured data by defining a JSON schema for the output.',
    icon: <JsonIcon />,
  },
  {
    id: 'url',
    title: 'URL Retriever',
    description: 'Analyze and process content directly from a web page URL.',
    icon: <UrlIcon />,
  },
  {
    id: 'youtube',
    title: 'YouTube Video Analysis',
    description: 'Summarize and analyze content from YouTube videos.',
    icon: <YoutubeIcon />,
  },
  {
    id: 'api_keys',
    title: 'API Keys',
    description: 'Manage your unique API keys to access our platform.',
    icon: <KeyIcon />,
  },
];
