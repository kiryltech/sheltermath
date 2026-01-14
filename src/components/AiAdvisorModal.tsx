'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useSimulationStore } from '@/store/useSimulationStore';
import { callGemini } from '@/lib/ai/gemini';
import { generateAnalysisPrompt } from '@/lib/ai/prompt';
import { Bot, Key, Loader2, AlertCircle } from 'lucide-react';
import { Checkbox } from './ui/Checkbox';

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

  const handleReset = () => {
    setStatus('idle');
    setResult('');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Financial Advisor" className="max-w-2xl">
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
                    The key is used only for this session or saved locally on your device if you choose.
                  </p>
                </div>
              </div>

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

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!apiKey}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bot className="w-5 h-5" />
                Analyze Report
              </button>
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
               <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                  <Bot className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-lg font-medium text-white">Advisor Analysis</h3>
               </div>
               <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {result}
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
