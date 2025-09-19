import React from 'react';
import { MemeState } from '../types';
import { SMSContainer } from './SMSContainer';

interface PreviewPanelProps {
  memeState: MemeState;
  className?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  memeState, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Preview</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">
        This is how your meme will look when generated. Changes update automatically.
      </p>
      
      <div className="flex justify-center">
        <div className="transform scale-90 origin-top">
          <SMSContainer memeState={memeState} />
        </div>
      </div>
      
      {/* Preview Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
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
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;