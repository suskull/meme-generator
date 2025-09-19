import React from 'react';
import { MemeMetadata } from '../types';

interface SMSHeaderProps {
  metadata: MemeMetadata;
  className?: string;
}

export const SMSHeader: React.FC<SMSHeaderProps> = ({ metadata, className = '' }) => {
  return (
    <div className={`bg-gray-50 px-4 py-3 border-b border-gray-200 ${className}`}>
      {/* Top bar with carrier info and time */}
      <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <span className="ml-2">Carrier</span>
        </div>
        <div>9:41 AM</div>
        <div className="flex items-center space-x-1">
          <div className="text-xs">100%</div>
          <div className="w-6 h-3 border border-gray-600 rounded-sm">
            <div className="w-full h-full bg-green-500 rounded-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Header with back button and contact info */}
      <div className="flex items-center space-x-3">
        <button className="text-blue-500 text-lg font-medium">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="font-medium text-gray-900">{metadata.contactName}</div>
            <div className="text-xs text-blue-500">{metadata.phoneNumber}</div>
          </div>
        </div>
        
        <button className="text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SMSHeader;