
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden my-4 relative">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
        <span className="text-xs font-sans text-gray-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 text-xs rounded-md transition-colors"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
