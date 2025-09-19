import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScreenCapture } from '../useScreenCapture';
import * as ScreenCaptureGenerator from '../../services/ScreenCaptureGenerator';

// Mock the ScreenCaptureGenerator
vi.mock('../../services/ScreenCaptureGenerator', () => ({
  ScreenCaptureGenerator: {
    captureScreen: vi.fn(),
    downloadScreenCapture: vi.fn(),
    getScreenCaptureBlob: vi.fn(),
    checkBrowserCompatibility: vi.fn(),
  },
}));

const mockScreenCaptureGenerator = ScreenCaptureGenerator.ScreenCaptureGenerator as any;

describe('useScreenCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default successful mocks
    mockScreenCaptureGenerator.captureScreen.mockResolvedValue({
      canvas: document.createElement('canvas'),
      dataUrl: 'data:image/png;base64,mock-data',
      blob: new Blob(['mock'], { type: 'image/png' }),
      width: 1920,
      height: 1080,
    });
    
    mockScreenCaptureGenerator.downloadScreenCapture.mockResolvedValue(undefined);
    mockScreenCaptureGenerator.getScreenCaptureBlob.mockResolvedValue(
      new Blob(['mock'], { type: 'image/png' })
    );
    
    mockScreenCaptureGenerator.checkBrowserCompatibility.mockReturnValue({
      isSupported: true,
      missingFeatures: [],
      warnings: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useScreenCapture());

      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastCapturedImage).toBe(null);
    });

    it('should initialize with custom options', () => {
      const options = {
        defaultFilename: 'custom-screenshot.png',
        defaultOptions: { preferredWidth: 1280 },
      };

      const { result } = renderHook(() => useScreenCapture(options));

      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('captureScreen', () => {
    it('should capture screen successfully', async () => {
      const { result } = renderHook(() => useScreenCapture());

      await act(async () => {
        const captureResult = await result.current.captureScreen();
        expect(captureResult).toBeDefined();
      });

      expect(mockScreenCaptureGenerator.captureScreen).toHaveBeenCalledWith({});
      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastCapturedImage).toEqual({
        dataUrl: 'data:image/png;base64,mock-data',
        blob: expect.any(Blob),
        width: 1920,
        height: 1080,
        timestamp: expect.any(Number),
      });
    });

    it('should capture screen with custom options', async () => {
      const { result } = renderHook(() => useScreenCapture());
      const customOptions = { preferredWidth: 1280, preferredHeight: 720 };

      await act(async () => {
        await result.current.captureScreen(customOptions);
      });

      expect(mockScreenCaptureGenerator.captureScreen).toHaveBeenCalledWith(customOptions);
    });

    it('should handle capture errors', async () => {
      const errorMessage = 'Screen capture failed';
      mockScreenCaptureGenerator.captureScreen.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useScreenCapture());

      await act(async () => {
        const captureResult = await result.current.captureScreen();
        expect(captureResult).toBe(null);
      });

      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe('Screen capture failed');
      expect(result.current.lastCapturedImage).toBe(null);
    });

    it('should set loading state during capture', async () => {
      let resolveCapture: (value: any) => void;
      const capturePromise = new Promise((resolve) => {
        resolveCapture = resolve;
      });
      
      mockScreenCaptureGenerator.captureScreen.mockReturnValue(capturePromise);

      const { result } = renderHook(() => useScreenCapture());

      // Start capture
      act(() => {
        result.current.captureScreen();
      });

      // Should be loading
      expect(result.current.isCapturing).toBe(true);
      expect(result.current.error).toBe(null);

      // Complete capture
      await act(async () => {
        resolveCapture!({
          canvas: document.createElement('canvas'),
          dataUrl: 'data:image/png;base64,mock-data',
          blob: new Blob(['mock'], { type: 'image/png' }),
          width: 1920,
          height: 1080,
        });
        await capturePromise;
      });

      // Should no longer be loading
      expect(result.current.isCapturing).toBe(false);
    });
  });

  describe('downloadScreenCapture', () => {
    it('should download screen capture successfully', async () => {
      const { result } = renderHook(() => useScreenCapture());

      await act(async () => {
        const success = await result.current.downloadScreenCapture();
        expect(success).toBe(true);
      });

      expect(mockScreenCaptureGenerator.downloadScreenCapture).toHaveBeenCalledWith(
        'vietnamese-meme-screenshot.png',
        {}
      );
      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should download with custom filename and options', async () => {
      const { result } = renderHook(() => useScreenCapture());
      const customFilename = 'custom-meme.png';
      const customOptions = { preferredWidth: 1280 };

      await act(async () => {
        await result.current.downloadScreenCapture(customFilename, customOptions);
      });

      expect(mockScreenCaptureGenerator.downloadScreenCapture).toHaveBeenCalledWith(
        customFilename,
        customOptions
      );
    });

    it('should handle download errors', async () => {
      const errorMessage = 'Download failed';
      mockScreenCaptureGenerator.downloadScreenCapture.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useScreenCapture());

      await act(async () => {
        const success = await result.current.downloadScreenCapture();
        expect(success).toBe(false);
      });

      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe('Download failed');
    });

    it('should use default filename from options', async () => {
      const { result } = renderHook(() => 
        useScreenCapture({ defaultFilename: 'custom-default.png' })
      );

      await act(async () => {
        await result.current.downloadScreenCapture();
      });

      expect(mockScreenCaptureGenerator.downloadScreenCapture).toHaveBeenCalledWith(
        'custom-default.png',
        {}
      );
    });
  });

  describe('getScreenCaptureBlob', () => {
    it('should get screen capture blob successfully', async () => {
      const { result } = renderHook(() => useScreenCapture());

      await act(async () => {
        const blob = await result.current.getScreenCaptureBlob();
        expect(blob).toBeInstanceOf(Blob);
      });

      expect(mockScreenCaptureGenerator.getScreenCaptureBlob).toHaveBeenCalledWith({});
      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should get blob with custom options', async () => {
      const { result } = renderHook(() => useScreenCapture());
      const customOptions = { preferredWidth: 1280 };

      await act(async () => {
        await result.current.getScreenCaptureBlob(customOptions);
      });

      expect(mockScreenCaptureGenerator.getScreenCaptureBlob).toHaveBeenCalledWith(customOptions);
    });

    it('should handle blob generation errors', async () => {
      const errorMessage = 'Blob generation failed';
      mockScreenCaptureGenerator.getScreenCaptureBlob.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useScreenCapture());

      await act(async () => {
        const blob = await result.current.getScreenCaptureBlob();
        expect(blob).toBe(null);
      });

      expect(result.current.isCapturing).toBe(false);
      expect(result.current.error).toBe('Blob generation failed');
    });
  });

  describe('error handling', () => {
    it('should clear errors', async () => {
      mockScreenCaptureGenerator.captureScreen.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useScreenCapture());

      // Generate an error
      await act(async () => {
        await result.current.captureScreen();
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('checkCompatibility', () => {
    it('should check browser compatibility', () => {
      const { result } = renderHook(() => useScreenCapture());

      const compatibility = result.current.checkCompatibility();

      expect(mockScreenCaptureGenerator.checkBrowserCompatibility).toHaveBeenCalled();
      expect(compatibility).toEqual({
        isSupported: true,
        missingFeatures: [],
        warnings: [],
      });
    });
  });

  describe('state management', () => {
    it('should maintain separate state for multiple hook instances', async () => {
      const { result: result1 } = renderHook(() => useScreenCapture());
      const { result: result2 } = renderHook(() => useScreenCapture());

      // Start capture on first instance
      act(() => {
        result1.current.captureScreen();
      });

      expect(result1.current.isCapturing).toBe(true);
      expect(result2.current.isCapturing).toBe(false);
    });

    it('should preserve last captured image across operations', async () => {
      const { result } = renderHook(() => useScreenCapture());

      // First capture
      await act(async () => {
        await result.current.captureScreen();
      });

      const firstImage = result.current.lastCapturedImage;
      expect(firstImage).toBeDefined();

      // Download operation shouldn't affect last captured image
      await act(async () => {
        await result.current.downloadScreenCapture();
      });

      expect(result.current.lastCapturedImage).toBe(firstImage);
    });
  });
});