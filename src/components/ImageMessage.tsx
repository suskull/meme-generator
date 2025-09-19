import React from 'react';
import { Message } from '../types';

interface ImageMessageProps {
  message: Message;
  onRemoveImage?: (messageId: string) => void;
  className?: string;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ 
  message, 
  onRemoveImage,
  className = '' 
}) => {
  const baseClasses = "max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed break-words";
  const typeClasses = message.type === 'sent' 
    ? "bg-green-500 text-white ml-auto rounded-br-md" 
    : "bg-gray-200 text-gray-900 mr-auto rounded-bl-md";

  return (
    <div className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`${baseClasses} ${typeClasses} ${className} relative group`}>
        {/* Image */}
        {message.image && (
          <div className="mb-2">
            <img
              src={message.image.url}
              alt={message.image.alt}
              className="rounded-lg max-w-full h-auto"
              style={{
                maxWidth: message.image.width || 200,
                maxHeight: message.image.height || 200,
              }}
            />
            {onRemoveImage && (
              <button
                onClick={() => onRemoveImage(message.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {/* Text content */}
        {message.text && (
          <div className="whitespace-pre-wrap">{message.text}</div>
        )}
        
        {/* Placeholder if no content */}
        {!message.text && !message.image && (
          <span className={`italic ${message.type === 'sent' ? 'text-gray-300' : 'text-gray-500'}`}>
            Empty message
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageMessage;