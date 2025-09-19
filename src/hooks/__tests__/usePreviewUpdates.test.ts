import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreviewUpdates } from '../usePreviewUpdates';
import { DEFAULT_MEME_STATE } from '../../data/template';

// Mock timers
vi.useFakeTimers();

describe('usePreviewUpdates', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('initializes with the provided meme state', () => {
    const { result } = renderHook(() => usePreviewUpdates(DEFAULT_MEME_STATE));
    
    expect(result.current.previewState).toEqual(DEFAULT_MEME_STATE);
    // Initially isUpdating is true due to the debounce effect
    expect(result.current.isUpdating).toBe(true);
    expect(result.current.enableAnimations).toBe(true);
  });

  it('debounces state updates', () => {
    const { result, rerender } = renderHook(
      ({ state }) => usePreviewUpdates(state, { debounceMs: 300 }),
      { initialProps: { state: DEFAULT_MEME_STATE } }
    );

    // Wait for initial debounce to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now should not be updating
    expect(result.current.isUpdating).toBe(false);

    // Update the state
    const updatedState = {
      ...DEFAULT_MEME_STATE,
      messages: [...DEFAULT_MEME_STATE.messages, {
        id: 'new',
        text: 'New message',
        type: 'sent' as const
      }]
    };

    rerender({ state: updatedState });

    // Should be updating immediately
    expect(result.current.isUpdating).toBe(true);
    expect(result.current.previewState).toEqual(DEFAULT_MEME_STATE); // Still old state

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should now have updated state
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.previewState).toEqual(updatedState);
  });

  it('calculates preview statistics correctly', () => {
    const { result } = renderHook(() => usePreviewUpdates(DEFAULT_MEME_STATE));
    
    const stats = result.current.previewStats;
    
    expect(stats.messageCount).toBe(7); // Default template has 7 messages
    expect(stats.imageCount).toBe(1); // One image in message 7 (QR code)
    expect(stats.characterCount).toBeGreaterThan(0); // Should have some characters
    expect(stats.sentMessages).toBeGreaterThan(0);
    expect(stats.receivedMessages).toBeGreaterThan(0);
    expect(stats.hasImages).toBe(true); // Now has QR code image
    expect(stats.isEmpty).toBe(false);
  });

  it('detects empty state correctly', () => {
    const emptyState = {
      ...DEFAULT_MEME_STATE,
      messages: []
    };

    const { result } = renderHook(() => usePreviewUpdates(emptyState));
    
    expect(result.current.previewStats.isEmpty).toBe(true);
    expect(result.current.previewStats.messageCount).toBe(0);
  });

  it('detects images correctly', () => {
    const stateWithImage = {
      ...DEFAULT_MEME_STATE,
      messages: [{
        id: '1',
        text: 'Message with image',
        type: 'sent' as const,
        image: {
          url: 'data:image/png;base64,test',
          alt: 'test image'
        }
      }]
    };

    const { result } = renderHook(() => usePreviewUpdates(stateWithImage));
    
    expect(result.current.previewStats.hasImages).toBe(true);
    expect(result.current.previewStats.imageCount).toBe(1);
  });

  it('respects custom debounce time', () => {
    const { result, rerender } = renderHook(
      ({ state }) => usePreviewUpdates(state, { debounceMs: 500 }),
      { initialProps: { state: DEFAULT_MEME_STATE } }
    );

    const updatedState = {
      ...DEFAULT_MEME_STATE,
      messages: []
    };

    rerender({ state: updatedState });
    expect(result.current.isUpdating).toBe(true);

    // Should still be updating after 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.isUpdating).toBe(true);

    // Should be done after 500ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isUpdating).toBe(false);
  });

  it('handles animation settings', () => {
    const { result } = renderHook(() => 
      usePreviewUpdates(DEFAULT_MEME_STATE, { enableAnimations: false })
    );
    
    expect(result.current.enableAnimations).toBe(false);
  });

  it('cancels previous timeout when state changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ state }) => usePreviewUpdates(state, { debounceMs: 300 }),
      { initialProps: { state: DEFAULT_MEME_STATE } }
    );

    // First update
    const state1 = { ...DEFAULT_MEME_STATE, messages: [] };
    rerender({ state: state1 });
    expect(result.current.isUpdating).toBe(true);

    // Second update before first completes
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    const state2 = { 
      ...DEFAULT_MEME_STATE, 
      messages: DEFAULT_MEME_STATE.messages.slice(0, 1)
    };
    rerender({ state: state2 });
    
    // Should still be updating
    expect(result.current.isUpdating).toBe(true);
    
    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Should have the latest state
    expect(result.current.previewState).toEqual(state2);
    expect(result.current.isUpdating).toBe(false);
  });
});