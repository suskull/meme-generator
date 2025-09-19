import React from 'react';
import { Message } from '../types';
import { EditableMessageBubble } from './EditableMessageBubble';

interface MessageEditorProps {
  messages: Message[];
  onMessageChange: (id: string, newText: string) => void;
  onImageAdd?: (id: string, imageData: { url: string; alt: string; width?: number; height?: number }) => void;
  onImageRemove?: (id: string) => void;
  onAddMessage?: (type: 'sent' | 'received') => void;
  onDeleteMessage?: (id: string) => void;
  className?: string;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  messages,
  onMessageChange,
  onImageAdd,
  onImageRemove,
  onAddMessage,
  onDeleteMessage,
  className = ''
}) => {
  const handleAddSentMessage = () => {
    if (onAddMessage) {
      onAddMessage('sent');
    }
  };

  const handleAddReceivedMessage = () => {
    if (onAddMessage) {
      onAddMessage('received');
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {messages.map((message) => (
        <EditableMessageBubble
          key={message.id}
          message={message}
          onMessageChange={onMessageChange}
          onImageAdd={onImageAdd}
          onImageRemove={onImageRemove}
          onDeleteMessage={onDeleteMessage}
        />
      ))}
      
      {/* Add message buttons */}
      {onAddMessage && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={handleAddReceivedMessage}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            <span>+</span>
            <span>Add Received</span>
          </button>
          
          <button
            onClick={handleAddSentMessage}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <span>+</span>
            <span>Add Sent</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageEditor;