import React from 'react';
import { MemeState } from '../types';
import { EditableSMSHeader } from './EditableSMSHeader';
import { EditableSMSTimestamp } from './EditableSMSTimestamp';
import { MessageEditor } from './MessageEditor';

interface EditableSMSContainerProps {
  memeState: MemeState;
  onMessageChange: (id: string, newText: string) => void;
  onMetadataChange: (field: keyof MemeState['metadata'], value: string) => void;
  onImageAdd?: (id: string, imageData: { url: string; alt: string; width?: number; height?: number }) => void;
  onImageRemove?: (id: string) => void;
  onAddMessage?: (type: 'sent' | 'received') => void;
  onDeleteMessage?: (id: string) => void;
  className?: string;
}

export const EditableSMSContainer: React.FC<EditableSMSContainerProps> = ({ 
  memeState, 
  onMessageChange,
  onMetadataChange,
  onImageAdd,
  onImageRemove,
  onAddMessage,
  onDeleteMessage,
  className = '' 
}) => {
  return (
    <div className={`bg-white w-full max-w-sm mx-auto shadow-lg rounded-lg overflow-hidden ${className}`}>
      {/* Editable SMS Header */}
      <EditableSMSHeader 
        metadata={memeState.metadata}
        onMetadataChange={onMetadataChange}
      />
      
      {/* Editable Timestamp */}
      <EditableSMSTimestamp 
        timestamp={memeState.metadata.timestamp}
        platform={memeState.metadata.platform}
        onTimestampChange={(timestamp) => onMetadataChange('timestamp', timestamp)}
        onPlatformChange={(platform) => onMetadataChange('platform', platform)}
      />
      
      {/* Messages Area with Editor */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 bg-white min-h-[350px] sm:min-h-[400px]">
        <MessageEditor
          messages={memeState.messages}
          onMessageChange={onMessageChange}
          onImageAdd={onImageAdd}
          onImageRemove={onImageRemove}
          onAddMessage={onAddMessage}
          onDeleteMessage={onDeleteMessage}
        />
      </div>
      
      {/* Bottom input area (visual only) */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2">
            <span className="text-gray-400 text-sm">Text Message</span>
          </div>
          <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableSMSContainer;