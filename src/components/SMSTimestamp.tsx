import React from 'react';

interface SMSTimestampProps {
  timestamp: string;
  platform?: string;
  className?: string;
}

export const SMSTimestamp: React.FC<SMSTimestampProps> = ({ 
  timestamp, 
  platform = 'SMS', 
  className = '' 
}) => {
  return (
    <div className={`text-center py-2 ${className}`}>
      <div className="text-xs text-gray-500">
        <div>{platform}</div>
        <div>{timestamp}</div>
      </div>
    </div>
  );
};

export default SMSTimestamp;