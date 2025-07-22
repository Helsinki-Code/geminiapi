import React, { useState, useEffect } from 'react';
import CodeBlock from '../components/CodeBlock';

const generateApiKey = () => `am_live_${[...Array(40)].map(() => Math.random().toString(36)[2]).join('')}`;

const ApiKeysView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const existingKey = localStorage.getItem('apiMachineKey');
    if (existingKey) {
      setApiKey(existingKey);
    } else {
      const newKey = generateApiKey();
      setApiKey(newKey);
      localStorage.setItem('apiMachineKey', newKey);
    }
  }, []);

  const handleCopy = () => {
    if(!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleRegenerate = () => {
    const confirmation = window.confirm(
      'Are you sure you want to generate a new API key? Your old key will be invalidated immediately and cannot be recovered.'
    );
    if (confirmation) {
        const newKey = generateApiKey();
        setApiKey(newKey);
        localStorage.setItem('apiMachineKey', newKey);
        setIsCopied(false);
    }
  };

  const codeSnippet = `
// Example usage in your application
async function callApiMachine() {
  const API_KEY = "${apiKey || 'YOUR_API_MACHINE_KEY'}";
  const API_URL = "https://api.gemini-machine.com/v1/generate/text";

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Use the 'Bearer' scheme for authentication
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      prompt: "Write a short story about a robot."
    })
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const data = await response.json();
  console.log(data.text);
}

callApiMachine();
  `.trim();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">API Key Management</h2>
        <p className="text-content-200 mt-2">
          Your unique API key gives you access to the API Machine endpoints. Remember to keep your key secure and do not expose it in client-side code in a production environment.
        </p>
      </div>

      <div className="bg-base-200 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-white mb-4">Your Secret API Key</h3>
        <div className="flex items-center gap-2 bg-base-100 p-3 rounded-md border border-base-300">
          <span className="font-mono text-content-100 flex-grow truncate">
            {apiKey}
          </span>
          <button
            onClick={handleCopy}
            disabled={!apiKey}
            className="flex-shrink-0 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md text-sm transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="mt-6 border-t border-base-300 pt-6">
           <h4 className="text-md font-semibold text-white">Regenerate Key</h4>
           <p className="text-sm text-content-200 mt-1 mb-4">
            If you believe your key has been compromised, you can generate a new one. Your previous key will be immediately invalidated.
           </p>
            <button
                onClick={handleRegenerate}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-md text-sm transition-colors"
            >
                Generate New Key...
            </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">How to Use Your Key</h3>
        <p className="text-sm text-content-200 mb-4">
          Include your API key in the <code>Authorization</code> header of your API requests using the <code>Bearer</code> token type.
        </p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default ApiKeysView;
