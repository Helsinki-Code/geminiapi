
import React, { useState } from 'react';
import { generateJson } from '../services/geminiService';
import Spinner from '../components/Spinner';
import CodeBlock from '../components/CodeBlock';

const JsonOutputView: React.FC = () => {
  const [prompt, setPrompt] = useState('Create a short, funny tagline for a new coffee brand called "Rocket Fuel".');
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
      const response = await generateJson(prompt);
      // Pretty-print the JSON
      const parsedJson = JSON.parse(response.text);
      setResult(JSON.stringify(parsedJson, null, 2));
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const codeSnippet = `
const API_URL = "https://api.gemini-machine.com/v1/generate/json";
const API_KEY = "YOUR_API_MACHINE_KEY"; // Get from your dashboard

/*
 This endpoint is pre-configured on our backend to return a JSON object
 with the following schema: { "response": "string" }
*/

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
  console.log(data);
  // Expected output: { response: "Your generated tagline here" }
}

run();
  `.trim();

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-content-200 mb-2">
          Enter your prompt for a structured response
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., List three benefits of exercise"
          className="w-full h-32 p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : 'Generate JSON'}
      </button>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      {result && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Generated JSON:</h3>
          <CodeBlock code={result} language="json" />
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">The following snippet calls our API, which forces the model to return a predictable JSON object that conforms to a pre-set schema on our backend.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default JsonOutputView;
