import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import { generateVideo } from '../services/geminiService';
import Spinner from '../components/Spinner';

const aspectRatios = ["16:9", "9:16"];

const VideoGenerationView: React.FC = () => {
  const [prompt, setPrompt] = useState('A cinematic shot of a majestic lion in the savannah, 16:9 aspect ratio.');
  const [negativePrompt, setNegativePrompt] = useState('cartoon, drawing, low quality');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setVideoUrl('');
    setProgressMessage('');
    setProgressPercent(0);
    
    try {
        const generator = generateVideo(prompt, aspectRatio, negativePrompt);
        for await (const result of generator) {
            if (result.status === 'error') {
                throw new Error(result.error);
            }
            setProgressMessage(result.status);
            setProgressPercent(result.progress || 0);
            if (result.status === 'done' && result.url) {
                setVideoUrl(result.url);
            }
        }
    } catch (e: any) {
        setError(`An error occurred: ${e.message}`);
    } finally {
        setIsLoading(false);
        setProgressMessage('');
    }
  };

  const codeSnippet = `
// NOTE: Video generation is a long-running operation.
// Our API provides a job ID to poll for completion.
// The code below simplifies this into a single async call for demonstration.
const API_URL = "https://api.gemini-machine.com/v1/generate/video";
const API_KEY = "YOUR_API_MACHINE_KEY"; // Get from your dashboard

async function run() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      prompt: \`${prompt.replace(/`/g, '\\`')}\`,
      negativePrompt: \`${negativePrompt.replace(/`/g, '\\`')}\`,
      aspectRatio: "${aspectRatio}"
    })
  });

  const data = await response.json();
  // data.videoUrl contains a URL to the generated MP4 video
  console.log(data.videoUrl);
}

run();
  `.trim();

  return (
    <div className="space-y-6">
        <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-content-200 mb-2">
                Video Prompt
            </label>
            <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A drone shot flying over a futuristic city"
                className="w-full h-24 p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                disabled={isLoading}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <label htmlFor="negativePrompt" className="block text-sm font-medium text-content-200 mb-2">
                    Negative Prompt (what to avoid)
                </label>
                <input
                    id="negativePrompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="e.g., blurry, low quality, text"
                    className="w-full p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                    disabled={isLoading}
                />
            </div>
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-content-200 mb-2">
                Aspect Ratio
              </label>
              <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                disabled={isLoading}
              >
                {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
              </select>
            </div>
        </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating...' : 'Generate Video'}
      </button>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      <div className="mt-6">
        {isLoading && (
            <div className="w-full bg-base-200 rounded-full h-4">
                <div 
                    className="bg-brand-primary h-4 rounded-full transition-all duration-500" 
                    style={{width: `${progressPercent}%`}}>
                </div>
                <p className="text-center text-sm mt-2 text-content-200">{progressMessage}</p>
            </div>
        )}
        {videoUrl && (
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Generated Video:</h3>
                <video src={videoUrl} controls autoPlay loop className="max-w-full md:max-w-lg mx-auto rounded-lg shadow-lg" />
            </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Generate a short video from a text prompt. This is an asynchronous operation.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default VideoGenerationView;
