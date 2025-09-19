import { useState, useCallback } from 'react';
import { ScreenCaptureGenerator, ScreenCaptureOptions } from '../services/ScreenCaptureGenerator';

export interface UseScreenCaptureOptions {
  defaultFilename?: string;
  defaultOptions?: ScreenCaptureOptions;
}

export interface ScreenCaptureState {
  isCapturing: boolean;
  error: string | null;
  lastCapturedImage: {
    dataUrl: string;
    blob: Blob;
    width: number;
    height: number;
    timestamp: number;
  } | null;
}

export const useScreenCapture = (options: UseScreenCaptureOptions = {}) => {
  const { defaultFilename = 'vietnamese-meme-screenshot.png', defaultOptions = {} } = options;
  
  const [state, setState] = useState<ScreenCaptureState>({
    isCapturing: false,
    error: null,
    lastCapturedImage: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isCapturing: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const captureScreen = useCallback(async (
    customOptions?: ScreenCaptureOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const mergedOptions = { ...defaultOptions, ...customOptions };
      const result = await ScreenCaptureGenerator.captureScreen(mergedOptions);
      
      const imageData = {
        dataUrl: result.dataUrl,
        blob: result.blob,
        width: result.width,
        height: result.height,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        isCapturing: false,
        error: null,
        lastCapturedImage: imageData,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture screen';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [defaultOptions, setLoading, setError]);

  const downloadScreenCapture = useCallback(async (
    filename?: string,
    customOptions?: ScreenCaptureOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const finalFilename = filename || defaultFilename;
      const mergedOptions = { ...defaultOptions, ...customOptions };
      
      await ScreenCaptureGenerator.downloadScreenCapture(finalFilename, mergedOptions);
      
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download screen capture';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [defaultFilename, defaultOptions, setLoading, setError]);

  const getScreenCaptureBlob = useCallback(async (
    customOptions?: ScreenCaptureOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const mergedOptions = { ...defaultOptions, ...customOptions };
      const blob = await ScreenCaptureGenerator.getScreenCaptureBlob(mergedOptions);
      
      setLoading(false);
      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get screen capture blob';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [defaultOptions, setLoading, setError]);

  const checkCompatibility = useCallback(() => {
    return ScreenCaptureGenerator.checkBrowserCompatibility();
  }, []);

  return {
    // State
    isCapturing: state.isCapturing,
    error: state.error,
    lastCapturedImage: state.lastCapturedImage,
    
    // Actions
    captureScreen,
    downloadScreenCapture,
    getScreenCaptureBlob,
    clearError,
    
    // Utilities
    checkCompatibility,
  };
};

export default useScreenCapture;