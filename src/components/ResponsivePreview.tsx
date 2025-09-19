import React, { useState } from 'react';
import { MemeState } from '../types';
import { SMSContainer } from './SMSContainer';

interface ResponsivePreviewProps {
  memeState: MemeState;
  className?: string;
}

type PreviewSize = 'mobile' | 'tablet' | 'desktop';

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({ 
  memeState, 
  className = '' 
}) => {
  const [previewSize, setPreviewSize] = useState<PreviewSize>('mobile');

  const getPreviewScale = () => {
    switch (previewSize) {
      case 'mobile': return 'scale-90';
      case 'tablet': return 'scale-75';
      case 'desktop': return 'scale-100';
      default: return 'scale-90';
    }
  };

  const getContainerWidth = () => {
    switch (previewSize) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-md';
      case 'desktop': return 'max-w-lg';
      default: return 'max-w-sm';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Live Preview</h2>
        
        {/* Preview Size Controls */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPreviewSize('mobile')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              previewSize === 'mobile' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Mobile view"
          >
            📱 Mobile
          </button>
          <button
            onClick={() => setPreviewSize('tablet')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              previewSize === 'tablet' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Tablet view"
          >
            📟 Tablet
          </button>
          <button
            onClick={() => setPreviewSize('desktop')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              previewSize === 'desktop' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Desktop view"
          >
            🖥️ Desktop
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Updates automatically as you edit</span>
      </div>
      
      {/* Preview Container */}
      <div className="flex justify-center min-h-[500px] bg-gray-50 rounded-lg p-4">
        <div className={`transform ${getPreviewScale()} origin-top transition-transform duration-300`}>
          <div className={`${getContainerWidth()} mx-auto`}>
            <SMSContainer memeState={memeState} />
          </div>
        </div>
      </div>
      
      {/* Preview Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {memeState.messages.length}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {memeState.messages.filter(m => m.image).length}
            </div>
            <div className="text-xs text-gray-500">Images</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {memeState.messages.reduce((acc, m) => acc + m.text.length, 0)}
            </div>
            <div className="text-xs text-gray-500">Characters</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {previewSize.charAt(0).toUpperCase() + previewSize.slice(1)}
            </div>
            <div className="text-xs text-gray-500">View Mode</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsivePreview;