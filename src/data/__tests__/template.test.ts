import { describe, it, expect } from 'vitest';
import { DEFAULT_MEME_STATE, TEMPLATE_CONFIG } from '../template';
import { validateMessage, validateMetadata } from '../../utils/validation';

describe('DEFAULT_MEME_STATE', () => {
  it('should have valid structure', () => {
    expect(DEFAULT_MEME_STATE).toBeDefined();
    expect(DEFAULT_MEME_STATE.messages).toBeInstanceOf(Array);
    expect(DEFAULT_MEME_STATE.metadata).toBeDefined();
  });

  it('should have 7 messages matching the original conversation', () => {
    expect(DEFAULT_MEME_STATE.messages).toHaveLength(7);
    
    // Check first message
    expect(DEFAULT_MEME_STATE.messages[0]).toEqual({
      id: '1',
      text: 'b ơi, t bị phân vân',
      type: 'received'
    });

    // Check last message
    expect(DEFAULT_MEME_STATE.messages[6]).toEqual({
      id: '7',
      text: 'hahaha, không có gì đâu. Đồng nghiệp với nhau mà 1008567447 vcb',
      type: 'received',
      image: {
        url: '/assets/images/default-qr.png',
        alt: 'QR Code for bank transfer',
        width: 150,
        height: 150
      }
    });
  });

  it('should have correct metadata', () => {
    expect(DEFAULT_MEME_STATE.metadata).toEqual({
      contactName: 'Bánh',
      timestamp: '24 Jul 11:49 PM',
      phoneNumber: '1466',
      platform: 'SMS'
    });
  });

  it('should have all valid messages', () => {
    DEFAULT_MEME_STATE.messages.forEach(message => {
      const validation = validateMessage(message);
      expect(validation.isValid).toBe(true);
    });
  });

  it('should have valid metadata', () => {
    const validation = validateMetadata(DEFAULT_MEME_STATE.metadata);
    expect(validation.isValid).toBe(true);
  });

  it('should have alternating message types that match the original', () => {
    const expectedTypes = ['received', 'sent', 'received', 'received', 'sent', 'sent', 'received'];
    
    DEFAULT_MEME_STATE.messages.forEach((message, index) => {
      expect(message.type).toBe(expectedTypes[index]);
    });
  });
});

describe('TEMPLATE_CONFIG', () => {
  it('should have valid configuration', () => {
    expect(TEMPLATE_CONFIG.defaultState).toBe(DEFAULT_MEME_STATE);
    expect(TEMPLATE_CONFIG.maxTextLength).toBe(500);
    expect(TEMPLATE_CONFIG.allowedFormats).toEqual(['png', 'jpg', 'jpeg']);
  });

  it('should have reasonable text length limit', () => {
    expect(TEMPLATE_CONFIG.maxTextLength).toBeGreaterThan(0);
    expect(TEMPLATE_CONFIG.maxTextLength).toBeLessThanOrEqual(1000);
  });

  it('should have supported image formats', () => {
    expect(TEMPLATE_CONFIG.allowedFormats).toContain('png');
    expect(TEMPLATE_CONFIG.allowedFormats.length).toBeGreaterThan(0);
  });
});