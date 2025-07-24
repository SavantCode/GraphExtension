import React, { useState, useEffect } from 'react';
import { BarChart3, Settings, TrendingUp, Zap, Key, Play } from 'lucide-react';
import ApiKeySetup from './components/ApiKeySetup';
import AnalysisButton from './components/AnalysisButton';
import StatusIndicator from './components/StatusIndicator';

interface AppState {
  apiKey: string;
  isConfigured: boolean;
  isAnalyzing: boolean;
  showSettings: boolean;
}

function App() {
  const [state, setState] = useState<AppState>({
    apiKey: '',
    isConfigured: false,
    isAnalyzing: false,
    showSettings: false,
  });

  useEffect(() => {
    // Load API key from storage
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        setState(prev => ({
          ...prev,
          apiKey: result.geminiApiKey,
          isConfigured: true,
        }));
      }
    });
  }, []);

  const handleApiKeySave = (apiKey: string) => {
    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
      setState(prev => ({
        ...prev,
        apiKey,
        isConfigured: true,
        showSettings: false,
      }));
    });
  };

  const handleStartAnalysis = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      // Get current tab and inject content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/overlay.js']
        });
        
        // Close popup after starting analysis
        window.close();
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const toggleSettings = () => {
    setState(prev => ({ ...prev, showSettings: !prev.showSettings }));
  };

  if (state.showSettings || !state.isConfigured) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50">
        <ApiKeySetup
          currentApiKey={state.apiKey}
          onSave={handleApiKeySave}
          onCancel={state.isConfigured ? toggleSettings : undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">TrendLens</h1>
            <p className="text-xs text-gray-600">Chart Analysis AI</p>
          </div>
        </div>
        <button
          onClick={toggleSettings}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Status */}
      <div className="p-4">
        <StatusIndicator isConfigured={state.isConfigured} />
      </div>

      {/* Features Preview */}
      <div className="flex-1 p-4 space-y-3">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Pattern Recognition</span>
          </div>
          <p className="text-xs text-gray-600">
            Identify trends, support levels, and chart patterns automatically
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-secondary-500" />
            <span className="text-sm font-medium text-gray-700">Instant Analysis</span>
          </div>
          <p className="text-xs text-gray-600">
            Get AI-powered insights on any chart with just a selection
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Visual Annotations</span>
          </div>
          <p className="text-xs text-gray-600">
            See insights directly overlaid on the original chart
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4">
        <AnalysisButton
          onClick={handleStartAnalysis}
          isAnalyzing={state.isAnalyzing}
          disabled={!state.isConfigured}
        />
      </div>

      {/* Instructions */}
      <div className="px-4 pb-4">
        <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
          <p className="text-xs text-primary-700 text-center">
            Click the button above, then drag to select any chart on the current webpage
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;