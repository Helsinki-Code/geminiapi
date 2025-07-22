import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MusicSession } from '../types';
import CodeBlock from '../components/CodeBlock';
import Spinner from '../components/Spinner';

// Helper to convert 16-bit PCM to 32-bit Float
function pcm16ToFloat32(p_pcm) {
  const l_pcm = new Int16Array(p_pcm.buffer, p_pcm.byteOffset, p_pcm.byteLength / 2);
  const l_f32 = new Float32Array(l_pcm.length);
  for (let i = 0; i < l_pcm.length; i++) {
    l_f32[i] = l_pcm[i] / 32767;
  }
  return l_f32;
}

const MusicGenerationView: React.FC = () => {
  const [prompt, setPrompt] = useState('minimal techno');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bpm, setBpm] = useState(120);
  const [density, setDensity] = useState(0.5);
  const [brightness, setBrightness] = useState(0.5);

  const musicAiRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<MusicSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const connect = useCallback(async () => {
    if (sessionRef.current) return;

    setIsLoading(true);
    setError('');

    try {
        if (!musicAiRef.current) {
            musicAiRef.current = new GoogleGenAI({ 
                apiKey: process.env.API_KEY, 
                apiVersion: 'v1alpha' 
            });
        }

        audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        nextPlayTimeRef.current = audioContextRef.current.currentTime;
        
        const session: MusicSession = await (musicAiRef.current as any).live.music.connect({
            model: 'models/lyria-realtime-exp',
            callbacks: {
              onMessage: (message: any) => {
                if (!audioContextRef.current || message.audioChunk?.samples === undefined) return;
                
                const pcmData = pcm16ToFloat32(message.audioChunk.samples);
                const audioBuffer = audioContextRef.current.createBuffer(2, pcmData.length / 2, 48000);
                audioBuffer.copyToChannel(pcmData.filter((_, i) => i % 2 === 0), 0);
                audioBuffer.copyToChannel(pcmData.filter((_, i) => i % 2 !== 0), 1);
      
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                
                const playTime = Math.max(audioContextRef.current.currentTime, nextPlayTimeRef.current);
                source.start(playTime);
                nextPlayTimeRef.current = playTime + audioBuffer.duration;
              },
              onError: (error: Error) => {
                setError(`Session error: ${error.message}`);
                console.error('music session error:', error);
                setIsPlaying(false);
                setIsLoading(false);
              },
              onClose: () => {
                console.log('Lyria RealTime stream closed.');
                setIsPlaying(false);
                sessionRef.current = null;
              }
            }
        });

        sessionRef.current = session;
        await sessionRef.current.setMusicGenerationConfig({
            musicGenerationConfig: { bpm, density, brightness, guidance: 4.0 },
        });
        await sessionRef.current.setWeightedPrompts({ weightedPrompts: [{ text: prompt, weight: 1.0 }] });
        
    } catch (e: any) {
        setError(`Failed to connect: ${e.message}`);
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [bpm, density, brightness, prompt]);

  const handlePlayPause = async () => {
    setError('');
    if (!sessionRef.current) {
        await connect();
    }
    
    if (!sessionRef.current) {
      setError("Could not establish a session.");
      return;
    }

    if (isPlaying) {
      await sessionRef.current.pause();
      setIsPlaying(false);
    } else {
      await sessionRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = async () => {
    if (sessionRef.current) {
      await sessionRef.current.stop();
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
    nextPlayTimeRef.current = 0;
  };
  
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      handleStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateConfig = useCallback(async () => {
    if (sessionRef.current && isPlaying) {
      await sessionRef.current.setMusicGenerationConfig({
        musicGenerationConfig: { bpm, density, brightness },
      });
      // BPM change requires context reset for a hard transition
      await sessionRef.current.reset_context();
    }
  }, [bpm, density, brightness, isPlaying]);

  const updatePrompt = useCallback(async () => {
    if (sessionRef.current && isPlaying) {
        await sessionRef.current.setWeightedPrompts({
            weightedPrompts: [{ text: prompt, weight: 1.0 }]
        });
    }
  }, [prompt, isPlaying]);
  
  const codeSnippet = `
// This feature uses a WebSocket connection via the Gemini API
// See the full component code for implementation details using @google/genai
  `.trim();

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-content-200 mb-2">
          Describe the music you want to create (e.g., genre, mood, instruments)
        </label>
        <div className="flex gap-2">
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Funky bassline with a groovy beat"
              className="flex-grow p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              disabled={isLoading || isPlaying}
            />
            <button onClick={updatePrompt} disabled={!isPlaying || isLoading} className="px-4 py-2 bg-brand-secondary hover:bg-brand-primary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">Update</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label htmlFor="bpm" className="block text-sm font-medium">BPM: {bpm}</label>
            <input type="range" id="bpm" min="60" max="200" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} onMouseUp={updateConfig} className="w-full" />
        </div>
        <div>
            <label htmlFor="density" className="block text-sm font-medium">Density: {density}</label>
            <input type="range" id="density" min="0" max="1" step="0.1" value={density} onChange={(e) => setDensity(Number(e.target.value))} onMouseUp={updateConfig} className="w-full" />
        </div>
        <div>
            <label htmlFor="brightness" className="block text-sm font-medium">Brightness: {brightness}</label>
            <input type="range" id="brightness" min="0" max="1" step="0.1" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} onMouseUp={updateConfig} className="w-full" />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePlayPause}
          disabled={isLoading || !prompt}
          className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors w-28"
        >
          {isLoading ? <Spinner /> : (isPlaying ? 'Pause' : 'Play')}
        </button>
        <button
          onClick={handleStop}
          disabled={!sessionRef.current}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors w-28"
        >
          Stop
        </button>
      </div>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Music generation with Lyria is an experimental feature that uses a persistent WebSocket connection for real-time interaction. The logic is handled within this component rather than a simple REST endpoint.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default MusicGenerationView;
