import React, { useState } from 'react';
import { MemeState } from '../types';
import { SMSContainer } from './SMSContainer';
import { usePreviewUpdates } from '../hooks/usePreviewUpdates';

interface EnhancedPreviewProps {
  memeState: MemeState;
  className?: string;
}

type PreviewSize = 'mobile' | 'tablet' | 'desktop';

export const EnhancedPreview: React.FC<EnhancedPreviewProps> = ({ 
  memeState, 
  className = '' 
}) => {
  const [previewSize, setPreviewSize] = useState<PreviewSize>('mobile');
  const { previewState, isUpdating, previewStats } = usePreviewUpdates(memeState, {
    debounceMs: 200,
    enableAnimations: true
  });

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
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-800">Live Preview</h2>
            <div className={`flex items-center space-x-2 text-sm transition-colors ${
              isUpdating ? 'text-blue-600' : 'text-green-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isUpdating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
              }`}></div>
              <span>{isUpdating ? 'Updating...' : 'Live'}</span>
            </div>
          </div>
          
          {/* Preview Size Controls */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setPreviewSize('mobile')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                previewSize === 'mobile' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Mobile view (320px)"
            >
              📱
            </button>
            <button
              onClick={() => setPreviewSize('tablet')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                previewSize === 'tablet' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Tablet view (768px)"
            >
              📟
            </button>
            <button
              onClick={() => setPreviewSize('desktop')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                previewSize === 'desktop' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Desktop view (1024px)"
            >
              🖥️
            </button>
          </div>
        </div>
      </div>
      
      {/* Preview Container */}
      <div className="p-6">
        <div className="flex justify-center min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Preview Content */}
          <div className={`transform ${getPreviewScale()} origin-top transition-all duration-500 relative z-10 ${
            isUpdating ? 'opacity-75' : 'opacity-100'
          }`}>
            <div className={`${getContainerWidth()} mx-auto`}>
              {previewStats.isEmpty ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Start editing to see your meme preview</p>
                </div>
              ) : (
                <SMSContainer memeState={previewState} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-blue-600">
              {previewStats.messageCount}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-green-600">
              {previewStats.imageCount}
            </div>
            <div className="text-xs text-gray-500">Images</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-purple-600">
              {previewStats.characterCount}
            </div>
            <div className="text-xs text-gray-500">Characters</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-orange-600">
              {previewStats.sentMessages}
            </div>
            <div className="text-xs text-gray-500">Sent</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-lg font-bold text-gray-600">
              {previewStats.receivedMessages}
            </div>
            <div className="text-xs text-gray-500">Received</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPreview;