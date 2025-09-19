import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageGeneration } from '../useImageGeneration';
import { ImageGenerator } from '../../services/ImageGenerator';

// Mock the ImageGenerator service
vi.mock('../../services/ImageGenerator');

const mockImageGenerator = ImageGenerator as any;

describe('useImageGeneration', () => {
  const mockElement = document.createElement('div');
  const mockBlob = new Blob(['test'], { type: 'image/png' });
  const mockResult = {
    canvas: document.createElement('canvas'),
    dataUrl: 'data:image/png;base64,test',
    blob: mockBlob,
    width: 400,
    height: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockImageGenerator.generateImage = vi.fn().mockResolvedValue(mockResult);
    mockImageGenerator.downloadImage = vi.fn().mockResolvedValue(undefined);
    mockImageGenerator.getImageBlob = vi.fn().mockResolvedValue(mockBlob);
    mockImageGenerator.checkBrowserCompatibility = vi.fn().mockReturnValue({
      isSupported: true,
      missingFeatures: [],
      warnings: [],
    });
    mockImageGenerator.getOptimizedOptions = vi.fn().mockReturnValue({
      scale: 2,
      backgroundColor: '#ffffff',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useImageGeneration());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastGeneratedImage).toBe(null);
    });
  });

  describe('generateImage', () => {
    it('generates image successfully', async () => {
      const { result } = renderHook(() => useImageGeneration());

      let generationResult;
      await act(async () => {
        generationResult = await result.current.generateImage(mockElement);
      });

      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith(mockElement, {});
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastGeneratedImage).toEqual({
        dataUrl: 'data:image/png;base64,test',
        blob: mockBlob,
        width: 400,
        height: 300,
        timestamp: expect.any(Number),
      });
      expect(generationResult).toBe(mockResult);
    });

    it('handles generation errors', async () => {
      const error = new Error('Generation failed');
      mockImageGenerator.generateImage.mockRejectedValue(error);

      const { result } = renderHook(() => useImageGeneration());

      await act(async () => {
        await result.current.generateImage(mockElement);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Generation failed');
      expect(result.current.lastGeneratedImage).toBe(null);
    });

    it('uses custom options', async () => {
      const { result } = renderHook(() => useImageGeneration());
      const customOptions = { scale: 1, backgroundColor: '#000000' };

      await act(async () => {
        await result.current.generateImage(mockElement, customOptions);
      });

      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith(mockElement, customOptions);
    });

    it('merges default options with custom options', async () => {
      const defaultOptions = { scale: 2, useCORS: true };
      const { result } = renderHook(() => useImageGeneration({ defaultOptions }));
      const customOptions = { backgroundColor: '#000000' };

      await act(async () => {
        await result.current.generateImage(mockElement, customOptions);
      });

      expect(mockImageGenerator.generateImage).toHaveBeenCalledWith(mockElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
      });
    });

    it('sets loading state during generation', async () => {
      let resolveGeneration: (value: any) => void;
      const generationPromise = new Promise(resolve => {
        resolveGeneration = resolve;
      });
      mockImageGenerator.generateImage.mockReturnValue(generationPromise);

      const { result } = renderHook(() => useImageGeneration());

      // Start generation
      act(() => {
        result.current.generateImage(mockElement);
      });

      expect(result.current.isGenerating).toBe(true);

      // Complete generation
      await act(async () => {
        resolveGeneration(mockResult);
        await generationPromise;
      });

      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('downloadImage', () => {
    it('downloads image successfully', async () => {
      const { result } = renderHook(() => useImageGeneration());

      let downloadResult;
      await act(async () => {
        downloadResult = await result.current.downloadImage(mockElement);
      });

      expect(mockImageGenerator.downloadImage).toHaveBeenCalledWith(
        mockElement,
        'vietnamese-meme.png',
        {}
      );
      expect(downloadResult).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('uses custom filename', async () => {
      const { result } = renderHook(() => useImageGeneration());

      await act(async () => {
        await result.current.downloadImage(mockElement, 'custom.png');
      });

      expect(mockImageGenerator.downloadImage).toHaveBeenCalledWith(
        mockElement,
        'custom.png',
        {}
      );
    });

    it('uses default filename from options', async () => {
      const { result } = renderHook(() => 
        useImageGeneration({ defaultFilename: 'default.png' })
      );

      await act(async () => {
        await result.current.downloadImage(mockElement);
      });

      expect(mockImageGenerator.downloadImage).toHaveBeenCalledWith(
        mockElement,
        'default.png',
        {}
      );
    });

    it('handles download errors', async () => {
      const error = new Error('Download failed');
      mockImageGenerator.downloadImage.mockRejectedValue(error);

      const { result } = renderHook(() => useImageGeneration());

      let downloadResult;
      await act(async () => {
        downloadResult = await result.current.downloadImage(mockElement);
      });

      expect(downloadResult).toBe(false);
      expect(result.current.error).toBe('Download failed');
    });
  });

  describe('getImageBlob', () => {
    it('gets image blob successfully', async () => {
      const { result } = renderHook(() => useImageGeneration());

      let blobResult;
      await act(async () => {
        blobResult = await result.current.getImageBlob(mockElement);
      });

      expect(mockImageGenerator.getImageBlob).toHaveBeenCalledWith(mockElement, {});
      expect(blobResult).toBe(mockBlob);
      expect(result.current.error).toBe(null);
    });

    it('handles blob generation errors', async () => {
      const error = new Error('Blob generation failed');
      mockImageGenerator.getImageBlob.mockRejectedValue(error);

      const { result } = renderHook(() => useImageGeneration());

      let blobResult;
      await act(async () => {
        blobResult = await result.current.getImageBlob(mockElement);
      });

      expect(blobResult).toBe(null);
      expect(result.current.error).toBe('Blob generation failed');
    });
  });

  describe('error handling', () => {
    it('clears error', () => {
      const { result } = renderHook(() => useImageGeneration());

      // Set an error first
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('clears error when starting new generation', async () => {
      const { result } = renderHook(() => useImageGeneration());

      // First, cause an error
      mockImageGenerator.generateImage.mockRejectedValueOnce(new Error('First error'));
      await act(async () => {
        await result.current.generateImage(mockElement);
      });
      expect(result.current.error).toBe('First error');

      // Then, start a new successful generation
      mockImageGenerator.generateImage.mockResolvedValueOnce(mockResult);
      await act(async () => {
        await result.current.generateImage(mockElement);
      });
      expect(result.current.error).toBe(null);
    });
  });

  describe('utility functions', () => {
    it('checks browser compatibility', () => {
      const { result } = renderHook(() => useImageGeneration());

      const compatibility = result.current.checkCompatibility();

      expect(mockImageGenerator.checkBrowserCompatibility).toHaveBeenCalled();
      expect(compatibility).toEqual({
        isSupported: true,
        missingFeatures: [],
        warnings: [],
      });
    });

    it('gets optimized options', () => {
      const { result } = renderHook(() => useImageGeneration());

      const options = result.current.getOptimizedOptions(mockElement);

      expect(mockImageGenerator.getOptimizedOptions).toHaveBeenCalledWith(mockElement);
      expect(options).toEqual({
        scale: 2,
        backgroundColor: '#ffffff',
      });
    });
  });

  describe('cancellation', () => {
    it('cancels generation', () => {
      const { result } = renderHook(() => useImageGeneration());

      // Start generation to set loading state
      act(() => {
        result.current.generateImage(mockElement);
      });
      expect(result.current.isGenerating).toBe(true);

      // Cancel generation
      act(() => {
        result.current.cancelGeneration();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});