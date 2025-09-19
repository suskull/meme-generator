import { useState, useCallback } from 'react';
import { MemeState, Message } from '../types';
import { DEFAULT_MEME_STATE } from '../data/template';
import { validateMessage } from '../utils/validation';

export const useMemeState = (initialState: MemeState = DEFAULT_MEME_STATE) => {
  const [memeState, setMemeState] = useState<MemeState>(initialState);

  const updateMessage = useCallback((id: string, newText: string) => {
    setMemeState(prevState => ({
      ...prevState,
      messages: prevState.messages.map(message =>
        message.id === id ? { ...message, text: newText } : message
      )
    }));
  }, []);

  const addImageToMessage = useCallback((id: string, imageData: { url: string; alt: string; width?: number; height?: number }) => {
    setMemeState(prevState => ({
      ...prevState,
      messages: prevState.messages.map(message =>
        message.id === id ? { ...message, image: imageData } : message
      )
    }));
  }, []);

  const removeImageFromMessage = useCallback((id: string) => {
    setMemeState(prevState => ({
      ...prevState,
      messages: prevState.messages.map(message =>
        message.id === id ? { ...message, image: undefined } : message
      )
    }));
  }, []);

  const addMessage = useCallback((type: 'sent' | 'received') => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      type
    };

    setMemeState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, newMessage]
    }));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMemeState(prevState => ({
      ...prevState,
      messages: prevState.messages.filter(message => message.id !== id)
    }));
  }, []);

  const updateMetadata = useCallback((field: keyof MemeState['metadata'], value: string) => {
    setMemeState(prevState => ({
      ...prevState,
      metadata: {
        ...prevState.metadata,
        [field]: value
      }
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    setMemeState(DEFAULT_MEME_STATE);
  }, []);

  const validateCurrentState = useCallback(() => {
    const errors: string[] = [];
    
    memeState.messages.forEach((message, index) => {
      const validation = validateMessage(message);
      if (!validation.isValid) {
        errors.push(`Message ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [memeState]);

  return {
    memeState,
    updateMessage,
    addImageToMessage,
    removeImageFromMessage,
    addMessage,
    deleteMessage,
    updateMetadata,
    resetToDefault,
    validateCurrentState
  };
};