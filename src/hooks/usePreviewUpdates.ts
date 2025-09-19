import { useEffect, useRef, useState } from 'react';
import { MemeState } from '../types';

interface PreviewUpdateOptions {
  debounceMs?: number;
  enableAnimations?: boolean;
}

export const usePreviewUpdates = (
  memeState: MemeState, 
  options: PreviewUpdateOptions = {}
) => {
  const { debounceMs = 300, enableAnimations = true } = options;
  const [debouncedState, setDebouncedState] = useState(memeState);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setIsUpdating(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced update
    timeoutRef.current = setTimeout(() => {
      setDebouncedState(memeState);
      setIsUpdating(false);
    }, debounceMs);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [memeState, debounceMs]);

  // Calculate preview statistics
  const previewStats = {
    messageCount: debouncedState.messages.length,
    imageCount: debouncedState.messages.filter(m => m.image).length,
    characterCount: debouncedState.messages.reduce((acc, m) => acc + m.text.length, 0),
    sentMessages: debouncedState.messages.filter(m => m.type === 'sent').length,
    receivedMessages: debouncedState.messages.filter(m => m.type === 'received').length,
    hasImages: debouncedState.messages.some(m => m.image),
    isEmpty: debouncedState.messages.length === 0 || 
             debouncedState.messages.every(m => !m.text.trim() && !m.image)
  };

  return {
    previewState: debouncedState,
    isUpdating,
    previewStats,
    enableAnimations
  };
};