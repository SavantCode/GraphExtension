import React from 'react';
import { Play, Loader } from 'lucide-react';

interface AnalysisButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

const AnalysisButton: React.FC<AnalysisButtonProps> = ({ onClick, isAnalyzing, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none"
    >
      {isAnalyzing ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span className="font-medium">Starting Analysis...</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5" />
          <span className="font-medium">Start Chart Analysis</span>
        </>
      )}
    </button>
  );
};

export default AnalysisButton;