import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import Spinner from '../components/Spinner';
import CodeBlock from '../components/CodeBlock';

const YoutubeAnalysisView: React.FC = () => {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=your_video_id');
  const [task, setTask] = useState('Summarize this video and list its key topics.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!url || !task) {
      setError('URL and Task cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      // In a real app, the backend would get the video transcript.
      // Here, we send the URL and task to the model and let it infer.
      const prompt = `I am providing a YouTube URL: "${url}". Please perform the following task based on the likely content/transcript of this video: "${task}".`;
      const response = await generateText(prompt);
      setResult(response.text);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const codeSnippet = `
const API_URL = "https://api.gemini-machine.com/v1/analyze/youtube";
const API_KEY = "YOUR_API_MACHINE_KEY"; // Get from your dashboard

// Our backend retrieves the video transcript and passes it to the model.
async function run() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      url: "${url.replace(/"/g, '\\"')}",
      task: \`${task.replace(/`/g, '\\`')}\`
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
        <label htmlFor="url" className="block text-sm font-medium text-content-200 mb-2">
          YouTube Video URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          disabled={isLoading}
        />
      </div>

       <div>
        <label htmlFor="task" className="block text-sm font-medium text-content-200 mb-2">
          Task
        </label>
        <textarea
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Summarize this video"
          className="w-full h-24 p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          disabled={isLoading}
        />
      </div>


      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : 'Analyze Video'}
      </button>

      {error && <div className="p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-md">{error}</div>}
      
      {result && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Analysis Result:</h3>
          <div className="p-4 bg-base-200 rounded-md whitespace-pre-wrap">{result}</div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-white mt-8 mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Our service processes the YouTube video (e.g., by fetching its transcript) and runs your requested task on the content.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default YoutubeAnalysisView;
