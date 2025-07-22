
import React, { useState, useEffect, useRef } from 'react';
import { sendMessageInChat, startChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import Spinner from '../components/Spinner';
import CodeBlock from '../components/CodeBlock';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
    setMessages([{role: 'model', text: 'Hello! How can I help you today?'}]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
        const stream = await sendMessageInChat(input);
        
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });
        }

    } catch (e: any) {
        setError(`An error occurred: ${e.message}`);
        setMessages(prev => prev.slice(0, -1)); // Remove the empty model message on error
    } finally {
        setIsLoading(false);
    }
  };

  const codeSnippet = `
const API_URL = "https://api.gemini-machine.com/v1/chat";
const API_KEY = "YOUR_API_MACHINE_KEY"; // Get from your dashboard

// Example of a stateful chat session using our REST API
async function run() {
  // 1. Start a new conversation to get a unique ID
  const createRes = await fetch(\`\${API_URL}/conversations\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${API_KEY}\` }
  });
  const { conversationId } = await createRes.json();
  console.log('Started new conversation:', conversationId);

  // 2. Send a message to that conversation
  const messageRes = await fetch(\`\${API_URL}/conversations/\${conversationId}/messages\`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({ message: "Hello there!" })
  });
  const { text } = await messageRes.json();
  console.log('Model says:', text);

  // 3. Send another message to continue the conversation
  //...
}

run();
  `.trim();

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-150px)]">
      <div className="flex-1 overflow-y-auto p-4 bg-base-200/50 rounded-lg space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {isLoading && msg.role === 'model' && index === messages.length -1 && <div className="inline-block w-2 h-4 bg-white ml-1 animate-ping"></div>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        {error && <div className="p-2 mb-2 bg-red-900/50 text-red-200 text-sm border border-red-700 rounded-md">{error}</div>}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-base-200 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
            {isLoading ? <Spinner /> : 'Send'}
          </button>
        </div>
      </div>
      
       <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-2">API Machine Endpoint</h3>
        <p className="text-sm text-content-200 mb-4">Our chat API is stateful. Start a conversation to get a unique ID, then send messages to that ID to maintain context.</p>
        <CodeBlock code={codeSnippet} language="javascript" />
      </div>
    </div>
  );
};

export default ChatView;
