import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import { generateSpeech } from '../services/geminiService';
import Spinner from '../components/Spinner';

const voices = [ "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede", "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat" ];

const SpeechGenerationView: React.FC = () => {
  const [text, setText] = useState('To be, or not to be, that is the question.');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!text) {
      setError('Text cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAudioUrl('');
    try {
      const url = await generateSpeech(text, selectedVoice);
      setAudioUrl(url);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const codeSnippet = `
const API_URL = "https://api.gemini-machine.com/v1/generate/speech";
const API_KEY = "YOUR_API_MACHINE_KEY"; // Get from your dashboard

async function run() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      text: \`${text.replace(/`/g, '\\`')}\`,
      voice: "${selectedVoice}"
    })
  });

  const data = await response.json();
  // data.audioUrl contains the base64 encoded audio string
  const audio = new Audio(data.audioUrl);
  audio.play();
}

run();
  `.trim();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="text" className="block text-sm font-medium text-content-200 mb-2">
            Enter text to convert to speech
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., The quick brown fox jumps over the lazy dog."
            className="w-full h-32 p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            disabled={isLoading}
          />
        </div>
        <div>
            <label htmlFor="voice" className="block text-sm font-medium text-content-200 mb-2">
                Voice
            </label>
            <select
                id="voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                disabled={isLoading}
            >
                {voices.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : 'Generate Speech'}
      </button>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      {audioUrl && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Generated Audio:</h3>
          <audio controls src={audioUrl} className="w-full md:w-1/2">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Convert text to speech by providing text and a desired voice.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default SpeechGenerationView;
