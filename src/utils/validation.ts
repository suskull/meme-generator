import { Message, MemeMetadata } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateMessage = (message: Message): ValidationResult => {
  const errors: string[] = [];

  if (!message.text.trim()) {
    errors.push('Message text cannot be empty');
  }

  if (message.text.length > 500) {
    errors.push('Message text cannot exceed 500 characters');
  }

  if (!['sent', 'received'].includes(message.type)) {
    errors.push('Message type must be either "sent" or "received"');
  }

  if (!message.id.trim()) {
    errors.push('Message ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMetadata = (metadata: MemeMetadata): ValidationResult => {
  const errors: string[] = [];

  if (!metadata.contactName.trim()) {
    errors.push('Contact name is required');
  }

  if (metadata.contactName.length > 50) {
    errors.push('Contact name cannot exceed 50 characters');
  }

  if (!metadata.timestamp.trim()) {
    errors.push('Timestamp is required');
  }

  if (!metadata.phoneNumber.trim()) {
    errors.push('Phone number is required');
  }

  // Basic phone number validation (digits and common separators)
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (metadata.phoneNumber && !phoneRegex.test(metadata.phoneNumber)) {
    errors.push('Phone number contains invalid characters');
  }

  if (!metadata.platform.trim()) {
    errors.push('Platform is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTextLength = (text: string, maxLength: number = 500): boolean => {
  return text.length <= maxLength;
};

export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};