import React, { useState } from 'react';
import { Key, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface ApiKeySetupProps {
  currentApiKey: string;
  onSave: (apiKey: string) => void;
  onCancel?: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ currentApiKey, onSave, onCancel }) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      // Basic validation - check if API key format looks correct
      if (apiKey.startsWith('AI') && apiKey.length > 30) {
        setValidationStatus('valid');
        setTimeout(() => {
          onSave(apiKey.trim());
        }, 500);
      } else {
        setValidationStatus('invalid');
      }
    } catch (error) {
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'valid':
        return { icon: CheckCircle, text: 'API key validated successfully!', color: 'text-green-600' };
      case 'invalid':
        return { icon: AlertCircle, text: 'Invalid API key format. Please check and try again.', color: 'text-red-600' };
      default:
        return null;
    }
  };

  const validation = getValidationMessage();

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <Key className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900">API Configuration</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Google Gemini API Key</h3>
          <p className="text-sm text-gray-600">
            Enter your Google Gemini API key to enable AI-powered chart analysis.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              disabled={isValidating}
            />
          </div>

          {validation && (
            <div className={`flex items-center space-x-2 animate-fade-in ${validation.color}`}>
              <validation.icon className="w-4 h-4" />
              <span className="text-sm">{validation.text}</span>
            </div>
          )}
        </div>

        <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
          <p className="text-xs text-primary-700">
            <strong>How to get your API key:</strong>
          </p>
          <ol className="text-xs text-primary-700 mt-1 space-y-1 list-decimal list-inside">
            <li>Visit Google AI Studio</li>
            <li>Sign in with your Google account</li>
            <li>Navigate to API Keys section</li>
            <li>Create a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-800">
                <strong>Security Note:</strong> Your API key is stored locally in your browser and never shared with our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!apiKey.trim() || isValidating || validationStatus === 'valid'}
          className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Validating...</span>
            </>
          ) : validationStatus === 'valid' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save API Key</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ApiKeySetup;