import { describe, it, expect } from 'vitest';
import { validateMessage, validateMetadata, validateTextLength, sanitizeText } from '../validation';
import { Message, MemeMetadata } from '../../types';

describe('validateMessage', () => {
  it('should validate a correct message', () => {
    const message: Message = {
      id: '1',
      text: 'Hello world',
      type: 'sent'
    };

    const result = validateMessage(message);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty message text', () => {
    const message: Message = {
      id: '1',
      text: '',
      type: 'sent'
    };

    const result = validateMessage(message);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message text cannot be empty');
  });

  it('should reject message text that is too long', () => {
    const message: Message = {
      id: '1',
      text: 'a'.repeat(501),
      type: 'sent'
    };

    const result = validateMessage(message);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message text cannot exceed 500 characters');
  });

  it('should reject invalid message type', () => {
    const message: Message = {
      id: '1',
      text: 'Hello',
      type: 'invalid' as any
    };

    const result = validateMessage(message);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message type must be either "sent" or "received"');
  });

  it('should reject empty message ID', () => {
    const message: Message = {
      id: '',
      text: 'Hello',
      type: 'sent'
    };

    const result = validateMessage(message);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message ID is required');
  });
});

describe('validateMetadata', () => {
  it('should validate correct metadata', () => {
    const metadata: MemeMetadata = {
      contactName: 'John Doe',
      timestamp: '24 Jul 11:49 PM',
      phoneNumber: '1234567890',
      platform: 'SMS'
    };

    const result = validateMetadata(metadata);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty contact name', () => {
    const metadata: MemeMetadata = {
      contactName: '',
      timestamp: '24 Jul 11:49 PM',
      phoneNumber: '1234567890',
      platform: 'SMS'
    };

    const result = validateMetadata(metadata);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact name is required');
  });

  it('should reject contact name that is too long', () => {
    const metadata: MemeMetadata = {
      contactName: 'a'.repeat(51),
      timestamp: '24 Jul 11:49 PM',
      phoneNumber: '1234567890',
      platform: 'SMS'
    };

    const result = validateMetadata(metadata);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact name cannot exceed 50 characters');
  });

  it('should reject invalid phone number', () => {
    const metadata: MemeMetadata = {
      contactName: 'John',
      timestamp: '24 Jul 11:49 PM',
      phoneNumber: 'invalid-phone!@#',
      platform: 'SMS'
    };

    const result = validateMetadata(metadata);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Phone number contains invalid characters');
  });
});

describe('validateTextLength', () => {
  it('should validate text within length limit', () => {
    expect(validateTextLength('Hello', 10)).toBe(true);
  });

  it('should reject text exceeding length limit', () => {
    expect(validateTextLength('Hello world', 5)).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('should trim whitespace and normalize spaces', () => {
    expect(sanitizeText('  hello   world  ')).toBe('hello world');
  });

  it('should handle multiple spaces', () => {
    expect(sanitizeText('hello     world')).toBe('hello world');
  });
});