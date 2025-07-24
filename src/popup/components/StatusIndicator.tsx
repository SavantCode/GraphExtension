import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  isConfigured: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConfigured }) => {
  return (
    <div className="flex items-center space-x-2">
      {isConfigured ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">API configured and ready</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-700">API key required</span>
        </>
      )}
    </div>
  );
};

export default StatusIndicator;