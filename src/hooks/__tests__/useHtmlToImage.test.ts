import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHtmlToImage } from '../useHtmlToImage';
import * as HtmlToImageGenerator from '../../services/HtmlToImageGenerator';

// Mock the HtmlToImageGenerator
vi.mock('../../services/HtmlToImageGenerator', () => ({
  HtmlToImageGenerator: {
    generateImage: vi.fn(),
    downloadImage: vi.fn(),
    getImageBlob: vi.fn(),
    generateImageByFormat: vi.fn(),
    checkBrowserCompatibility: vi.fn(),
    getOptimizedOptions: vi.fn(),
  },
}));

const mockHtmlToImageGenerator = HtmlToImageGenerator.HtmlToImageGenerator as any;

describe('useHtmlToImage', () => {
  const mockElement = document.createElement('div');

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default successful mocks
    mockHtmlToImageGenerator.generateImage.mockResolvedValue({
      dataUrl: 'data:image/png;base64,mock-data',
      blob: new Blob(['mock'], { type: 'image/png' }),
      width: 800,
      height: 600,
    });
    
    mockHtmlToImageGenerator.downloadImage.mockResolvedValue(undefined);
    mockHtmlToImageGenerator.getImageBlob.mockResolvedValue(
      new Blob(['mock'], { type: 'image/png' })
    );
    
    mockHtmlToImageGenerator.generateImageByFormat.mockResolvedValue(
      'data:image/png;base64,mock-data'
    );
    
    mockHtmlToImageGenerator.checkBrowserCompatibility.mockReturnValue({
      isSupported: true,
      missingFeatures: [],
      warnings: [],
    });

    mockHtmlToImageGenerator.getOptimizedOptions.mockReturnValue({
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      quality: 1.0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useHtmlToImage());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastGeneratedImage).toBe(null);
    });

    it('should initialize with custom options', () => {
      const options = {
        defaultFilename: 'custom-image.png',
        defaultOptions: { pixelRatio: 1 },
      };

      const { result } = renderHook(() => useHtmlToImage(options));

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const imageResult = await result.current.generateImage(mockElement);
        expect(imageResult).toBeDefined();
      });

      expect(mockHtmlToImageGenerator.generateImage).toHaveBeenCalledWith(mockElement, {});
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastGeneratedImage).toEqual({
        dataUrl: 'data:image/png;base64,mock-data',
        blob: expect.any(Blob),
        width: 800,
        height: 600,
        timestamp: expect.any(Number),
      });
    });

    it('should generate image with custom options', async () => {
      const { result } = renderHook(() => useHtmlToImage());
      const customOptions = { pixelRatio: 1, backgroundColor: '#000000' };

      await act(async () => {
        await result.current.generateImage(mockElement, customOptions);
      });

      expect(mockHtmlToImageGenerator.generateImage).toHaveBeenCalledWith(mockElement, customOptions);
    });

    it('should handle generation errors', async () => {
      const errorMessage = 'Generation failed';
      mockHtmlToImageGenerator.generateImage.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const imageResult = await result.current.generateImage(mockElement);
        expect(imageResult).toBe(null);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Generation failed');
      expect(result.current.lastGeneratedImage).toBe(null);
    });

    it('should set loading state during generation', async () => {
      let resolveGeneration: (value: any) => void;
      const generationPromise = new Promise((resolve) => {
        resolveGeneration = resolve;
      });
      
      mockHtmlToImageGenerator.generateImage.mockReturnValue(generationPromise);

      const { result } = renderHook(() => useHtmlToImage());

      // Start generation
      act(() => {
        result.current.generateImage(mockElement);
      });

      // Should be loading
      expect(result.current.isGenerating).toBe(true);
      expect(result.current.error).toBe(null);

      // Complete generation
      await act(async () => {
        resolveGeneration!({
          dataUrl: 'data:image/png;base64,mock-data',
          blob: new Blob(['mock'], { type: 'image/png' }),
          width: 800,
          height: 600,
        });
        await generationPromise;
      });

      // Should no longer be loading
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('downloadImage', () => {
    it('should download image successfully', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const success = await result.current.downloadImage(mockElement);
        expect(success).toBe(true);
      });

      expect(mockHtmlToImageGenerator.downloadImage).toHaveBeenCalledWith(
        mockElement,
        'vietnamese-meme.png',
        {}
      );
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should download with custom filename and options', async () => {
      const { result } = renderHook(() => useHtmlToImage());
      const customFilename = 'custom-meme.png';
      const customOptions = { pixelRatio: 1 };

      await act(async () => {
        await result.current.downloadImage(mockElement, customFilename, customOptions);
      });

      expect(mockHtmlToImageGenerator.downloadImage).toHaveBeenCalledWith(
        mockElement,
        customFilename,
        customOptions
      );
    });

    it('should handle download errors', async () => {
      const errorMessage = 'Download failed';
      mockHtmlToImageGenerator.downloadImage.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const success = await result.current.downloadImage(mockElement);
        expect(success).toBe(false);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Download failed');
    });

    it('should use default filename from options', async () => {
      const { result } = renderHook(() => 
        useHtmlToImage({ defaultFilename: 'custom-default.png' })
      );

      await act(async () => {
        await result.current.downloadImage(mockElement);
      });

      expect(mockHtmlToImageGenerator.downloadImage).toHaveBeenCalledWith(
        mockElement,
        'custom-default.png',
        {}
      );
    });
  });

  describe('getImageBlob', () => {
    it('should get image blob successfully', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const blob = await result.current.getImageBlob(mockElement);
        expect(blob).toBeInstanceOf(Blob);
      });

      expect(mockHtmlToImageGenerator.getImageBlob).toHaveBeenCalledWith(mockElement, {});
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should get blob with custom options', async () => {
      const { result } = renderHook(() => useHtmlToImage());
      const customOptions = { pixelRatio: 1 };

      await act(async () => {
        await result.current.getImageBlob(mockElement, customOptions);
      });

      expect(mockHtmlToImageGenerator.getImageBlob).toHaveBeenCalledWith(mockElement, customOptions);
    });

    it('should handle blob generation errors', async () => {
      const errorMessage = 'Blob generation failed';
      mockHtmlToImageGenerator.getImageBlob.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const blob = await result.current.getImageBlob(mockElement);
        expect(blob).toBe(null);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Blob generation failed');
    });
  });

  describe('generateImageByFormat', () => {
    it('should generate image by format successfully', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const dataUrl = await result.current.generateImageByFormat(mockElement, 'png');
        expect(dataUrl).toBe('data:image/png;base64,mock-data');
      });

      expect(mockHtmlToImageGenerator.generateImageByFormat).toHaveBeenCalledWith(
        mockElement,
        'png',
        {}
      );
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should generate JPEG format', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        await result.current.generateImageByFormat(mockElement, 'jpeg');
      });

      expect(mockHtmlToImageGenerator.generateImageByFormat).toHaveBeenCalledWith(
        mockElement,
        'jpeg',
        {}
      );
    });

    it('should handle format generation errors', async () => {
      const errorMessage = 'Format generation failed';
      mockHtmlToImageGenerator.generateImageByFormat.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useHtmlToImage());

      await act(async () => {
        const dataUrl = await result.current.generateImageByFormat(mockElement, 'png');
        expect(dataUrl).toBe(null);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Format generation failed');
    });
  });

  describe('cancelGeneration', () => {
    it('should cancel ongoing generation', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      // Start generation
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

  describe('error handling', () => {
    it('should clear errors', async () => {
      mockHtmlToImageGenerator.generateImage.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useHtmlToImage());

      // Generate an error
      await act(async () => {
        await result.current.generateImage(mockElement);
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('utility functions', () => {
    it('should check browser compatibility', () => {
      const { result } = renderHook(() => useHtmlToImage());

      const compatibility = result.current.checkCompatibility();

      expect(mockHtmlToImageGenerator.checkBrowserCompatibility).toHaveBeenCalled();
      expect(compatibility).toEqual({
        isSupported: true,
        missingFeatures: [],
        warnings: [],
      });
    });

    it('should get optimized options', () => {
      const { result } = renderHook(() => useHtmlToImage());

      const options = result.current.getOptimizedOptions(mockElement);

      expect(mockHtmlToImageGenerator.getOptimizedOptions).toHaveBeenCalledWith(mockElement);
      expect(options).toEqual({
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1.0,
      });
    });
  });

  describe('state management', () => {
    it('should maintain separate state for multiple hook instances', async () => {
      const { result: result1 } = renderHook(() => useHtmlToImage());
      const { result: result2 } = renderHook(() => useHtmlToImage());

      // Start generation on first instance
      act(() => {
        result1.current.generateImage(mockElement);
      });

      expect(result1.current.isGenerating).toBe(true);
      expect(result2.current.isGenerating).toBe(false);
    });

    it('should preserve last generated image across operations', async () => {
      const { result } = renderHook(() => useHtmlToImage());

      // First generation
      await act(async () => {
        await result.current.generateImage(mockElement);
      });

      const firstImage = result.current.lastGeneratedImage;
      expect(firstImage).toBeDefined();

      // Download operation shouldn't affect last generated image
      await act(async () => {
        await result.current.downloadImage(mockElement);
      });

      expect(result.current.lastGeneratedImage).toBe(firstImage);
    });
  });
});