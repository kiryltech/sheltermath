'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Modal } from './ui/Modal';
import { useSimulationStore } from '@/store/useSimulationStore';
import { callGemini } from '@/lib/ai/gemini';
import { generateAnalysisPrompt } from '@/lib/ai/prompt';
import { Bot, Key, Loader2, AlertCircle, Copy, Check, FileText } from 'lucide-react';
import { Checkbox } from './ui/Checkbox';
import { cn } from '@/lib/utils';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveKey, setSaveKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  const { inputs, results } = useSimulationStore();

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setSaveKey(true);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API Key.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');
    setResult('');
    setShowPromptPreview(false);

    if (saveKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
        localStorage.removeItem('gemini_api_key');
    }

    try {
      const prompt = generateAnalysisPrompt(inputs, results);
      const response = await callGemini(apiKey, prompt);
      setResult(response);
      setStatus('success');
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while fetching the analysis.');
      }
      setStatus('error');
    }
  };

  const handleGeneratePrompt = () => {
    const prompt = generateAnalysisPrompt(inputs, results);
    setGeneratedPrompt(prompt);
    setShowPromptPreview(true);
    setError('');
    setStatus('idle');
  };

  const handleReset = () => {
    setStatus('idle');
    setResult('');
    setError('');
    setShowPromptPreview(false);
    setGeneratedPrompt('');
  };

  const copyToClipboard = async (text: string, isPrompt: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isPrompt) {
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
      } else {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Financial Advisor" className="max-w-3xl">
      <div className="p-4 space-y-6">
        {status === 'idle' || status === 'error' ? (
          <>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <Bot className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Get Personalized Insights</h3>
                  <p className="text-zinc-400 text-sm">
                    Enter your Google Gemini API key to have an AI analyze your simulation results.
                    Alternatively, generate the prompt and use it with your own LLM interface.
                  </p>
                </div>
              </div>

              {!showPromptPreview && (
                <>
                  <div className="space-y-2 pt-4">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="save-key"
                      checked={saveKey}
                      onCheckedChange={(checked) => setSaveKey(checked === true)}
                    />
                    <label htmlFor="save-key" className="text-sm text-zinc-400 cursor-pointer select-none">
                      Save API key to browser local storage for future use
                    </label>
                  </div>
                </>
              )}

              {showPromptPreview && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Generated Prompt
                    </label>
                    <button
                      onClick={() => copyToClipboard(generatedPrompt, true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {isPromptCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    className="w-full h-64 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 text-sm font-mono focus:outline-none custom-scrollbar resize-none"
                  />
                  <div className="flex justify-start">
                     <button
                        onClick={() => setShowPromptPreview(false)}
                        className="text-sm text-zinc-400 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                     >
                        Back to API Key Input
                     </button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {!showPromptPreview && (
                <button
                  onClick={handleGeneratePrompt}
                  className="px-4 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 font-medium rounded-lg transition-all"
                >
                  Generate Prompt Only
                </button>
              )}

              {!showPromptPreview && (
                <button
                    onClick={handleAnalyze}
                    disabled={!apiKey}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Bot className="w-5 h-5" />
                    Analyze Report
                </button>
              )}

               {showPromptPreview && (
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                >
                    Close
                </button>
              )}
            </div>
          </>
        ) : status === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-zinc-400 animate-pulse">Analyzing your financial future...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                      <Bot className="w-6 h-6 text-indigo-400" />
                      <h3 className="text-lg font-medium text-white">Advisor Analysis</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    title="Copy Analysis"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
               </div>
               <div className="text-zinc-300 text-sm">
                  <ReactMarkdown
                    components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3 mt-5">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>,
                        p: ({children}) => <p className="mb-4 leading-relaxed text-zinc-300">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-zinc-300">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-zinc-300">{children}</ol>,
                        li: ({children}) => <li className="pl-1">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-indigo-500/50 pl-4 py-1 my-4 bg-indigo-500/5 rounded-r-lg italic text-zinc-400">{children}</blockquote>,
                        code: ({children}) => <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">{children}</code>,
                    }}
                  >
                      {result}
                  </ReactMarkdown>
               </div>
            </div>

            <div className="flex justify-between items-center">
                 <button
                    onClick={handleReset}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                 >
                    Run new analysis
                 </button>
                 <button
                    onClick={onClose}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                 >
                    Close
                 </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
