import React, { useState } from 'react';
import { MemeMetadata } from '../types';
import { validateMetadata } from '../utils/validation';

interface MetadataEditorProps {
  metadata: MemeMetadata;
  onMetadataChange: (field: keyof MemeMetadata, value: string) => void;
  className?: string;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  onMetadataChange,
  className = ''
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof MemeMetadata, value: string) => {
    // Clear previous error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    // Update the metadata
    onMetadataChange(field, value);
    
    // Validate the new metadata
    const newMetadata = { ...metadata, [field]: value };
    const validation = validateMetadata(newMetadata);
    
    if (!validation.isValid) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes('Contact name')) {
          fieldErrors.contactName = error;
        } else if (error.includes('Phone number')) {
          fieldErrors.phoneNumber = error;
        } else if (error.includes('Timestamp')) {
          fieldErrors.timestamp = error;
        } else if (error.includes('Platform')) {
          fieldErrors.platform = error;
        }
      });
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      
      {/* Contact Name */}
      <div>
        <label htmlFor="contactName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Contact Name
        </label>
        <input
          id="contactName"
          type="text"
          value={metadata.contactName}
          onChange={(e) => handleFieldChange('contactName', e.target.value)}
          className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.contactName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter contact name"
          maxLength={50}
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="text"
          value={metadata.phoneNumber}
          onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
          className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter phone number"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Timestamp */}
      <div>
        <label htmlFor="timestamp" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Timestamp
        </label>
        <input
          id="timestamp"
          type="text"
          value={metadata.timestamp}
          onChange={(e) => handleFieldChange('timestamp', e.target.value)}
          className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.timestamp ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 24 Jul 11:49 PM"
        />
        {errors.timestamp && (
          <p className="mt-1 text-sm text-red-600">{errors.timestamp}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: DD MMM HH:MM AM/PM
        </p>
      </div>

      {/* Platform */}
      <div>
        <label htmlFor="platform" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Platform
        </label>
        <select
          id="platform"
          value={metadata.platform}
          onChange={(e) => handleFieldChange('platform', e.target.value)}
          className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.platform ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="SMS">SMS</option>
          <option value="iMessage">iMessage</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Telegram">Telegram</option>
          <option value="Messenger">Messenger</option>
        </select>
        {errors.platform && (
          <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
        )}
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const now = new Date();
              const timeString = now.toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              handleFieldChange('timestamp', timeString);
            }}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Current Time
          </button>
          
          <button
            onClick={() => {
              handleFieldChange('contactName', 'Mom');
              handleFieldChange('phoneNumber', '+1 (555) 123-4567');
            }}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Mom Contact
          </button>
          
          <button
            onClick={() => {
              handleFieldChange('contactName', 'Best Friend');
              handleFieldChange('phoneNumber', '+1 (555) 987-6543');
            }}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Friend Contact
          </button>
          
          <button
            onClick={() => {
              handleFieldChange('contactName', 'Unknown');
              handleFieldChange('phoneNumber', '+1 (555) 000-0000');
            }}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Unknown Number
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;