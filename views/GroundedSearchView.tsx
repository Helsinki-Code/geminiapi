
import React, { useState } from 'react';
import { generateWithGoogleSearch } from '../services/geminiService';
import Spinner from '../components/Spinner';
import CodeBlock from '../components/CodeBlock';
import { GroundingChunk } from '@google/genai';

const GroundedSearchView: React.FC = () => {
  const [prompt, setPrompt] = useState('Who won the most recent F1 world championship?');
  const [result, setResult] = useState('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
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
    setSources([]);
    try {
      const response = await generateWithGoogleSearch(prompt);
      setResult(response.text);
      setSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const codeSnippet = `
const API_URL = "https://api.gemini-machine.com/v1/search";
const API_KEY = "YOUR_API_MACHINE_KEY"; // Get from your dashboard

async function run() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      query: \`${prompt.replace(/`/g, '\\`')}\`
    })
  });

  const data = await response.json();
  console.log('Answer:', data.text);
  console.log('Sources:', data.sources);
}

run();
  `.trim();

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-content-200 mb-2">
          Enter your query for Google Search
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., What are the latest trends in AI?"
          className="w-full p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : 'Search with Google'}
      </button>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      {isLoading && <div className="p-4"><Spinner/></div>}

      {result && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Answer:</h3>
          <div className="p-4 bg-base-200 rounded-md whitespace-pre-wrap">{result}</div>
        </div>
      )}
      
      {sources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mt-4 mb-2">Sources:</h3>
          <ul className="space-y-2 list-disc list-inside">
            {sources.map((source, index) => (
              source.web && (
                <li key={index}>
                    <a 
                        href={source.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:underline"
                    >
                        {source.web.title || source.web.uri}
                    </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Get up-to-date, grounded answers by calling our simple search endpoint.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default GroundedSearchView;
