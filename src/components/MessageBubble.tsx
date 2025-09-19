import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, className = '' }) => {
  const baseClasses = "max-w-[280px] sm:max-w-xs rounded-2xl text-xs sm:text-sm break-words";

  const typeClasses = message.type === 'sent'
    ? "bg-green-500 text-white ml-auto rounded-br-md"
    : "bg-gray-200 text-gray-900 mr-auto rounded-bl-md";

  return (
    <div className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: '2px' }}>
      <div
        className={`${baseClasses} ${typeClasses} ${className} p-2 sm:p-3`}
      >
        {/* Image Display */}
        {message.image && (
          <div className={message.text ? "mb-2" : ""}>
            <img
              src={typeof message.image === 'string' ? message.image : message.image.url}
              alt={typeof message.image === 'string' ? 'Image' : message.image.alt}
              className="rounded-lg max-w-full h-auto block"
              style={{
                maxWidth: typeof message.image === 'object' ? (message.image.width || 150) : 150,
                maxHeight: typeof message.image === 'object' ? (message.image.height || 150) : 150,
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.warn('Failed to load image:', typeof message.image === 'string' ? message.image : message.image?.url);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Text Content */}
        {message.text && (
          <div
            style={{
              lineHeight: '1.3',
              margin: 0,
              padding: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;