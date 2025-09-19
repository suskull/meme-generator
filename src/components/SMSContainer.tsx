import React from 'react';
import { MemeState } from '../types';
import { SMSHeader } from './SMSHeader';
import { SMSTimestamp } from './SMSTimestamp';
import { MessageBubble } from './MessageBubble';

interface SMSContainerProps {
  memeState: MemeState;
  className?: string;
}

export const SMSContainer: React.FC<SMSContainerProps> = ({ memeState, className = '' }) => {
  return (
    <div 
      className={`bg-white max-w-sm mx-auto shadow-lg rounded-lg overflow-hidden ${className}`}
      data-testid="sms-container"
    >
      {/* SMS Header */}
      <SMSHeader metadata={memeState.metadata} />
      
      {/* Timestamp */}
      <SMSTimestamp 
        timestamp={memeState.metadata.timestamp}
        platform={memeState.metadata.platform}
      />
      
      {/* Messages Area */}
      <div className="px-4 pt-2 pb-4 bg-white min-h-[400px]">
        {memeState.messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message}
          />
        ))}
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

export default SMSContainer;