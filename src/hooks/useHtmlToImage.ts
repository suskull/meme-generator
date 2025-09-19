import { useState, useCallback, useRef } from 'react';
import { HtmlToImageGenerator, HtmlToImageOptions } from '../services/HtmlToImageGenerator';

export interface UseHtmlToImageOptions {
  defaultFilename?: string;
  defaultOptions?: HtmlToImageOptions;
}

export interface HtmlToImageState {
  isGenerating: boolean;
  error: string | null;
  lastGeneratedImage: {
    dataUrl: string;
    blob: Blob;
    width: number;
    height: number;
    timestamp: number;
  } | null;
}

export const useHtmlToImage = (options: UseHtmlToImageOptions = {}) => {
  const { defaultFilename = 'vietnamese-meme.png', defaultOptions = {} } = options;
  
  const [state, setState] = useState<HtmlToImageState>({
    isGenerating: false,
    error: null,
    lastGeneratedImage: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isGenerating: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const generateImage = useCallback(async (
    element: HTMLElement,
    customOptions?: HtmlToImageOptions
  ) => {
    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const mergedOptions = { ...defaultOptions, ...customOptions };
      const result = await HtmlToImageGenerator.generateImage(element, mergedOptions);
      
      // Check if operation was aborted
      if (abortControllerRef.current.signal.aborted) {
        return null;
      }

      const imageData = {
        dataUrl: result.dataUrl,
        blob: result.blob,
        width: result.width,
        height: result.height,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: null,
        lastGeneratedImage: imageData,
      }));

      return result;
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
        setError(errorMessage);
      }
      setLoading(false);
      return null;
    }
  }, [defaultOptions, setLoading, setError]);

  const downloadImage = useCallback(async (
    element: HTMLElement,
    filename?: string,
    customOptions?: HtmlToImageOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const finalFilename = filename || defaultFilename;
      const mergedOptions = { ...defaultOptions, ...customOptions };
      
      await HtmlToImageGenerator.downloadImage(element, finalFilename, mergedOptions);
      
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download image';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [defaultFilename, defaultOptions, setLoading, setError]);

  const getImageBlob = useCallback(async (
    element: HTMLElement,
    customOptions?: HtmlToImageOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const mergedOptions = { ...defaultOptions, ...customOptions };
      const blob = await HtmlToImageGenerator.getImageBlob(element, mergedOptions);
      
      setLoading(false);
      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get image blob';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [defaultOptions, setLoading, setError]);

  const generateImageByFormat = useCallback(async (
    element: HTMLElement,
    format: 'png' | 'jpeg' | 'svg' = 'png',
    customOptions?: HtmlToImageOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const mergedOptions = { ...defaultOptions, ...customOptions };
      const dataUrl = await HtmlToImageGenerator.generateImageByFormat(element, format, mergedOptions);
      
      setLoading(false);
      return dataUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to generate ${format} image`;
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [defaultOptions, setLoading, setError]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setError(null);
  }, [setLoading, setError]);

  const checkCompatibility = useCallback(() => {
    return HtmlToImageGenerator.checkBrowserCompatibility();
  }, []);

  const getOptimizedOptions = useCallback((element: HTMLElement) => {
    return HtmlToImageGenerator.getOptimizedOptions(element);
  }, []);

  return {
    // State
    isGenerating: state.isGenerating,
    error: state.error,
    lastGeneratedImage: state.lastGeneratedImage,
    
    // Actions
    generateImage,
    downloadImage,
    getImageBlob,
    generateImageByFormat,
    cancelGeneration,
    clearError,
    
    // Utilities
    checkCompatibility,
    getOptimizedOptions,
  };
};

export default useHtmlToImage;