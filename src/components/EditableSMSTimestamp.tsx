import React, { useState, useRef, useEffect } from 'react';

interface EditableSMSTimestampProps {
  timestamp: string;
  platform: string;
  onTimestampChange: (timestamp: string) => void;
  onPlatformChange: (platform: string) => void;
  className?: string;
}

export const EditableSMSTimestamp: React.FC<EditableSMSTimestampProps> = ({ 
  timestamp, 
  platform,
  onTimestampChange,
  onPlatformChange,
  className = '' 
}) => {
  const [editingField, setEditingField] = useState<'timestamp' | 'platform' | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editingField === 'timestamp' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    } else if (editingField === 'platform' && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editingField]);

  const startEditing = (field: 'timestamp' | 'platform') => {
    setEditingField(field);
    setEditValue(field === 'timestamp' ? timestamp : platform);
  };

  const saveEdit = () => {
    if (editingField === 'timestamp') {
      onTimestampChange(editValue);
    } else if (editingField === 'platform') {
      onPlatformChange(editValue);
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div className={`text-center py-2 ${className}`}>
      <div className="text-xs text-gray-500">
        {/* Editable Platform */}
        <div className="group cursor-pointer inline-block" onClick={() => startEditing('platform')}>
          {editingField === 'platform' ? (
            <select
              ref={selectRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-center"
            >
              <option value="SMS">SMS</option>
              <option value="iMessage">iMessage</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telegram">Telegram</option>
              <option value="Messenger">Messenger</option>
            </select>
          ) : (
            <div className="relative inline-block">
              {platform}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 -mr-4">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editable Timestamp */}
        <div className="group cursor-pointer inline-block ml-1" onClick={() => startEditing('timestamp')}>
          {editingField === 'timestamp' ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-center w-full"
              placeholder="DD MMM HH:MM AM/PM"
            />
          ) : (
            <div className="relative inline-block">
              {timestamp}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 -mr-4">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableSMSTimestamp;