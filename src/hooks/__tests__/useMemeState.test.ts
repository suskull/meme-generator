import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemeState } from '../useMemeState';
import { DEFAULT_MEME_STATE } from '../../data/template';

describe('useMemeState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useMemeState());
    
    expect(result.current.memeState).toEqual(DEFAULT_MEME_STATE);
  });

  it('initializes with custom state', () => {
    const customState = {
      ...DEFAULT_MEME_STATE,
      metadata: {
        ...DEFAULT_MEME_STATE.metadata,
        contactName: 'Custom Name'
      }
    };
    
    const { result } = renderHook(() => useMemeState(customState));
    
    expect(result.current.memeState.metadata.contactName).toBe('Custom Name');
  });

  it('updates message text correctly', () => {
    const { result } = renderHook(() => useMemeState());
    
    act(() => {
      result.current.updateMessage('1', 'Updated text');
    });
    
    const updatedMessage = result.current.memeState.messages.find(m => m.id === '1');
    expect(updatedMessage?.text).toBe('Updated text');
  });

  it('adds new sent message', () => {
    const { result } = renderHook(() => useMemeState());
    const initialCount = result.current.memeState.messages.length;
    
    act(() => {
      result.current.addMessage('sent');
    });
    
    expect(result.current.memeState.messages).toHaveLength(initialCount + 1);
    const newMessage = result.current.memeState.messages[result.current.memeState.messages.length - 1];
    expect(newMessage.type).toBe('sent');
    expect(newMessage.text).toBe('');
    expect(newMessage.id).toBeDefined();
  });

  it('adds new received message', () => {
    const { result } = renderHook(() => useMemeState());
    const initialCount = result.current.memeState.messages.length;
    
    act(() => {
      result.current.addMessage('received');
    });
    
    expect(result.current.memeState.messages).toHaveLength(initialCount + 1);
    const newMessage = result.current.memeState.messages[result.current.memeState.messages.length - 1];
    expect(newMessage.type).toBe('received');
  });

  it('deletes message correctly', () => {
    const { result } = renderHook(() => useMemeState());
    const initialCount = result.current.memeState.messages.length;
    
    act(() => {
      result.current.deleteMessage('1');
    });
    
    expect(result.current.memeState.messages).toHaveLength(initialCount - 1);
    expect(result.current.memeState.messages.find(m => m.id === '1')).toBeUndefined();
  });

  it('updates metadata correctly', () => {
    const { result } = renderHook(() => useMemeState());
    
    act(() => {
      result.current.updateMetadata('contactName', 'New Name');
    });
    
    expect(result.current.memeState.metadata.contactName).toBe('New Name');
  });

  it('resets to default state', () => {
    const { result } = renderHook(() => useMemeState());
    
    // Make some changes
    act(() => {
      result.current.updateMessage('1', 'Changed text');
      result.current.updateMetadata('contactName', 'Changed Name');
    });
    
    // Reset
    act(() => {
      result.current.resetToDefault();
    });
    
    expect(result.current.memeState).toEqual(DEFAULT_MEME_STATE);
  });

  it('validates current state correctly', () => {
    const { result } = renderHook(() => useMemeState());
    
    // Valid state
    let validation = result.current.validateCurrentState();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    
    // Invalid state - empty message ID
    act(() => {
      result.current.memeState.messages[0].id = '';
    });
    
    validation = result.current.validateCurrentState();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('generates unique IDs for new messages', () => {
    const { result } = renderHook(() => useMemeState());
    
    act(() => {
      result.current.addMessage('sent');
      result.current.addMessage('received');
    });
    
    const messages = result.current.memeState.messages;
    const lastTwoMessages = messages.slice(-2);
    
    expect(lastTwoMessages[0].id).not.toBe(lastTwoMessages[1].id);
    expect(lastTwoMessages[0].id).toMatch(/^msg_\d+_[a-z0-9]+$/);
    expect(lastTwoMessages[1].id).toMatch(/^msg_\d+_[a-z0-9]+$/);
  });

  it('adds image to message correctly', () => {
    const { result } = renderHook(() => useMemeState());
    
    // Check if the function exists
    expect(result.current.addImageToMessage).toBeDefined();
    
    // Use the first available message ID
    const firstMessageId = result.current.memeState.messages[0]?.id;
    expect(firstMessageId).toBeDefined();
    
    const originalMessage = result.current.memeState.messages.find(m => m.id === firstMessageId);
    expect(originalMessage).toBeDefined();
    expect(originalMessage?.image).toBeUndefined();
    
    const imageData = {
      url: 'data:image/png;base64,test',
      alt: 'test.png',
      width: 100,
      height: 100
    };
    
    act(() => {
      result.current.addImageToMessage(firstMessageId!, imageData);
    });
    
    const updatedMessage = result.current.memeState.messages.find(m => m.id === firstMessageId);
    expect(updatedMessage?.image).toEqual(imageData);
  });

  it('removes image from message correctly', () => {
    const { result } = renderHook(() => useMemeState());
    
    // Use the first available message ID (which might be empty string)
    const firstMessageId = result.current.memeState.messages[0]?.id || '2';
    
    // First add an image
    const imageData = {
      url: 'data:image/png;base64,test',
      alt: 'test.png',
      width: 100,
      height: 100
    };
    
    act(() => {
      result.current.addImageToMessage(firstMessageId, imageData);
    });
    
    // Verify image was added
    let updatedMessage = result.current.memeState.messages.find(m => m.id === firstMessageId);
    expect(updatedMessage?.image).toEqual(imageData);
    
    // Remove the image
    act(() => {
      result.current.removeImageFromMessage(firstMessageId);
    });
    
    // Verify image was removed
    updatedMessage = result.current.memeState.messages.find(m => m.id === firstMessageId);
    expect(updatedMessage?.image).toBeUndefined();
  });
});