
import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import Spinner from '../components/Spinner';
import CodeBlock from '../components/CodeBlock';

const TextGenerationView: React.FC = () => {
  const [prompt, setPrompt] = useState('Write a short story about a robot who discovers music.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const response = await generateText(prompt);
      setResult(response.text);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const codeSnippet = `
const API_URL = "https://api.gemini-machine.com/v1/generate/text";
// Get your key from the Gemini API Machine dashboard
const API_KEY = "YOUR_API_MACHINE_KEY";

async function run() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      prompt: \`${prompt.replace(/`/g, '\\`')}\`
    })
  });

  const data = await response.json();
  console.log(data.text);
}

run();
  `.trim();


  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-content-200 mb-2">
          Enter your prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Write a poem about the moon"
          className="w-full h-32 p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : 'Generate Text'}
      </button>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      {result && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Generated Text:</h3>
          <div className="p-4 bg-base-200 rounded-md whitespace-pre-wrap">{result}</div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Use your unique API Key provided by our platform to make requests to our simplified endpoint.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default TextGenerationView;
