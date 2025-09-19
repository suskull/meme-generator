import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { ImageUpload } from './ImageUpload';

interface EditableMessageBubbleProps {
  message: Message;
  onMessageChange: (id: string, newText: string) => void;
  onImageAdd?: (id: string, imageData: { url: string; alt: string; width?: number; height?: number }) => void;
  onImageRemove?: (id: string) => void;
  onDeleteMessage?: (id: string) => void;
  className?: string;
}

export const EditableMessageBubble: React.FC<EditableMessageBubbleProps> = ({
  message,
  onMessageChange,
  onImageAdd,
  onImageRemove,
  onDeleteMessage,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const baseClasses = "max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed break-words";
  const typeClasses = message.type === 'sent'
    ? "bg-green-500 text-white ml-auto rounded-br-md"
    : "bg-gray-200 text-gray-900 mr-auto rounded-bl-md";

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.focus();
      textarea.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing && !showImageUpload) {
      setIsEditing(true);
      setEditText(message.text);
    }
  };

  const handleImageUpload = (imageData: { url: string; alt: string; width?: number; height?: number }) => {
    if (onImageAdd) {
      onImageAdd(message.id, imageData);
    }
    setShowImageUpload(false);
  };

  const handleImageRemove = () => {
    if (onImageRemove) {
      onImageRemove(message.id);
    }
  };

  const handleDeleteMessage = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
  };

  const handleSave = () => {
    onMessageChange(message.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`${baseClasses} ${typeClasses} ${className} relative group`}>
        {/* Image Display */}
        {message.image && (
          <div className="mb-2 relative">
            <img
              src={message.image.url}
              alt={message.image.alt}
              className="rounded-lg max-w-full h-auto"
              style={{
                maxWidth: message.image.width || 200,
                maxHeight: message.image.height || 200,
              }}
            />
            {onImageRemove && (
              <button
                onClick={handleImageRemove}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Image Upload Area */}
        {showImageUpload ? (
          <div className="mb-2">
            <ImageUpload onImageUpload={handleImageUpload} />
            <button
              onClick={() => setShowImageUpload(false)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {/* Text Content */}
        <div className="cursor-pointer" onClick={handleClick}>
          {isEditing ? (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className={`w-full bg-transparent border-none outline-none resize-none ${message.type === 'sent' ? 'text-white placeholder-gray-300' : 'text-gray-900 placeholder-gray-500'
                  }`}
                placeholder={message.text || 'Enter message...'}
                rows={1}
              />
              <div className="absolute -bottom-6 left-0 text-xs opacity-75">
                Press Enter to save, Esc to cancel
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {message.text || (
                <span className={`italic ${message.type === 'sent' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {message.image ? 'Add caption...' : 'Click to edit...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Touch-friendly positioning */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 touch-manipulation">
          {/* Add Image Button */}
          {!message.image && onImageAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImageUpload(pre => !pre);
              }}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white touch-manipulation"
              title="Add image"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {/* Edit Text Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white touch-manipulation"
            title="Edit text"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          {/* Delete Message Button */}
          {onDeleteMessage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMessage();
              }}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white touch-manipulation"
              title="Delete message"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableMessageBubble;